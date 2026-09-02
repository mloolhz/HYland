import { Router } from "express";
import { prisma } from "../prisma";

/**
 * 커뮤니티 게시글 API.
 *
 * FE는 지금까지 mocks/posts.ts를 직접 읽었다. 새로고침하면 작성한 글이 사라지고,
 * AI 추천이 후기를 근거로 쓰는데도 그 근거가 휘발되는 상태였다.
 *
 * 응답은 FE의 Post 타입(types/community.ts) 모양 그대로 맞춘다. 그래야
 * post-store만 바꾸면 8개 커뮤니티 화면을 손대지 않아도 된다.
 */
const router = Router();

type CommentRow = {
  id: string;
  parentId: string | null;
  authorId: string;
  authorNickname: string;
  authorBti: string;
  content: string;
  createdAt: Date;
  likes: number;
  isAuthor: boolean;
};

/** DB의 평면 댓글 목록을 FE가 쓰는 2단 구조(댓글 → replies)로 되돌린다. */
function nestComments(rows: CommentRow[]) {
  const toDto = (c: CommentRow) => ({
    id: c.id,
    author: { id: c.authorId, nickname: c.authorNickname, bti: c.authorBti },
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    likes: c.likes,
    isAuthor: c.isAuthor,
  });

  const roots = rows.filter((c) => c.parentId === null);
  return roots.map((root) => ({
    ...toDto(root),
    replies: rows.filter((c) => c.parentId === root.id).map(toDto),
  }));
}

function toPostDto(post: {
  id: string;
  type: string;
  title: string;
  content: string;
  summary: string | null;
  island: string;
  activity: string;
  images: unknown;
  badge: string | null;
  isNotice: boolean;
  isResolved: boolean | null;
  authorId: string;
  authorNickname: string;
  authorBti: string;
  createdAt: Date;
  likes: number;
  views: number;
  comments: CommentRow[];
}) {
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    content: post.content,
    summary: post.summary ?? undefined,
    island: post.island,
    activity: post.activity,
    images: Array.isArray(post.images) ? (post.images as string[]) : undefined,
    badge: post.badge ?? undefined,
    isNotice: post.isNotice,
    isResolved: post.isResolved ?? undefined,
    author: { id: post.authorId, nickname: post.authorNickname, bti: post.authorBti },
    createdAt: post.createdAt.toISOString(),
    likes: post.likes,
    views: post.views,
    comments: nestComments(post.comments),
  };
}

const COMMENT_ORDER = { createdAt: "asc" } as const;

/** 전체 글 (최신순) — FE는 이 한 번의 응답을 캐시해 목록·상세·내활동에 모두 쓴다. */
router.get("/posts", async (_req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      include: { comments: { orderBy: COMMENT_ORDER } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ posts: posts.map(toPostDto) });
  } catch (error) {
    console.error("커뮤니티 글 목록 조회 실패:", error);
    res.status(500).json({ error: "게시글을 불러오지 못했어요." });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: { comments: { orderBy: COMMENT_ORDER } },
    });
    if (!post) return res.status(404).json({ error: "글을 찾을 수 없어요." });
    res.json({ post: toPostDto(post) });
  } catch (error) {
    console.error("커뮤니티 글 조회 실패:", error);
    res.status(500).json({ error: "게시글을 불러오지 못했어요." });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const b = req.body ?? {};
    if (!b.title || !b.content) {
      return res.status(400).json({ error: "제목과 내용을 입력해주세요." });
    }

    const created = await prisma.communityPost.create({
      data: {
        id: b.id ?? `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: b.type ?? "review",
        title: b.title,
        content: b.content,
        summary: b.summary ?? null,
        island: b.island ?? "",
        activity: b.activity ?? "",
        images: Array.isArray(b.images) && b.images.length > 0 ? b.images : undefined,
        badge: b.badge ?? null,
        isNotice: false, // 공지는 API로 만들지 않는다
        isResolved: b.type === "question" ? false : null,
        authorId: b.author?.id ?? "guest",
        authorNickname: b.author?.nickname ?? "익명",
        authorBti: b.author?.bti ?? "파도형",
        createdAt: new Date(),
        likes: 0,
        views: 0,
      },
      include: { comments: true },
    });

    res.status(201).json({ post: toPostDto({ ...created, comments: [] }) });
  } catch (error) {
    console.error("커뮤니티 글 작성 실패:", error);
    res.status(500).json({ error: "글을 저장하지 못했어요." });
  }
});

/** 조회수 +1 — 실패해도 화면은 그대로 두면 되므로 204로 조용히 끝낸다. */
router.post("/posts/:id/views", async (req, res) => {
  try {
    await prisma.communityPost.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("조회수 증가 실패:", error);
  }
  res.status(204).end();
});

export default router;
