/**
 * 알림
 *
 *   GET    /notifications           내 알림 목록 (로그인)
 *   PATCH  /notifications/:id/read  하나 읽음
 *   PATCH  /notifications/read-all  전부 읽음
 *   DELETE /notifications/:id       하나 삭제
 *   DELETE /notifications           전부 삭제
 *
 * 알림을 만드는 쪽은 notify() 를 쓴다 (커뮤니티·검수에서 호출).
 */
import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth } from "./auth";

const router = Router();
const uid = (req: Request) => (req as any).userId as string;

type NotifyInput = {
  userId: string;
  type: "COMMENT" | "REPLY" | "LIKE" | "BADGE" | "REVIEW" | "NOTICE";
  message: string;
  actor?: string | null;
  highlight?: string | null;
  link?: string | null;
  /** 이 사람이 일으킨 알림 — 받는 사람과 같으면 만들지 않는다 */
  actorUserId?: string | null;
};

/**
 * 알림 생성. 실패해도 원래 동작(댓글 작성 등)을 막지 않는다.
 * 알림이 하나 빠지는 것보다 글이 안 써지는 쪽이 훨씬 나쁘다.
 */
export async function notify(input: NotifyInput): Promise<void> {
  if (input.actorUserId && input.actorUserId === input.userId) return;
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        message: input.message,
        actor: input.actor ?? null,
        highlight: input.highlight ?? null,
        link: input.link ?? null,
      },
    });
  } catch (err) {
    console.error("알림 생성 실패:", err);
  }
}

// ── 목록 ──
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const rows = await prisma.notification.findMany({
    where: { userId: uid(req) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({
    total: rows.length,
    unread: rows.filter((r) => !r.read).length,
    items: rows.map((r) => ({
      id: r.id,
      type: r.type.toLowerCase(),
      actor: r.actor ?? undefined,
      message: r.message,
      highlight: r.highlight ?? undefined,
      link: r.link ?? undefined,
      read: r.read,
      createdAt: r.createdAt,
    })),
  });
});

// ── 읽음 처리 ──
// "/read-all" 이 "/:id" 보다 먼저 와야 경로가 겹치지 않는다
router.patch("/read-all", requireAuth, async (req: Request, res: Response) => {
  const r = await prisma.notification.updateMany({
    where: { userId: uid(req), read: false },
    data: { read: true },
  });
  res.json({ updated: r.count });
});

router.patch("/:id/read", requireAuth, async (req: Request, res: Response) => {
  const r = await prisma.notification.updateMany({
    where: { id: String(req.params.id), userId: uid(req) },
    data: { read: true },
  });
  if (r.count === 0) return res.status(404).json({ error: "알림을 찾을 수 없어요" });
  res.json({ ok: true });
});

// ── 삭제 ──
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const r = await prisma.notification.deleteMany({
    where: { id: String(req.params.id), userId: uid(req) },
  });
  if (r.count === 0) return res.status(404).json({ error: "알림을 찾을 수 없어요" });
  res.json({ ok: true });
});

router.delete("/", requireAuth, async (req: Request, res: Response) => {
  const r = await prisma.notification.deleteMany({ where: { userId: uid(req) } });
  res.json({ deleted: r.count });
});

export default router;
