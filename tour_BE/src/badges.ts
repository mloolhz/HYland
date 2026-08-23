import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth, optionalAuth } from "./auth";

const router = Router();

// ── 배지 목록 (?type=PASSPORT|ISLAND|MISSION, ?island= 필터, 로그인 시 획득여부 포함) ──
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const island = req.query.island as string | undefined;
  const badges = await prisma.badgeDefinition.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(island ? { islandId: island } : {}),
    },
    orderBy: { id: "asc" },
  });

  // 로그인 상태면 내가 획득한 배지 표시
  const userId = (req as any).userId as string | undefined;
  let earnedSet = new Set<string>();
  if (userId) {
    const mine = await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } });
    earnedSet = new Set(mine.map((m) => m.badgeId));
  }

  res.json(
    badges.map((b) => ({
      id: b.id,
      type: b.type,
      name: b.name,
      description: b.description,
      icon: b.icon,
      color: b.color,
      islandId: b.islandId,
      condition: b.condition,
      earned: earnedSet.has(b.id),
    })),
  );
});

// ── 내 획득 배지 (로그인 필요) ──
router.get("/my", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const mine = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { acquiredAt: "desc" },
  });
  res.json({
    total: mine.length,
    badges: mine.map((m) => ({
      id: m.badge.id,
      name: m.badge.name,
      type: m.badge.type,
      icon: m.badge.icon,
      color: m.badge.color,
      acquiredAt: m.acquiredAt,
    })),
  });
});

// ── 배지 획득 (로그인 필요) — 중복 획득 방지 ──
router.post("/:id/claim", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const badgeId = req.params.id;

  const badge = await prisma.badgeDefinition.findUnique({ where: { id: badgeId } });
  if (!badge) return res.status(404).json({ error: "배지를 찾을 수 없어요" });

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  });
  if (existing) {
    return res.status(200).json({ badgeId, name: badge.name, isNew: false, message: "이미 획득한 배지예요" });
  }

  await prisma.userBadge.create({ data: { userId, badgeId } });
  const total = await prisma.userBadge.count({ where: { userId } });
  res.status(201).json({ badgeId, name: badge.name, isNew: true, totalBadges: total });
});

export default router;
