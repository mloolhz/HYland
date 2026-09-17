/**
 * 커뮤니티 신고
 *
 *   POST  /reports              글·댓글 신고            (로그인)
 *   GET   /reports              신고 목록               (ADMIN)
 *   GET   /reports/count        미처리 건수             (ADMIN) — 헤더 배지용
 *   PATCH /reports/:id          처리 상태 변경           (ADMIN)
 *
 * 신고당한 글이 지워지면 신고도 함께 사라진다(스키마의 onDelete: Cascade).
 * 이미 정리된 내용을 목록에 남겨 둘 이유가 없다.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "./prisma";
import { requireAuth } from "./auth";

const router = Router();
const uid = (req: Request) => (req as any).userId as string;

/** 화면의 선택지와 같은 목록 — 여기에 없는 값은 받지 않는다 */
export const REPORT_REASONS = {
  spam: "스팸·도배",
  abuse: "욕설·혐오 표현",
  ad: "광고·홍보",
  false: "허위 정보",
  privacy: "개인정보 노출",
  etc: "기타",
} as const;

type ReasonCode = keyof typeof REPORT_REASONS;

/** ADMIN 만 통과 — requireAuth 뒤에 붙여 쓴다 */
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({
    where: { id: uid(req) },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ error: "신고를 볼 권한이 없어요" });
  }
  next();
}

// ─────────────── 신고 접수 ───────────────

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const me = uid(req);
  const { target, targetId, reason, detail } = req.body ?? {};

  if (target !== "POST" && target !== "COMMENT") {
    return res.status(400).json({ error: "신고 대상이 올바르지 않아요" });
  }
  if (!targetId || typeof targetId !== "string") {
    return res.status(400).json({ error: "신고 대상이 올바르지 않아요" });
  }
  if (!reason || !(reason in REPORT_REASONS)) {
    return res.status(400).json({ error: "신고 사유를 선택해주세요" });
  }

  // 대상이 실제로 있는지, 그리고 내 글은 아닌지 확인한다
  const authorId =
    target === "POST"
      ? (await prisma.post.findUnique({ where: { id: targetId }, select: { authorId: true } }))
          ?.authorId
      : (await prisma.comment.findUnique({ where: { id: targetId }, select: { authorId: true } }))
          ?.authorId;

  if (!authorId) {
    return res.status(404).json({ error: "이미 삭제된 글이에요" });
  }
  if (authorId === me) {
    return res.status(400).json({ error: "내 글은 신고할 수 없어요" });
  }

  /**
   * 같은 사람이 같은 대상을 거듭 신고하지 못하게 막는다.
   * MySQL 은 NULL 이 섞인 복합 unique 를 중복으로 보지 않아서
   * (post_id·comment_id 중 하나는 항상 NULL) 코드로 확인한다.
   */
  const already = await prisma.report.findFirst({
    where: {
      reporterId: me,
      status: "PENDING",
      ...(target === "POST" ? { postId: targetId } : { commentId: targetId }),
    },
    select: { id: true },
  });
  if (already) {
    return res.status(409).json({ error: "이미 신고한 글이에요. 확인 중입니다." });
  }

  await prisma.report.create({
    data: {
      target,
      postId: target === "POST" ? targetId : null,
      commentId: target === "COMMENT" ? targetId : null,
      reporterId: me,
      reason: reason as ReasonCode,
      detail: typeof detail === "string" && detail.trim() ? detail.trim().slice(0, 500) : null,
    },
  });

  res.status(201).json({ ok: true });
});

// ─────────────── 관리자 ───────────────

const reportInclude = {
  reporter: { select: { id: true, profile: { select: { nickname: true } } } },
  handler: { select: { id: true, profile: { select: { nickname: true } } } },
  post: {
    select: {
      id: true,
      title: true,
      content: true,
      island: true,
      createdAt: true,
      author: { select: { id: true, profile: { select: { nickname: true } } } },
    },
  },
  comment: {
    select: {
      id: true,
      postId: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, profile: { select: { nickname: true } } } },
    },
  },
} as const;

/** 목록 화면이 쓰기 좋은 모양으로 눕힌다 */
function shape(r: any) {
  const content = r.target === "POST" ? r.post : r.comment;
  return {
    id: r.id,
    target: r.target as "POST" | "COMMENT",
    reason: r.reason,
    reasonLabel: REPORT_REASONS[r.reason as ReasonCode] ?? r.reason,
    detail: r.detail,
    status: r.status as "PENDING" | "RESOLVED" | "DISMISSED",
    createdAt: r.createdAt,
    handledAt: r.handledAt,
    handleNote: r.handleNote,
    reporter: {
      id: r.reporter.id,
      nickname: r.reporter.profile?.nickname ?? "탈퇴한 사용자",
    },
    handler: r.handler
      ? { id: r.handler.id, nickname: r.handler.profile?.nickname ?? "관리자" }
      : null,
    /** 신고당한 글·댓글. 이미 지워졌으면 null */
    content: content
      ? {
          id: content.id,
          /** 댓글이면 글로 이동할 때 쓸 원글 id */
          postId: r.target === "POST" ? content.id : content.postId,
          title: r.target === "POST" ? content.title : null,
          body: content.content,
          island: r.target === "POST" ? content.island : null,
          createdAt: content.createdAt,
          author: {
            id: content.author.id,
            nickname: content.author.profile?.nickname ?? "탈퇴한 사용자",
          },
        }
      : null,
  };
}

router.get("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const status = String(req.query.status ?? "PENDING").toUpperCase();
  const where = status === "ALL" ? {} : { status: status as any };

  const rows = await prisma.report.findMany({
    where,
    include: reportInclude,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const counts = await prisma.report.groupBy({ by: ["status"], _count: { _all: true } });

  res.json({
    reports: rows.map(shape),
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
  });
});

router.get("/count", requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const pending = await prisma.report.count({ where: { status: "PENDING" } });
  res.json({ pending });
});

router.patch("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, note } = req.body ?? {};
  if (status !== "RESOLVED" && status !== "DISMISSED" && status !== "PENDING") {
    return res.status(400).json({ error: "처리 상태가 올바르지 않아요" });
  }

  const found = await prisma.report.findUnique({ where: { id } });
  if (!found) return res.status(404).json({ error: "신고를 찾을 수 없어요" });

  const updated = await prisma.report.update({
    where: { id },
    data: {
      status,
      // 다시 대기로 되돌리면 처리 기록도 지운다
      handledBy: status === "PENDING" ? null : uid(req),
      handledAt: status === "PENDING" ? null : new Date(),
      handleNote:
        status === "PENDING"
          ? null
          : typeof note === "string" && note.trim()
            ? note.trim().slice(0, 300)
            : null,
    },
    include: reportInclude,
  });

  res.json(shape(updated));
});

export default router;
