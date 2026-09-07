/**
 * 커뮤니티 API (tour_BE `/community`)
 *
 * 응답을 프론트 types/community.ts 의 Post/Comment 모양으로 맞춰 돌려준다.
 * 화면 코드는 mock 을 쓰던 때와 같은 타입을 그대로 쓴다.
 */
import { API_BASE } from "@/lib/api-base";
import { ApiError } from "@/api/auth";
import { readToken } from "@/lib/token";
import type { Comment, MyComment, Post } from "@/types/community";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "요청을 처리하지 못했어요.");
  return body as T;
}

/** 서버 응답 → 화면이 쓰는 Post. 목록 응답에는 댓글 본문이 없어 빈 배열로 둔다. */
function toPost(raw: Record<string, unknown>): Post {
  return {
    ...(raw as unknown as Post),
    createdAt: String(raw.createdAt),
    images: (raw.images as string[]) ?? [],
    comments: (raw.comments as Comment[]) ?? [],
  };
}

export type PostListParams = {
  type?: Post["type"];
  island?: string;
  q?: string;
  sort?: "latest" | "popular";
  page?: number;
  size?: number;
};

export async function fetchPosts(params: PostListParams = {}): Promise<{
  total: number;
  posts: Post[];
}> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  // 화면이 목록 전체를 받아 직접 필터·정렬하므로 넉넉히 가져온다
  if (!qs.has("size")) qs.set("size", "50");
  const res = await request<{ total: number; posts: Record<string, unknown>[] }>(
    `/community/posts?${qs.toString()}`,
  );
  return { total: res.total, posts: res.posts.map(toPost) };
}

export type PostDetail = Post & {
  likedByMe: boolean;
  isMine: boolean;
};

export async function fetchPost(id: string): Promise<PostDetail> {
  const raw = await request<Record<string, unknown>>(`/community/posts/${id}`);
  return toPost(raw) as PostDetail;
}

export function createPost(input: {
  type: Post["type"];
  title: string;
  content: string;
  island?: string;
  activity?: string;
  images?: string[];
}): Promise<{ id: string; title: string }> {
  return request("/community/posts", { method: "POST", body: JSON.stringify(input) });
}

export function updatePost(
  id: string,
  input: { title?: string; content?: string; island?: string; activity?: string; isResolved?: boolean },
): Promise<{ id: string }> {
  return request(`/community/posts/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deletePost(id: string): Promise<{ ok: boolean }> {
  return request(`/community/posts/${id}`, { method: "DELETE" });
}

/** 좋아요 토글 — 누른 뒤의 상태와 총 개수를 돌려준다 */
export function togglePostLike(id: string): Promise<{ liked: boolean; likes: number }> {
  return request(`/community/posts/${id}/like`, { method: "POST" });
}

export function toggleCommentLike(id: string): Promise<{ liked: boolean; likes: number }> {
  return request(`/community/comments/${id}/like`, { method: "POST" });
}

export function addComment(
  postId: string,
  input: { content: string; parentId?: string },
): Promise<Comment> {
  return request(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateComment(id: string, content: string): Promise<{ id: string }> {
  return request(`/community/comments/${id}`, { method: "PATCH", body: JSON.stringify({ content }) });
}

export function deleteComment(id: string): Promise<{ ok: boolean }> {
  return request(`/community/comments/${id}`, { method: "DELETE" });
}

// ── 내 활동 ──

export async function fetchMyPosts(): Promise<Post[]> {
  const res = await request<{ posts: Record<string, unknown>[] }>("/community/me/posts");
  return res.posts.map(toPost);
}

export async function fetchMyComments(): Promise<MyComment[]> {
  const res = await request<{ comments: MyComment[] }>("/community/me/comments");
  return res.comments;
}

export async function fetchLikedPosts(): Promise<Post[]> {
  const res = await request<{ posts: Record<string, unknown>[] }>("/community/me/liked");
  return res.posts.map(toPost);
}
