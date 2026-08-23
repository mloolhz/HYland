import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth, optionalAuth } from "./auth";

const router = Router();

// ── 미션 카테고리 (섬/해상/육상/체험/힐링/기타) ──
router.get("/categories", async (_req: Request, res: Response) => {
  const cats = await prisma.missionCategory.findMany();
  res.json(cats);
});

// ── 미션 목록 (?category= 필터, 로그인 시 내 진행도 포함) ──
router.get("/", optionalAuth, async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const quests = await prisma.missionQuest.findMany({
    where: category ? { categoryId: category } : undefined,
    include: { category: true },
    orderBy: { id: "asc" },
  });

  // 로그인 상태면 내 진행도 맵 구성
  const userId = (req as any).userId as string | undefined;
  let progressMap: Record<number, { current: number; completedAt: Date | null }> = {};
  if (userId) {
    const rows = await prisma.userMissionProgress.findMany({ where: { userId } });
    progressMap = Object.fromEntries(
      rows.map((r) => [r.questId, { current: r.current, completedAt: r.completedAt }]),
    );
  }

  res.json(
    quests.map((q) => {
      const p = progressMap[q.id];
      return {
        id: q.id,
        category: q.categoryId,
        categoryEmoji: q.category.emoji,
        categoryColor: q.category.color,
        icon: q.icon,
        title: q.title,
        description: q.description,
        target: q.target,
        unit: q.unit,
        reward: q.reward,
        tier: q.tier,
        islandId: q.islandId,
        sportId: q.sportId,
        current: p?.current ?? 0,
        completed: !!p?.completedAt,
      };
    }),
  );
});

// ── 미션 상세 ──
router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "잘못된 미션 id예요" });
  const q = await prisma.missionQuest.findUnique({ where: { id }, include: { category: true } });
  if (!q) return res.status(404).json({ error: "미션을 찾을 수 없어요" });
  res.json(q);
});

// ── 미션 진행도 갱신 (로그인 필요) ──
// body: { current?: number }  또는  { increment?: number }
router.post("/:id/progress", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const questId = Number(req.params.id);
  if (Number.isNaN(questId)) return res.status(400).json({ error: "잘못된 미션 id예요" });

  const quest = await prisma.missionQuest.findUnique({ where: { id: questId } });
  if (!quest) return res.status(404).json({ error: "미션을 찾을 수 없어요" });

  const { current, increment } = req.body ?? {};
  const existing = await prisma.userMissionProgress.findUnique({
    where: { userId_questId: { userId, questId } },
  });

  // 새 진행도 계산
  let next: number;
  if (typeof current === "number") next = current;
  else if (typeof increment === "number") next = (existing?.current ?? 0) + increment;
  else return res.status(400).json({ error: "current 또는 increment 값이 필요해요" });

  next = Math.max(0, Math.min(next, quest.target)); // 0 ~ target 범위로 고정
  const justCompleted = next >= quest.target;
  const completedAt = justCompleted ? (existing?.completedAt ?? new Date()) : null;

  const saved = await prisma.userMissionProgress.upsert({
    where: { userId_questId: { userId, questId } },
    create: { userId, questId, current: next, completedAt },
    update: { current: next, completedAt },
  });

  res.json({
    questId,
    current: saved.current,
    target: quest.target,
    completed: !!saved.completedAt,
    reward: justCompleted ? quest.reward : null,
  });
});

// ── 내 미션 진행 현황 (로그인 필요) ──
router.get("/my/progress", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const rows = await prisma.userMissionProgress.findMany({
    where: { userId },
    include: { quest: true },
    orderBy: { questId: "asc" },
  });
  const completed = rows.filter((r) => r.completedAt).length;
  res.json({
    total: rows.length,
    completed,
    items: rows.map((r) => ({
      questId: r.questId,
      title: r.quest.title,
      current: r.current,
      target: r.quest.target,
      completed: !!r.completedAt,
    })),
  });
});

export default router;
