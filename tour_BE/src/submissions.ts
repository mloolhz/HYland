/**
 * 미션 인증 검수
 *
 * 유저: 커뮤니티에 인증샷을 올리며 미션을 지정해 제출한다.
 * 관리자: 사진을 보고 승인/반려한다. 승인하면 미션 진행도가 오르고,
 *        목표를 채우면 배지가 지급된다.
 *
 *   POST /submissions                   인증 제출            (로그인)
 *   GET  /submissions/my                내 제출 목록         (로그인)
 *   GET  /submissions/pending           검수 대기 목록        (ADMIN)
 *   POST /submissions/:id/approve       승인 → 진행도·배지    (ADMIN)
 *   POST /submissions/:id/reject        반려                 (ADMIN)
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "./prisma";
import { requireAuth } from "./auth";
import { notify } from "./notifications";

const router = Router();
const uid = (req: Request) => (req as any).userId as string;

/** ADMIN 만 통과 — requireAuth 뒤에 붙여 쓴다 */
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({
    where: { id: uid(req) },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ error: "검수 권한이 없어요" });
  }
  next();
}

const submissionInclude = {
  quest: { select: { id: true, title: true, icon: true, target: true, unit: true, reward: true } },
  user: { select: { id: true, profile: { select: { nickname: true } } } },
  post: {
    select: {
      id: true,
      title: true,
      content: true,
      island: true,
      activity: true,
      createdAt: true,
      images: { orderBy: { sortOrder: "asc" as const }, select: { url: true } },
    },
  },
} as const;

type SubmissionRow = {
  id: string;
  status: string;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  quest: { id: number; title: string; icon: string; target: number; unit: string; reward: string };
  user: { id: string; profile: { nickname: string } | null };
  post: {
    id: string;
    title: string;
    content: string;
    island: string;
    activity: string;
    createdAt: Date;
    images: { url: string }[];
  };
};

function shape(s: SubmissionRow) {
  return {
    id: s.id,
    status: s.status,
    reviewNote: s.reviewNote,
    reviewedAt: s.reviewedAt,
    createdAt: s.createdAt,
    quest: s.quest,
    user: { id: s.user.id, nickname: s.user.profile?.nickname ?? "알 수 없음" },
    post: {
      id: s.post.id,
      title: s.post.title,
      content: s.post.content,
      island: s.post.island,
      activity: s.post.activity,
      createdAt: s.post.createdAt,
      images: s.post.images.map((i) => i.url),
    },
  };
}

// ─────────────────────── 인증 제출 ───────────────────────

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const me = uid(req);
    const { postId, questId } = req.body ?? {};
    if (!postId || questId === undefined) {
      return res.status(400).json({ error: "postId 와 questId 가 필요해요" });
    }

    const [post, quest] = await Promise.all([
      prisma.post.findUnique({ where: { id: String(postId) }, include: { images: true } }),
      prisma.missionQuest.findUnique({ where: { id: Number(questId) } }),
    ]);
    if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요" });
    if (!quest) return res.status(404).json({ error: "미션을 찾을 수 없어요" });
    if (post.authorId !== me) {
      return res.status(403).json({ error: "내가 쓴 글만 인증으로 제출할 수 있어요" });
    }
    // 사진이 인증 근거라 없으면 검수할 것이 없다
    if (post.images.length === 0) {
      return res.status(400).json({ error: "인증샷이 있어야 미션 인증으로 제출할 수 있어요" });
    }

    const dup = await prisma.missionSubmission.findUnique({
      where: { postId_questId: { postId: post.id, questId: quest.id } },
    });
    if (dup) return res.status(409).json({ error: "이미 제출한 인증이에요" });

    const created = await prisma.missionSubmission.create({
      data: { userId: me, postId: post.id, questId: quest.id },
      include: submissionInclude,
    });
    res.status(201).json(shape(created));
  } catch (err) {
    console.error("인증 제출 실패:", err);
    res.status(500).json({ error: "인증을 제출하지 못했어요." });
  }
});

// ─────────────────────── 내 제출 목록 ───────────────────────

router.get("/my", requireAuth, async (req: Request, res: Response) => {
  const rows = await prisma.missionSubmission.findMany({
    where: { userId: uid(req) },
    orderBy: { createdAt: "desc" },
    include: submissionInclude,
  });
  res.json({ total: rows.length, submissions: rows.map(shape) });
});

// ─────────────────────── 검수 대기 ───────────────────────

router.get("/pending", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : "PENDING";
  const rows = await prisma.missionSubmission.findMany({
    where: status === "ALL" ? {} : { status: status as never },
    orderBy: { createdAt: "asc" }, // 오래 기다린 것부터
    include: submissionInclude,
  });
  res.json({ total: rows.length, submissions: rows.map(shape) });
});

// ─────────────────────── 승인 ───────────────────────

router.post("/:id/approve", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const admin = uid(req);
    const sub = await prisma.missionSubmission.findUnique({
      where: { id: String(req.params.id) },
      include: { quest: true },
    });
    if (!sub) return res.status(404).json({ error: "제출을 찾을 수 없어요" });
    if (sub.status !== "PENDING") {
      return res.status(409).json({ error: "이미 처리된 제출이에요" });
    }

    // 진행도 +1 → 목표를 채우면 배지 지급까지 한 트랜잭션으로 묶는다
    const result = await prisma.$transaction(async (tx) => {
      await tx.missionSubmission.update({
        where: { id: sub.id },
        data: { status: "APPROVED", reviewedBy: admin, reviewedAt: new Date() },
      });

      const prev = await tx.userMissionProgress.findUnique({
        where: { userId_questId: { userId: sub.userId, questId: sub.questId } },
      });
      const current = Math.min((prev?.current ?? 0) + 1, sub.quest.target);
      const completed = current >= sub.quest.target;

      await tx.userMissionProgress.upsert({
        where: { userId_questId: { userId: sub.userId, questId: sub.questId } },
        update: { current, completedAt: completed ? (prev?.completedAt ?? new Date()) : null },
        create: {
          userId: sub.userId,
          questId: sub.questId,
          current,
          completedAt: completed ? new Date() : null,
        },
      });

      /**
       * 섬 방문 미션이면 방문 기록도 남긴다.
       * 여권의 "방문 섬"과 섬 지도의 방문 표시가 이 테이블을 본다. 인증이
       * 승인돼야만 방문으로 치므로, 유저가 스스로 방문을 주장할 수는 없다.
       */
      let visitedIsland: string | null = null;
      if (sub.quest.islandId) {
        const already = await tx.userIslandVisit.findUnique({
          where: { userId_islandId: { userId: sub.userId, islandId: sub.quest.islandId } },
        });
        if (!already) {
          await tx.userIslandVisit.create({
            data: { userId: sub.userId, islandId: sub.quest.islandId },
          });
          visitedIsland = sub.quest.islandId;
        }
      }

      // 목표를 채웠으면 배지를 준다. 이미 있으면 그대로 둔다.
      let badgeGranted: string | null = null;
      if (completed) {
        const badgeId = `mission-${sub.questId}`;
        const badge = await tx.badgeDefinition.findUnique({ where: { id: badgeId } });
        if (badge) {
          const has = await tx.userBadge.findUnique({
            where: { userId_badgeId: { userId: sub.userId, badgeId } },
          });
          if (!has) {
            await tx.userBadge.create({ data: { userId: sub.userId, badgeId } });
            badgeGranted = badge.name;
          }
        }
      }

      return { current, target: sub.quest.target, completed, badgeGranted, visitedIsland };
    });

    // 트랜잭션 밖에서 알린다 — 알림 실패가 승인을 되돌리면 안 된다
    await notify({
      userId: sub.userId,
      type: "REVIEW",
      message: `"${sub.quest.title}" 인증이 승인되었어요 (${result.current}/${result.target})`,
      link: "/missions",
    });
    if (result.badgeGranted) {
      await notify({
        userId: sub.userId,
        type: "BADGE",
        message: "새로운 배지 {highlight}를 획득했어요",
        highlight: result.badgeGranted,
        link: "/mypage",
      });
    }

    res.json({ id: sub.id, status: "APPROVED", ...result });
  } catch (err) {
    console.error("인증 승인 실패:", err);
    res.status(500).json({ error: "승인 처리에 실패했어요." });
  }
});

// ─────────────────────── 반려 ───────────────────────

router.post("/:id/reject", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const admin = uid(req);
  const { reason } = req.body ?? {};
  const sub = await prisma.missionSubmission.findUnique({ where: { id: String(req.params.id) } });
  if (!sub) return res.status(404).json({ error: "제출을 찾을 수 없어요" });
  if (sub.status !== "PENDING") return res.status(409).json({ error: "이미 처리된 제출이에요" });

  await prisma.missionSubmission.update({
    where: { id: sub.id },
    data: {
      status: "REJECTED",
      reviewNote: typeof reason === "string" && reason.trim() ? reason.trim() : null,
      reviewedBy: admin,
      reviewedAt: new Date(),
    },
  });
  const quest = await prisma.missionQuest.findUnique({ where: { id: sub.questId } });
  await notify({
    userId: sub.userId,
    type: "REVIEW",
    message: `"${quest?.title ?? "미션"}" 인증이 반려되었어요`,
    highlight: typeof reason === "string" && reason.trim() ? reason.trim() : undefined,
    link: "/community",
  });

  res.json({ id: sub.id, status: "REJECTED" });
});

export default router;
