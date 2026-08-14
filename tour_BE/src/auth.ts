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

// ── 회원가입 ──
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, nickname, phone } = req.body ?? {};
  if (!email || !password || !nickname) {
    return res.status(400).json({ error: "이메일·비밀번호·닉네임을 모두 입력해주세요" });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "이미 가입된 이메일이에요" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      phone: phone ?? null,
      profile: { create: { nickname } },
      settings: { create: {} },
    },
    include: { profile: true },
  });

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, nickname: user.profile?.nickname },
  });
});

// ── 로그인 ──
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요" });
  }
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않아요" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않아요" });

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, nickname: user.profile?.nickname },
  });
});

// ── 내 정보 (토큰 필요) ──
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없어요" });
  res.json({
    id: user.id,
    email: user.email,
    nickname: user.profile?.nickname,
    level: user.profile?.level,
    levelTitle: user.profile?.levelTitle,
    expCurrent: user.profile?.expCurrent,
    expMax: user.profile?.expMax,
  });
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
