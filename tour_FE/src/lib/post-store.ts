import { useSyncExternalStore } from "react";
import type { Post } from "@/types/community";
import { MOCK_POSTS } from "@/mocks/posts";

/**
 * 커뮤니티 게시글 저장소.
 *
 * 예전엔 MOCK_POSTS 배열을 직접 들고 있어서 새로고침하면 작성한 글이 사라졌다.
 * 이제 백엔드(/api/community/posts)에서 받아 캐시에 담는다.
 *
 * 화면 8곳과 AI 추천이 getPostsSnapshot()을 동기적으로 읽기 때문에, 저장소는
 * "동기 캐시 + 비동기 갱신" 구조를 유지한다. 로드 전에는 MOCK_POSTS로 시작해
 * 첫 화면이 비지 않게 하고(seed와 같은 내용이다), 응답이 오면 서버 값으로 바꾼다.
 * AI 추천의 커뮤니티 신호도 목록이 비어 있으면 중립 점수라 안전하다.
 */

const API_BASE = "http://localhost:4000";

type Listener = () => void;

const listeners = new Set<Listener>();

let posts: Post[] = MOCK_POSTS;
let loadPromise: Promise<void> | null = null;

export function subscribePosts(listener: Listener) {
  listeners.add(listener);
  // 첫 구독 시점에 한 번 서버와 맞춘다.
  void loadPosts();
  return () => listeners.delete(listener);
}

export function notifyPostsChanged() {
  listeners.forEach((listener) => listener());
}

/** 서버에서 글을 받아 캐시를 갱신한다. 여러 번 불려도 요청은 한 번만 나간다. */
export function loadPosts(force = false): Promise<void> {
  if (loadPromise && !force) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/community/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { posts?: Post[] };
      if (Array.isArray(data.posts)) {
        posts = data.posts;
        notifyPostsChanged();
      }
    } catch (error) {
      // 서버가 없어도 화면은 떠야 한다 — 목 데이터를 그대로 쓴다.
      console.warn("커뮤니티 글을 불러오지 못해 기본 데이터를 사용합니다:", error);
    }
  })();

  return loadPromise;
}

export function getPostsSnapshot(): Post[] {
  return posts;
}

// 모듈이 로드되는 즉시 한 번 받아온다.
//
// 예전엔 subscribePosts에서만 불러서, 커뮤니티 화면을 거치지 않고 AI 추천으로
// 바로 들어오면 목 데이터가 그대로 쓰였다. AI 추천은 usePosts()를 쓰지 않고
// getPostsSnapshot()을 동기로 읽기 때문에 구독이 일어나지 않는다.
// 그 결과 서버가 분석해 넣은 sentiment·highlight가 추천에 반영되지 않았다.
void loadPosts();

export function usePosts(): Post[] {
  return useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);
}

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

/** 서버에 저장하고 캐시에도 반영한다. 저장이 실패하면 화면에도 넣지 않는다. */
export async function addPost(post: Post): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/community/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error("글을 저장하지 못했어요.");

  const data = (await res.json()) as { post: Post };
  posts = [data.post, ...posts.filter((p) => p.id !== data.post.id)];
  notifyPostsChanged();
  return data.post;
}

export function incrementPostViews(id: string) {
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  // 화면은 즉시 올리고, 서버 반영은 실패해도 넘어간다(조회수는 치명적이지 않다).
  post.views += 1;
  notifyPostsChanged();
  void fetch(`${API_BASE}/api/community/posts/${id}/views`, { method: "POST" }).catch(() => {});
}
