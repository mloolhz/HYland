import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth } from "./auth";

const router = Router();

// ── 섬 방문 기록 (로그인 필요) — 섬 탐험 스탬프 획득 ──
// body: { islandId: "baek" }
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const { islandId } = req.body ?? {};
  if (!islandId) return res.status(400).json({ error: "islandId가 필요해요" });

  const island = await prisma.island.findUnique({ where: { id: islandId } });
  if (!island) return res.status(404).json({ error: "섬을 찾을 수 없어요" });

  // 이미 방문했으면 중복 생성 안 함 (userId+islandId 유니크)
  const existing = await prisma.userIslandVisit.findUnique({
    where: { userId_islandId: { userId, islandId } },
  });
  const isNew = !existing;
  if (isNew) {
    await prisma.userIslandVisit.create({ data: { userId, islandId } });
  }

  const total = await prisma.userIslandVisit.count({ where: { userId } });
  res.status(isNew ? 201 : 200).json({
    islandId,
    islandName: island.name,
    isNew, // 처음 방문이면 true (새 스탬프)
    totalVisited: total,
  });
});

// ── 내 방문한 섬 목록 (로그인 필요) ──
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const visits = await prisma.userIslandVisit.findMany({
    where: { userId },
    include: { island: true },
    orderBy: { visitedAt: "desc" },
  });
  res.json({
    total: visits.length,
    islands: visits.map((v) => ({
      islandId: v.islandId,
      name: v.island.name,
      visitedAt: v.visitedAt,
    })),
  });
});

export default router;
