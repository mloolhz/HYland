/**
 * 간편 로그인 (구글 · 카카오)
 *
 *   GET  /auth/oauth/providers        어떤 제공사가 켜져 있는지 (버튼 노출 판단)
 *   GET  /auth/oauth/:provider/url    동의 화면 주소 발급
 *   POST /auth/oauth/:provider        code → 우리 JWT
 *
 * 토큰 교환은 반드시 서버에서 한다 — 시크릿이 브라우저로 나가면 안 된다.
 * 프론트는 code 만 넘기고 우리 JWT 를 받아 기존 로그인 흐름을 그대로 쓴다.
 *
 * 키가 없으면 그 제공사는 꺼진 것으로 보고 400 을 준다. 화면은 providers 를
 * 먼저 물어보고 켜진 버튼만 보여준다.
 *
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   KAKAO_REST_API_KEY, KAKAO_CLIENT_SECRET(선택)
 *   OAUTH_REDIRECT_BASE  기본 http://localhost:5173
 */
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const REDIRECT_BASE = process.env.OAUTH_REDIRECT_BASE || "http://localhost:5173";

type ProviderId = "google" | "kakao";

type ProfileFromProvider = {
  /** 제공사에서의 고유 id */
  uid: string;
  nickname: string;
  email: string | null;
};

type ProviderConfig = {
  label: string;
  clientId: string;
  clientSecret: string;
  /** 카카오는 시크릿이 선택 사항이라 없어도 켜진 것으로 본다 */
  secretRequired: boolean;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  profile: (accessToken: string) => Promise<ProfileFromProvider>;
};

const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  google: {
    label: "구글",
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    secretRequired: true,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    async profile(accessToken) {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = (await res.json()) as any;
      if (!res.ok || !me?.sub) throw new Error(me?.error_description ?? "구글 프로필 조회 실패");
      return {
        uid: String(me.sub),
        nickname: me.name || me.given_name || "탐험가",
        email: me.email ?? null,
      };
    },
  },
  kakao: {
    label: "카카오",
    clientId: process.env.KAKAO_REST_API_KEY ?? "",
    clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    secretRequired: false,
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    tokenUrl: "https://kauth.kakao.com/oauth/token",
    // 이메일은 비즈앱 심사가 필요해서 넣지 않는다 — 없어도 가입은 된다
    scope: "profile_nickname",
    async profile(accessToken) {
      const res = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const me = (await res.json()) as any;
      if (!res.ok || !me?.id) throw new Error(me?.msg ?? "카카오 프로필 조회 실패");
      return {
        uid: String(me.id),
        nickname: me.kakao_account?.profile?.nickname || "탐험가",
        email: me.kakao_account?.email ?? null,
      };
    },
  },
};

function isEnabled(p: ProviderConfig): boolean {
  return Boolean(p.clientId) && (!p.secretRequired || Boolean(p.clientSecret));
}

function resolve(name: string): { id: ProviderId; config: ProviderConfig } | null {
  const id = name as ProviderId;
  const config = PROVIDERS[id];
  return config ? { id, config } : null;
}

function redirectUri(id: ProviderId): string {
  return `${REDIRECT_BASE}/oauth/callback/${id}`;
}

/** 닉네임이 겹치면 뒤에 숫자를 붙인다 — 카카오 닉네임은 잘 겹친다 */
async function uniqueNickname(base: string): Promise<string> {
  const clean = base.trim().slice(0, 20) || "탐험가";
  if (!(await prisma.userProfile.findFirst({ where: { nickname: clean } }))) return clean;
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${clean}${i}`;
    if (!(await prisma.userProfile.findFirst({ where: { nickname: candidate } }))) return candidate;
  }
  return `${clean}${Date.now().toString().slice(-5)}`;
}

// ─────────────────────── 켜진 제공사 ───────────────────────

router.get("/providers", (_req: Request, res: Response) => {
  res.json({
    providers: (Object.keys(PROVIDERS) as ProviderId[])
      .filter((id) => isEnabled(PROVIDERS[id]))
      .map((id) => ({ id, label: PROVIDERS[id].label })),
  });
});

// ─────────────────────── 동의 화면 주소 ───────────────────────

router.get("/:provider/url", (req: Request, res: Response) => {
  const found = resolve(String(req.params.provider));
  if (!found) return res.status(404).json({ error: "지원하지 않는 로그인이에요" });
  if (!isEnabled(found.config)) {
    return res.status(400).json({ error: `${found.config.label} 로그인이 아직 설정되지 않았어요` });
  }

  // state 는 프론트가 돌려받아 대조한다 (CSRF 방지)
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const params = new URLSearchParams({
    client_id: found.config.clientId,
    redirect_uri: redirectUri(found.id),
    response_type: "code",
    scope: found.config.scope,
    ...(state ? { state } : {}),
  });
  res.json({ url: `${found.config.authUrl}?${params.toString()}` });
});

// ─────────────────────── code → 우리 JWT ───────────────────────

router.post("/:provider", async (req: Request, res: Response) => {
  const found = resolve(String(req.params.provider));
  if (!found) return res.status(404).json({ error: "지원하지 않는 로그인이에요" });
  const { id, config } = found;
  if (!isEnabled(config)) {
    return res.status(400).json({ error: `${config.label} 로그인이 아직 설정되지 않았어요` });
  }

  const { code } = req.body ?? {};
  if (!code) return res.status(400).json({ error: "인증 코드가 필요해요" });

  try {
    // 1) code → 액세스 토큰
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      redirect_uri: redirectUri(id),
      code: String(code),
      ...(config.clientSecret ? { client_secret: config.clientSecret } : {}),
    });
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const tokenBody = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenBody?.access_token) {
      const reason = tokenBody?.error_description ?? tokenBody?.error ?? "토큰 발급 실패";
      console.error(`${id} 토큰 교환 실패:`, reason);
      return res.status(401).json({ error: `${config.label} 로그인에 실패했어요` });
    }

    // 2) 프로필 조회
    const profile = await config.profile(tokenBody.access_token);

    // 3) 이미 연결된 계정이면 그대로 로그인
    const linked = await prisma.oAuthAccount.findUnique({
      where: { provider_providerUid: { provider: id, providerUid: profile.uid } },
      include: { user: { include: { profile: true } } },
    });

    let user = linked?.user ?? null;
    let isNew = false;

    if (!user) {
      /**
       * 같은 이메일로 아이디 가입을 해 둔 사람이면 그 계정에 잇는다.
       * 안 그러면 한 사람이 계정 두 개를 갖게 된다.
       */
      const byEmail = profile.email
        ? await prisma.user.findUnique({
            where: { email: profile.email },
            include: { profile: true },
          })
        : null;

      if (byEmail) {
        await prisma.oAuthAccount.create({
          data: { userId: byEmail.id, provider: id, providerUid: profile.uid },
        });
        user = byEmail;
      } else {
        // 새 계정 — 아이디·비밀번호는 없다 (username 은 NOT NULL 이라 만들어 넣는다)
        const nickname = await uniqueNickname(profile.nickname);
        const created = await prisma.user.create({
          data: {
            username: `${id}_${profile.uid}`,
            email: profile.email,
            passwordHash: null,
            profile: { create: { nickname } },
            settings: { create: {} },
            oauthAccounts: { create: { provider: id, providerUid: profile.uid } },
          },
          include: { profile: true },
        });
        user = created;
        isNew = true;
      }
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.profile?.nickname ?? user.username,
      },
      /** 처음 가입한 사람에게는 닉네임을 확인받는다 */
      isNew,
    });
  } catch (err) {
    console.error(`${id} 로그인 실패:`, err);
    res.status(500).json({ error: `${config.label} 로그인 중 문제가 생겼어요` });
  }
});

export default router;
