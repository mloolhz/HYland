/**
 * 리더보드 (공개)
 *
 *   GET /leaderboard              전체 순위 — 획득 배지 수 기준
 *   GET /leaderboard/categories   미션 카테고리별 순위
 *
 * 점수를 따로 매기지 않고 획득 배지 수를 그대로 쓴다. 미션을 완료해야 배지가
 * 나오므로 미션 진행도와 저절로 맞고, 화면에 보이는 "배지 n개" 와 순위 근거가
 * 같아 설명할 것이 없다. (예전에는 방문×100 + 미션×50 이라는 별도 점수였는데,
 * 미션 화면 어디에도 그 숫자가 없어서 어떻게 나온 순위인지 알 수 없었다.)
 */
import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";

const router = Router();

/** 프로필이 없는 유저는 이름을 못 그리므로 목록에서 뺀다 */
type Ranked = {
  rank: number;
  userId: string;
  nickname: string;
  level: number;
  badgeCount: number;
  visitedCount: number;
  completedMissions: number;
};

// ── 전체 순위 ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [badgeGroups, visitGroups, missionGroups] = await Promise.all([
      prisma.userBadge.groupBy({ by: ["userId"], _count: { badgeId: true } }),
      prisma.userIslandVisit.groupBy({ by: ["userId"], _count: { islandId: true } }),
      prisma.userMissionProgress.groupBy({
        by: ["userId"],
        where: { completedAt: { not: null } },
        _count: { questId: true },
      }),
    ]);

    const badge = new Map(badgeGroups.map((g) => [g.userId, g._count.badgeId]));
    const visit = new Map(visitGroups.map((g) => [g.userId, g._count.islandId]));
    const mission = new Map(missionGroups.map((g) => [g.userId, g._count.questId]));

    const userIds = [...new Set([...badge.keys(), ...visit.keys(), ...mission.keys()])];
    if (userIds.length === 0) return res.json({ total: 0, ranking: [] });

    const profiles = await prisma.userProfile.findMany({ where: { userId: { in: userIds } } });
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    const ranked: Ranked[] = userIds
      .filter((id) => profileMap.has(id))
      .map((id) => ({
        rank: 0,
        userId: id,
        nickname: profileMap.get(id)!.nickname,
        level: profileMap.get(id)!.level,
        badgeCount: badge.get(id) ?? 0,
        visitedCount: visit.get(id) ?? 0,
        completedMissions: mission.get(id) ?? 0,
      }))
      // 배지 수가 같으면 방문한 섬이 많은 쪽을 앞에 둔다
      .sort((a, b) => b.badgeCount - a.badgeCount || b.visitedCount - a.visitedCount)
      .slice(0, limit)
      .map((row, i) => ({ ...row, rank: i + 1 }));

    res.json({ total: ranked.length, ranking: ranked });
  } catch (err) {
    console.error("리더보드 조회 실패:", err);
    res.status(500).json({ error: "순위를 불러오지 못했어요." });
  }
});

// ── 카테고리별 순위 ──
// 미션은 카테고리를 가지고 있으므로, 완료한 미션을 카테고리로 묶으면
// 그대로 카테고리별 배지 수가 된다.
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const rows = await prisma.userMissionProgress.findMany({
      where: { completedAt: { not: null } },
      include: { quest: { select: { categoryId: true } } },
    });

    /** category → (userId → 개수) */
    const byCategory = new Map<string, Map<string, number>>();
    for (const r of rows) {
      const cat = r.quest.categoryId;
      if (!byCategory.has(cat)) byCategory.set(cat, new Map());
      const m = byCategory.get(cat)!;
      m.set(r.userId, (m.get(r.userId) ?? 0) + 1);
    }

    const userIds = [...new Set(rows.map((r) => r.userId))];
    const profiles = await prisma.userProfile.findMany({ where: { userId: { in: userIds } } });
    const nameOf = new Map(profiles.map((p) => [p.userId, p.nickname]));

    const categories = await prisma.missionCategory.findMany({ select: { id: true } });
    const result: Record<string, { rank: number; userId: string; nickname: string; badgeCount: number }[]> =
      {};
    for (const { id: cat } of categories) {
      const m = byCategory.get(cat);
      result[cat] = !m
        ? []
        : [...m]
            .filter(([userId]) => nameOf.has(userId))
            .map(([userId, badgeCount]) => ({ rank: 0, userId, nickname: nameOf.get(userId)!, badgeCount }))
            .sort((a, b) => b.badgeCount - a.badgeCount)
            .slice(0, limit)
            .map((row, i) => ({ ...row, rank: i + 1 }));
    }

    res.json({ categories: result });
  } catch (err) {
    console.error("카테고리 리더보드 조회 실패:", err);
    res.status(500).json({ error: "카테고리 순위를 불러오지 못했어요." });
  }
});

export default router;
