import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import type { Author, Comment, Post } from "@/types/community";

export type UserPublicProfile = {
  id: string;
  nickname: string;
  bti: IslandBti;
  joinedAt: string;
  postCount: number;
  commentCount: number;
};

function collectComments(posts: Post[]): Comment[] {
  return posts.flatMap((p) => p.comments.flatMap((c) => [c, ...(c.replies ?? [])]));
}

export function findAuthorInPosts(userId: string, posts: Post[]): Author | undefined {
  for (const post of posts) {
    if (post.author.id === userId) return post.author;
    for (const comment of collectComments([post])) {
      if (comment.author.id === userId) return comment.author;
    }
  }
  return undefined;
}

export function getUserPosts(userId: string, posts: Post[]): Post[] {
  return posts.filter((p) => !p.isNotice && p.author.id === userId);
}

export function getUserCommentCount(userId: string, posts: Post[]): number {
  return collectComments(posts).filter((c) => c.author.id === userId).length;
}

function getUserJoinedAt(userId: string, posts: Post[]): string {
  const authored = [
    ...getUserPosts(userId, posts).map((p) => p.createdAt),
    ...collectComments(posts)
      .filter((c) => c.author.id === userId)
      .map((c) => c.createdAt),
  ].sort();

  if (authored.length === 0) return "2024-01-01";
  return authored[0].slice(0, 10);
}

export function getUserPublicProfile(userId: string, posts: Post[]): UserPublicProfile | null {
  const author = findAuthorInPosts(userId, posts);
  if (!author) return null;

  return {
    id: author.id,
    nickname: author.nickname,
    bti: author.bti,
    joinedAt: getUserJoinedAt(userId, posts),
    postCount: getUserPosts(userId, posts).length,
    commentCount: getUserCommentCount(userId, posts),
  };
}

export function isSelfUser(userId: string): boolean {
  return userId === CURRENT_USER_ID;
}
