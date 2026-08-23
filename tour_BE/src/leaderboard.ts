import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";

const router = Router();

// ── 리더보드 (공개) — 방문 섬 수 + 완료 미션 수 기준 랭킹 ──
// ?limit=20 (기본 20)
router.get("/", async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  // 유저별 방문 섬 수
  const visitGroups = await prisma.userIslandVisit.groupBy({
    by: ["userId"],
    _count: { islandId: true },
  });
  // 유저별 완료 미션 수
  const missionGroups = await prisma.userMissionProgress.groupBy({
    by: ["userId"],
    where: { completedAt: { not: null } },
    _count: { questId: true },
  });

  const visitMap = Object.fromEntries(visitGroups.map((g) => [g.userId, g._count.islandId]));
  const missionMap = Object.fromEntries(missionGroups.map((g) => [g.userId, g._count.questId]));

  // 활동이 있는 유저만 대상
  const userIds = [...new Set([...Object.keys(visitMap), ...Object.keys(missionMap)])];
  if (userIds.length === 0) return res.json({ total: 0, ranking: [] });

  const profiles = await prisma.userProfile.findMany({ where: { userId: { in: userIds } } });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

  // 점수 = 방문섬 × 100 + 완료미션 × 50
  const ranked = userIds
    .map((id) => {
      const visited = visitMap[id] ?? 0;
      const missions = missionMap[id] ?? 0;
      return {
        userId: id,
        nickname: profileMap[id]?.nickname ?? "이름없음",
        level: profileMap[id]?.level ?? 1,
        visitedCount: visited,
        completedMissions: missions,
        score: visited * 100 + missions * 50,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }));

  res.json({ total: ranked.length, ranking: ranked });
});

export default router;
