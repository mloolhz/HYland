/**
 * 커뮤니티 글 목록 스토어
 *
 * 예전에는 mocks/posts.ts 배열을 그대로 들고 있었다. 지금은 GET /community/posts
 * 로 받아온 목록을 담는다. 화면들은 usePosts() 시그니처를 그대로 쓰기 때문에
 * 이 파일만 바뀌면 목록·검색·정렬 코드는 손대지 않아도 된다.
 */
import { useEffect, useSyncExternalStore } from "react";
import type { Post } from "@/types/community";
import { fetchPosts } from "@/api/community";

type Listener = () => void;

const listeners = new Set<Listener>();
let posts: Post[] = [];
let status: "idle" | "loading" | "ready" | "error" = "idle";

export function subscribePosts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyPostsChanged() {
  listeners.forEach((listener) => listener());
}

export function getPostsSnapshot(): Post[] {
  return posts;
}

export function getPostsStatus() {
  return status;
}

/** 목록을 다시 받아온다. 이미 불러왔으면 force 로만 다시 부른다. */
export async function loadPosts(force = false): Promise<void> {
  if (!force && (status === "loading" || status === "ready")) return;
  status = "loading";
  notifyPostsChanged();
  try {
    const res = await fetchPosts();
    posts = res.posts;
    status = "ready";
  } catch (err) {
    console.error("[community] 글 목록 조회 실패:", err);
    posts = [];
    status = "error";
  }
  notifyPostsChanged();
}

export function usePosts(): Post[] {
  const snapshot = useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);
  useEffect(() => {
    void loadPosts();
  }, []);
  return snapshot;
}

export function usePostsStatus() {
  return useSyncExternalStore(subscribePosts, getPostsStatus, getPostsStatus);
}

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

/** 글쓰기 후 목록을 최신으로 맞춘다 */
export function refreshPosts(): Promise<void> {
  return loadPosts(true);
}
