/**
 * 커뮤니티 API — 글 · 댓글 · 좋아요
 *
 *   GET    /community/posts              목록 (type·island·q·sort·page)
 *   POST   /community/posts              글쓰기            (로그인)
 *   GET    /community/posts/:id          상세 (+조회수 증가, 댓글 포함)
 *   PATCH  /community/posts/:id          수정              (작성자)
 *   DELETE /community/posts/:id          삭제              (작성자)
 *   POST   /community/posts/:id/like     좋아요 토글        (로그인)
 *   POST   /community/posts/:id/comments 댓글·대댓글 작성   (로그인)
 *   PATCH  /community/comments/:id       댓글 수정          (작성자)
 *   DELETE /community/comments/:id       댓글 삭제          (작성자)
 *   POST   /community/comments/:id/like  댓글 좋아요 토글   (로그인)
 *   GET    /community/me/posts           내가 쓴 글         (로그인)
 *   GET    /community/me/comments        내가 쓴 댓글       (로그인)
 *   GET    /community/me/liked           내가 좋아요한 글   (로그인)
 *
 * 응답은 프론트 types/community.ts 모양에 맞춘다.
 */
import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { requireAuth, optionalAuth } from "./auth";
import { notify } from "./notifications";

const router = Router();

const userId = (req: Request) => (req as any).userId as string | undefined;

/** 프론트 PostType ↔ DB enum */
const TYPE_TO_DB = { review: "REVIEW", photo: "PHOTO", question: "QUESTION" } as const;
const TYPE_TO_FE = { REVIEW: "review", PHOTO: "photo", QUESTION: "question" } as const;
const BADGE_TO_DB = { 레어카드: "RARE_CARD", 스탬프: "STAMP" } as const;
const BADGE_TO_FE = { RARE_CARD: "레어카드", STAMP: "스탬프" } as const;

/** 커뮤니티 표시용 4타입. 섬BTI 코드(16타입)와는 다른 분류라 첫 글자로 매핑한다. */
const BTI_LABEL: Record<string, string> = { A: "파도형", B: "등대형", W: "갯벌형", L: "해류형" };
function btiOf(profile: { bti: string | null } | null): string {
  const code = profile?.bti;
  return (code && BTI_LABEL[code[0]]) || "파도형";
}

const authorSelect = {
  id: true,
  profile: { select: { nickname: true, bti: true, passportAvatar: true } },
} as const;

function shapeAuthor(u: {
  id: string;
  profile: { nickname: string; bti: string | null; passportAvatar: string | null } | null;
}) {
  return {
    id: u.id,
    nickname: u.profile?.nickname ?? "알 수 없음",
    bti: btiOf(u.profile),
    avatarUrl: u.profile?.passportAvatar ?? undefined,
  };
}

// ─────────────────────────── 글 목록 ───────────────────────────

router.get("/posts", optionalAuth, async (req: Request, res: Response) => {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const island = typeof req.query.island === "string" ? req.query.island : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const sort = req.query.sort === "popular" ? "popular" : "latest";
    const page = Math.max(1, Number(req.query.page) || 1);
    const size = Math.min(Number(req.query.size) || 20, 50);

    const where = {
      ...(type && type in TYPE_TO_DB
        ? { type: TYPE_TO_DB[type as keyof typeof TYPE_TO_DB] }
        : {}),
      ...(island ? { island } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        // 공지는 항상 위로, 그 다음 정렬 기준
        orderBy:
          sort === "popular"
            ? [{ isNotice: "desc" }, { likes: { _count: "desc" } }, { createdAt: "desc" }]
            : [{ isNotice: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * size,
        take: size,
        include: {
          author: { select: authorSelect },
          images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    const me = userId(req);
    const likedSet = me
      ? new Set(
          (
            await prisma.postLike.findMany({
              where: { userId: me, postId: { in: rows.map((r) => r.id) } },
              select: { postId: true },
            })
          ).map((l) => l.postId),
        )
      : new Set<string>();

    res.json({
      total,
      page,
      size,
      posts: rows.map((p) => ({
        id: p.id,
        type: TYPE_TO_FE[p.type],
        title: p.title,
        content: p.content,
        summary: p.summary ?? undefined,
        island: p.island,
        activity: p.activity,
        images: p.images.map((i) => i.url),
        badge: p.badge ? BADGE_TO_FE[p.badge] : undefined,
        isNotice: p.isNotice,
        isResolved: p.isResolved,
        author: shapeAuthor(p.author),
        createdAt: p.createdAt,
        likes: p._count.likes,
        commentCount: p._count.comments,
        views: p.views,
        likedByMe: likedSet.has(p.id),
      })),
    });
  } catch (err) {
    console.error("글 목록 조회 실패:", err);
    res.status(500).json({ error: "글 목록을 불러오지 못했어요." });
  }
});

// ─────────────────────────── 글쓰기 ───────────────────────────

router.post("/posts", requireAuth, async (req: Request, res: Response) => {
  try {
    const me = userId(req)!;
    const { type, title, content, island, activity, images, badge, summary } = req.body ?? {};

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "제목과 내용을 입력해주세요" });
    }
    if (!type || !(type in TYPE_TO_DB)) {
      return res.status(400).json({ error: "글 종류가 올바르지 않아요" });
    }

    const post = await prisma.post.create({
      data: {
        authorId: me,
        type: TYPE_TO_DB[type as keyof typeof TYPE_TO_DB],
        title: title.trim(),
        content: content.trim(),
        summary: summary?.trim() || null,
        island: island?.trim() || "인천 섬",
        activity: activity?.trim() || "기타",
        badge: badge && badge in BADGE_TO_DB ? BADGE_TO_DB[badge as keyof typeof BADGE_TO_DB] : null,
        images: Array.isArray(images)
          ? {
              create: images
                .filter((u: unknown) => typeof u === "string" && u.trim())
                .slice(0, 10)
                .map((url: string, i: number) => ({ url: url.trim(), sortOrder: i })),
            }
          : undefined,
      },
      include: { author: { select: authorSelect }, images: true },
    });

    res.status(201).json({ id: post.id, title: post.title });
  } catch (err) {
    console.error("글 작성 실패:", err);
    res.status(500).json({ error: "글을 저장하지 못했어요." });
  }
});

// ─────────────────────────── 글 상세 ───────────────────────────

router.get("/posts/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const me = userId(req);
    const id = String(req.params.id);
    const exists = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: "글을 찾을 수 없어요." });

    // 조회수는 상세를 열 때마다 올린다 (중복 방지는 나중에)
    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        author: { select: authorSelect },
        images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
        _count: { select: { likes: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: authorSelect },
            _count: { select: { likes: true } },
          },
        },
      },
    });

    const [likedByMe, likedComments] = await Promise.all([
      me ? prisma.postLike.count({ where: { postId: post.id, userId: me } }) : 0,
      me
        ? prisma.commentLike.findMany({
            where: { userId: me, commentId: { in: post.comments.map((c) => c.id) } },
            select: { commentId: true },
          })
        : [],
    ]);
    const likedCommentSet = new Set(likedComments.map((l) => l.commentId));

    /** 댓글을 부모-자식으로 묶는다 (대댓글은 1단계까지) */
    const shapeComment = (c: (typeof post.comments)[number]) => ({
      id: c.id,
      author: shapeAuthor(c.author),
      content: c.content,
      createdAt: c.createdAt,
      likes: c._count.likes,
      isAuthor: c.authorId === post.authorId,
      likedByMe: likedCommentSet.has(c.id),
    });

    const roots = post.comments.filter((c) => !c.parentId);
    const byParent = new Map<string, typeof post.comments>();
    for (const c of post.comments) {
      if (!c.parentId) continue;
      if (!byParent.has(c.parentId)) byParent.set(c.parentId, []);
      byParent.get(c.parentId)!.push(c);
    }

    res.json({
      id: post.id,
      type: TYPE_TO_FE[post.type],
      title: post.title,
      content: post.content,
      summary: post.summary ?? undefined,
      island: post.island,
      activity: post.activity,
      images: post.images.map((i) => i.url),
      badge: post.badge ? BADGE_TO_FE[post.badge] : undefined,
      isNotice: post.isNotice,
      isResolved: post.isResolved,
      author: shapeAuthor(post.author),
      createdAt: post.createdAt,
      likes: post._count.likes,
      views: post.views,
      likedByMe: likedByMe > 0,
      isMine: me === post.authorId,
      comments: roots.map((c) => ({
        ...shapeComment(c),
        replies: (byParent.get(c.id) ?? []).map(shapeComment),
      })),
    });
  } catch (err) {
    console.error("글 상세 조회 실패:", err);
    res.status(500).json({ error: "글을 불러오지 못했어요." });
  }
});

// ─────────────────────── 글 수정 · 삭제 ───────────────────────


/**
 * 관리자인지 — 커뮤니티 정리 권한.
 * 신고 처리나 부적절한 글을 지우려면 남의 글·댓글도 지울 수 있어야 한다.
 */
async function isAdmin(id: string): Promise<boolean> {
  const u = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  return u?.role === "ADMIN";
}

router.patch("/posts/:id", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const post = await prisma.post.findUnique({ where: { id: String(req.params.id) } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요." });
  if (post.authorId !== me) return res.status(403).json({ error: "내가 쓴 글만 수정할 수 있어요." });

  const { title, content, island, activity, isResolved } = req.body ?? {};
  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      ...(typeof title === "string" && title.trim() ? { title: title.trim() } : {}),
      ...(typeof content === "string" && content.trim() ? { content: content.trim() } : {}),
      ...(typeof island === "string" ? { island } : {}),
      ...(typeof activity === "string" ? { activity } : {}),
      ...(typeof isResolved === "boolean" ? { isResolved } : {}),
    },
  });
  res.json({ id: updated.id, title: updated.title });
});

router.delete("/posts/:id", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const post = await prisma.post.findUnique({ where: { id: String(req.params.id) } });
  if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요." });
  if (post.authorId !== me && !(await isAdmin(me))) {
    return res.status(403).json({ error: "내가 쓴 글만 삭제할 수 있어요." });
  }

  await prisma.post.delete({ where: { id: post.id } });
  res.json({ ok: true });
});

// ─────────────────────────── 좋아요 ───────────────────────────

router.post("/posts/:id/like", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const postId = String(req.params.id);
  const exists = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: me } },
  });

  if (exists) {
    await prisma.postLike.delete({ where: { postId_userId: { postId, userId: me } } });
  } else {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요." });
    await prisma.postLike.create({ data: { postId, userId: me } });

    const liker = await prisma.userProfile.findUnique({ where: { userId: me } });
    await notify({
      userId: post.authorId,
      actorUserId: me,
      type: "LIKE",
      actor: liker?.nickname ?? "누군가",
      message: "{actor}님이 회원님의 글을 좋아해요",
      link: `/community/${postId}`,
    });
  }

  const likes = await prisma.postLike.count({ where: { postId } });
  res.json({ liked: !exists, likes });
});

router.post("/comments/:id/like", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const commentId = String(req.params.id);
  const exists = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId: me } },
  });

  if (exists) {
    await prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId: me } } });
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ error: "댓글을 찾을 수 없어요." });
    await prisma.commentLike.create({ data: { commentId, userId: me } });
  }

  const likes = await prisma.commentLike.count({ where: { commentId } });
  res.json({ liked: !exists, likes });
});

// ─────────────────────────── 댓글 ───────────────────────────

router.post("/posts/:id/comments", requireAuth, async (req: Request, res: Response) => {
  try {
    const me = userId(req)!;
    const { content, parentId } = req.body ?? {};
    if (!content?.trim()) return res.status(400).json({ error: "댓글 내용을 입력해주세요" });

    const post = await prisma.post.findUnique({ where: { id: String(req.params.id) } });
    if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요." });

    // 대댓글의 대댓글은 만들지 않는다 — 부모가 이미 답글이면 그 부모에 붙인다
    let parent: string | null = null;
    if (parentId) {
      const p = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!p || p.postId !== post.id) {
        return res.status(400).json({ error: "답글을 달 댓글을 찾을 수 없어요." });
      }
      parent = p.parentId ?? p.id;
    }

    const comment = await prisma.comment.create({
      data: { postId: post.id, authorId: me, parentId: parent, content: content.trim() },
      include: { author: { select: authorSelect } },
    });

    const nickname = comment.author.profile?.nickname ?? "누군가";
    if (parent) {
      // 답글이면 원댓글 작성자에게 알린다
      const parentComment = await prisma.comment.findUnique({ where: { id: parent } });
      if (parentComment) {
        await notify({
          userId: parentComment.authorId,
          actorUserId: me,
          type: "REPLY",
          actor: nickname,
          message: "{actor}님이 회원님의 댓글에 답글을 남겼어요",
          link: `/community/${post.id}#comment-${comment.id}`,
        });
      }
    } else {
      await notify({
        userId: post.authorId,
        actorUserId: me,
        type: "COMMENT",
        actor: nickname,
        message: "{actor}님이 회원님의 글에 댓글을 남겼어요",
        link: `/community/${post.id}#comment-${comment.id}`,
      });
    }

    res.status(201).json({
      id: comment.id,
      author: shapeAuthor(comment.author),
      content: comment.content,
      createdAt: comment.createdAt,
      likes: 0,
      isAuthor: me === post.authorId,
      parentId: comment.parentId,
    });
  } catch (err) {
    console.error("댓글 작성 실패:", err);
    res.status(500).json({ error: "댓글을 저장하지 못했어요." });
  }
});

router.patch("/comments/:id", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const { content } = req.body ?? {};
  if (!content?.trim()) return res.status(400).json({ error: "댓글 내용을 입력해주세요" });

  const c = await prisma.comment.findUnique({ where: { id: String(req.params.id) } });
  if (!c) return res.status(404).json({ error: "댓글을 찾을 수 없어요." });
  if (c.authorId !== me) return res.status(403).json({ error: "내가 쓴 댓글만 수정할 수 있어요." });

  const updated = await prisma.comment.update({
    where: { id: c.id },
    data: { content: content.trim() },
  });
  res.json({ id: updated.id, content: updated.content });
});

router.delete("/comments/:id", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const c = await prisma.comment.findUnique({ where: { id: String(req.params.id) } });
  if (!c) return res.status(404).json({ error: "댓글을 찾을 수 없어요." });
  if (c.authorId !== me && !(await isAdmin(me))) {
    return res.status(403).json({ error: "내가 쓴 댓글만 삭제할 수 있어요." });
  }

  await prisma.comment.delete({ where: { id: c.id } });
  res.json({ ok: true });
});

// ─────────────────────── 내 활동 ───────────────────────

router.get("/me/posts", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const rows = await prisma.post.findMany({
    where: { authorId: me },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  res.json({
    total: rows.length,
    posts: rows.map((p) => ({
      id: p.id,
      type: TYPE_TO_FE[p.type],
      title: p.title,
      content: p.content,
      island: p.island,
      activity: p.activity,
      images: p.images.map((i) => i.url),
      author: shapeAuthor(p.author),
      createdAt: p.createdAt,
      likes: p._count.likes,
      commentCount: p._count.comments,
      views: p.views,
    })),
  });
});

router.get("/me/comments", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const rows = await prisma.comment.findMany({
    where: { authorId: me },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: authorSelect },
      post: { select: { id: true, title: true, island: true } },
      parent: { select: { author: { select: authorSelect } } },
      _count: { select: { likes: true } },
    },
  });
  res.json({
    total: rows.length,
    comments: rows.map((c) => ({
      id: c.id,
      author: shapeAuthor(c.author),
      content: c.content,
      createdAt: c.createdAt,
      likes: c._count.likes,
      isAuthor: false,
      post: c.post,
      parentAuthor: c.parent ? shapeAuthor(c.parent.author).nickname : undefined,
    })),
  });
});

router.get("/me/liked", requireAuth, async (req: Request, res: Response) => {
  const me = userId(req)!;
  const likes = await prisma.postLike.findMany({
    where: { userId: me },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: authorSelect },
          images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });
  res.json({
    total: likes.length,
    posts: likes.map(({ post: p }) => ({
      id: p.id,
      type: TYPE_TO_FE[p.type],
      title: p.title,
      content: p.content,
      island: p.island,
      activity: p.activity,
      images: p.images.map((i) => i.url),
      author: shapeAuthor(p.author),
      createdAt: p.createdAt,
      likes: p._count.likes,
      commentCount: p._count.comments,
      views: p.views,
    })),
  });
});

export default router;
