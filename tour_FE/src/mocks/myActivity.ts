import { CURRENT_USER_ID } from "@/constants/auth";
import type { MyComment, Post } from "@/types/community";
import { MOCK_POSTS } from "./posts";

const collectComments = (p: Post) => p.comments.flatMap((c) => [c, ...(c.replies ?? [])]);

export function getMyPosts(posts: Post[] = MOCK_POSTS): Post[] {
  return posts.filter((p) => !p.isNotice && p.author.id === CURRENT_USER_ID);
}

export function getMyComments(posts: Post[] = MOCK_POSTS): MyComment[] {
  return posts.flatMap((p) =>
    collectComments(p)
      .filter((c) => c.author.id === CURRENT_USER_ID)
      .map((c) => {
        const parent = p.comments.find((root) => root.replies?.some((r) => r.id === c.id));
        return {
          ...c,
          post: { id: p.id, title: p.title, island: p.island },
          parentAuthor: parent?.author.nickname,
        };
      }),
  );
}

/** Demo: posts the current user has liked */
export const MOCK_LIKED_POST_IDS = ["p2", "p5", "p7", "p11"];

export function getLikedPosts(posts: Post[] = MOCK_POSTS, likedIds: string[] = MOCK_LIKED_POST_IDS): Post[] {
  return posts.filter((p) => !p.isNotice && likedIds.includes(p.id));
}
