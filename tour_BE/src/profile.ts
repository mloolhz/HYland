import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth } from "./auth";

const router = Router();

// ── 내 프로필 + 활동 요약 (로그인 필요) ──
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "프로필을 찾을 수 없어요" });

  const [visitedCount, completedMissions, badgeCount, btiCount] = await Promise.all([
    prisma.userIslandVisit.count({ where: { userId } }),
    prisma.userMissionProgress.count({ where: { userId, completedAt: { not: null } } }),
    prisma.userBadge.count({ where: { userId } }),
    prisma.userIslandBtiResult.count({ where: { userId } }),
  ]);

  res.json({
    userId: profile.userId,
    nickname: profile.nickname,
    // 가입일. 예전에는 프론트가 "2024-06-15" 를 하드코딩해서 여권 발급일과
    // 커뮤니티 프로필에 남의 날짜가 찍혔다.
    joinedAt: profile.joinedAt,
    level: profile.level,
    levelTitle: profile.levelTitle,
    expCurrent: profile.expCurrent,
    expMax: profile.expMax,
    bti: profile.bti,
    characterId: profile.characterId,
    passportAvatar: profile.passportAvatar,
    stats: { visitedCount, completedMissions, badgeCount, btiCount },
  });
});

// ── 프로필 수정 (로그인 필요) — 닉네임/캐릭터/아바타 ──
router.patch("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const { nickname, characterId, passportAvatar } = req.body ?? {};

  const data: Record<string, unknown> = {};
  if (typeof nickname === "string" && nickname.trim()) data.nickname = nickname.trim();
  if (typeof characterId === "string") data.characterId = characterId;
  if (typeof passportAvatar === "string") data.passportAvatar = passportAvatar;
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "수정할 값이 없어요" });
  }

  const updated = await prisma.userProfile.update({ where: { userId }, data });
  res.json({
    userId: updated.userId,
    nickname: updated.nickname,
    characterId: updated.characterId,
    passportAvatar: updated.passportAvatar,
  });
});

export default router;
