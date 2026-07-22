import type { Comment, Post } from "@/types/community";

export function countComments(comments: Comment[]): number {
  return comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
}

export function commentCount(post: Post): number {
  return countComments(post.comments);
}

export function postSummary(post: Post, length = 40): string {
  if (post.summary) return post.summary.slice(0, length);
  return post.content.slice(0, length);
}

export const GALLERY_PAGE_SIZE = 24;

export type SortKey = "latest" | "popular";

export function sortPosts(posts: Post[], sort: SortKey): Post[] {
  const arr = [...posts];
  if (sort === "latest") {
    return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return arr.sort(
    (a, b) =>
      b.likes - a.likes ||
      commentCount(b) - commentCount(a) ||
      +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export function filterPosts(
  posts: Post[],
  opts: {
    category: "all" | Post["type"];
    islands: Set<string>;
    query: string;
  },
): Post[] {
  let arr = posts.filter((p) => !p.isNotice);
  if (opts.category !== "all") {
    arr = arr.filter((p) => p.type === opts.category);
  }
  if (opts.islands.size > 0) {
    arr = arr.filter((p) => opts.islands.has(p.island));
  }
  if (opts.query.trim()) {
    const q = opts.query.trim();
    arr = arr.filter((p) => p.title.includes(q) || p.island.includes(q));
  }
  return arr;
}

export function getNoticePosts(posts: Post[]): Post[] {
  return posts.filter((p) => p.isNotice);
}

export const PAGE_SIZE = 10;

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalPages(count: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

export function islandPostCounts(posts: Post[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of posts) {
    if (p.isNotice) continue;
    counts[p.island] = (counts[p.island] ?? 0) + 1;
  }
  return counts;
}

export function findComment(comments: Comment[], id: string): Comment | undefined {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    if (comment.replies?.length) {
      const nested = findComment(comment.replies, id);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function removeComment(comments: Comment[], id: string): Comment[] {
  return comments
    .filter((comment) => comment.id !== id)
    .map((comment) =>
      comment.replies?.length
        ? { ...comment, replies: removeComment(comment.replies, id) }
        : comment,
    );
}
