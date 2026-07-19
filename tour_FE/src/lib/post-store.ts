import { useSyncExternalStore } from "react";
import type { Post } from "@/types/community";
import { MOCK_POSTS } from "@/mocks/posts";

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribePosts(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyPostsChanged() {
  listeners.forEach((listener) => listener());
}

export function getPostsSnapshot(): Post[] {
  return MOCK_POSTS;
}

export function usePosts(): Post[] {
  return useSyncExternalStore(subscribePosts, getPostsSnapshot, getPostsSnapshot);
}

export function getPostById(id: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}

export function addPost(post: Post) {
  MOCK_POSTS.unshift(post);
  notifyPostsChanged();
}

export function incrementPostViews(id: string) {
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) return;
  post.views += 1;
  notifyPostsChanged();
}
