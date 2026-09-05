import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const TOKEN_TTL = "7d";

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/** 로그인/회원가입 응답에 담는 사용자 정보 (비밀번호 해시 등은 뺀다) */
function publicUser(user: {
  id: string;
  username: string;
  email: string | null;
  profile: { nickname: string } | null;
}) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.profile?.nickname ?? user.username,
  };
}

/** Authorization: Bearer <token> 검사 → req.userId 세팅 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "로그인이 필요해요" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "로그인이 만료되었어요. 다시 로그인해주세요" });
  }
}

/** 토큰이 있으면 req.userId 세팅, 없거나 틀려도 통과 (로그인 선택 기능용) */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
      (req as any).userId = payload.sub;
    } catch {
      /* 무시하고 비로그인으로 진행 */
    }
  }
  next();
}

// ── 아이디/닉네임 중복 확인 (회원가입 폼의 "중복 확인" 버튼) ──
router.get("/check-username", async (req: Request, res: Response) => {
  const username = typeof req.query.username === "string" ? req.query.username.trim() : "";
  if (!username) return res.status(400).json({ error: "아이디를 입력해주세요" });
  const taken = (await prisma.user.count({ where: { username } })) > 0;
  res.json({ taken });
});

router.get("/check-nickname", async (req: Request, res: Response) => {
  const nickname = typeof req.query.nickname === "string" ? req.query.nickname.trim() : "";
  if (!nickname) return res.status(400).json({ error: "닉네임을 입력해주세요" });
  const taken = (await prisma.userProfile.count({ where: { nickname } })) > 0;
  res.json({ taken });
});

// ── 회원가입 ──
router.post("/signup", async (req: Request, res: Response) => {
  const { username, password, nickname, email, phone } = req.body ?? {};
  if (!username || !password || !nickname) {
    return res.status(400).json({ error: "아이디·비밀번호·닉네임을 모두 입력해주세요" });
  }

  if (await prisma.user.findUnique({ where: { username } })) {
    return res.status(409).json({ error: "이미 사용 중인 아이디예요" });
  }
  // 이메일은 선택 입력이지만, 넣었다면 중복이면 안 된다
  if (email && (await prisma.user.findUnique({ where: { email } }))) {
    return res.status(409).json({ error: "이미 가입된 이메일이에요" });
  }
  if (await prisma.userProfile.findFirst({ where: { nickname } })) {
    return res.status(409).json({ error: "이미 사용 중인 닉네임이에요" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email: email || null,
      passwordHash,
      phone: phone ?? null,
      profile: { create: { nickname } },
      settings: { create: {} },
    },
    include: { profile: true },
  });

  const token = signToken(user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

// ── 로그인 ──
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요" });
  }
  const user = await prisma.user.findUnique({ where: { username }, include: { profile: true } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않아요" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않아요" });

  const token = signToken(user.id);
  res.json({ token, user: publicUser(user) });
});

// ── 내 정보 (토큰 필요) ──
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없어요" });
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    nickname: user.profile?.nickname,
    level: user.profile?.level,
    levelTitle: user.profile?.levelTitle,
    expCurrent: user.profile?.expCurrent,
    expMax: user.profile?.expMax,
  });
});

// ── 회원탈퇴 (토큰 필요) ──
// 관련 데이터(프로필·방문·미션·배지·글·댓글·좋아요)는 FK 의 onDelete: Cascade 로 함께 지워진다.
router.delete("/me", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없어요" });

  await prisma.user.delete({ where: { id: userId } });
  res.json({ ok: true });
});

// ── 휴대폰 인증코드 요청 (실제 SMS 연동 전 — 개발용으로 코드 반환) ──
router.post("/phone/request", async (req: Request, res: Response) => {
  const { phone } = req.body ?? {};
  if (!phone) return res.status(400).json({ error: "휴대폰 번호를 입력해주세요" });

  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6자리
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분
  await prisma.phoneVerification.create({ data: { phone, code, expiresAt } });

  // TODO: 실제 문자 발송(예: NHN Cloud, 알리고). 지금은 개발용으로 코드 직접 반환.
  res.json({ ok: true, devCode: code });
});

// ── 휴대폰 인증코드 확인 ──
router.post("/phone/verify", async (req: Request, res: Response) => {
  const { phone, code } = req.body ?? {};
  if (!phone || !code) return res.status(400).json({ error: "번호와 인증코드를 입력해주세요" });

  const record = await prisma.phoneVerification.findFirst({
    where: { phone, code, verified: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return res.status(400).json({ error: "인증코드가 올바르지 않거나 만료되었어요" });

  await prisma.phoneVerification.update({ where: { id: record.id }, data: { verified: true } });
  res.json({ ok: true });
});

export default router;
