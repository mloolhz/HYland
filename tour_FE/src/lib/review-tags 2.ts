import { normalizeReviewTags, REVIEW_TAGS } from "../constants/review-tags.ts";
import type { Post } from "../types/community";

export function summarizeReviewTags(posts: Post[], island: string) {
  const reviews = posts.filter((post) => post.type === "review" && !post.isNotice && post.island === island);
  const counts = new Map<string, number>();
  let taggedReviews = 0;
  for (const review of reviews) {
    const tags = normalizeReviewTags(review.tags);
    if (tags.length) taggedReviews += 1;
    for (const id of tags) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const tags = REVIEW_TAGS.map((tag) => ({
    ...tag,
    count: counts.get(tag.id) ?? 0,
    percent: reviews.length ? Math.round(((counts.get(tag.id) ?? 0) / reviews.length) * 100) : 0,
  })).filter((tag) => tag.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
  return { total: reviews.length, taggedReviews, tags };
}
