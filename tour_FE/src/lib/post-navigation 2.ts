import type { Post } from "@/types/community";

const WINDOW_SIZE = 5;
const CENTER_OFFSET = Math.floor(WINDOW_SIZE / 2);

export type SurroundingPost = {
  post: Post;
  isCurrent: boolean;
};

/** 현재 글을 중앙(5개 중 3번째)에 두고 앞뒤 글을 포함한 목록 */
export function getSurroundingPosts(posts: Post[], currentId: string): SurroundingPost[] {
  const index = posts.findIndex((p) => p.id === currentId);
  if (index < 0) return [];

  let start = index - CENTER_OFFSET;
  let end = start + WINDOW_SIZE;

  if (start < 0) {
    start = 0;
    end = Math.min(WINDOW_SIZE, posts.length);
  }
  if (end > posts.length) {
    end = posts.length;
    start = Math.max(0, end - WINDOW_SIZE);
  }

  return posts.slice(start, end).map((post) => ({
    post,
    isCurrent: post.id === currentId,
  }));
}
