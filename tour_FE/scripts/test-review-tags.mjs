import assert from "node:assert/strict";
import { test } from "node:test";
import { REVIEW_TAGS, REVIEW_TAG_CATEGORIES, isValidReviewTags, normalizeReviewTags } from "../src/constants/review-tags.ts";
import { summarizeReviewTags } from "../src/lib/review-tags.ts";
import { filterPosts, paginate, sortPosts } from "../src/lib/posts.ts";

const review = (id, extra = {}) => ({
  id, type: "review", island: "자월도", activity: "트레킹", title: "가족 여행",
  content: "바다를 보며 걸었어요", createdAt: "2026-09-08", likes: 0, comments: [], ...extra,
});
const posts = [
  review("1", { tags: ["beautiful_sea", "family_friendly", "beautiful_sea"] }),
  review("2", { tags: ["family_friendly"], activity: "산책", title: "혼자 여행" }),
  review("3"),
  review("4", { tags: ["unknown"] }),
  review("notice", { tags: ["beautiful_sea"], isNotice: true }),
  review("photo", { tags: ["beautiful_sea"], type: "photo" }),
  review("other", { tags: ["beautiful_sea"], island: "무의도" }),
];

test("25 unique snake_case IDs across five categories; strict 1–5 selection", () => {
  assert.equal(REVIEW_TAGS.length, 25);
  assert.equal(new Set(REVIEW_TAGS.map((tag) => tag.id)).size, 25);
  for (const category of REVIEW_TAG_CATEGORIES) {
    assert.equal(REVIEW_TAGS.filter((tag) => tag.category === category.id).length, 5);
  }
  assert.ok(REVIEW_TAGS.every((tag) => /^[a-z]+(?:_[a-z]+)*$/.test(tag.id)));
  for (const value of [undefined, null, [], ["unknown"], ["quiet", "quiet"], REVIEW_TAGS.slice(0, 6).map((tag) => tag.id)]) {
    assert.equal(isValidReviewTags(value), false);
  }
  assert.equal(isValidReviewTags(["quiet"]), true);
  assert.equal(isValidReviewTags(REVIEW_TAGS.slice(0, 5).map((tag) => tag.id)), true);
  assert.deepEqual(normalizeReviewTags(["quiet", "quiet", "unknown", null]), ["quiet"]);
});

test("ratio includes untagged reviews, excludes notices/photos/other islands, deduplicates IDs", () => {
  const result = summarizeReviewTags(posts, "자월도");
  assert.equal(result.total, 4);
  assert.equal(result.taggedReviews, 2);
  assert.deepEqual(result.tags.map(({ id, percent }) => ({ id, percent })), [
    { id: "family_friendly", percent: 50 }, { id: "beautiful_sea", percent: 25 },
  ]);
  assert.deepEqual(summarizeReviewTags(posts, "없는 섬"), { total: 0, taggedReviews: 0, tags: [] });
  const many = REVIEW_TAGS.map((tag, index) => review(String(index), { tags: [tag.id] }));
  assert.equal(summarizeReviewTags(many, "자월도").tags.length, 5);
  assert.equal(summarizeReviewTags(many, "자월도").tags[0].percent, 4);
});

test("tag composes with island/activity/search/category before sorting and pagination; deselection restores results", () => {
  const options = { category: "all", islands: new Set(["자월도"]), activities: new Set(["트레킹"]), query: "가족", tags: ["beautiful_sea"] };
  assert.deepEqual(filterPosts(posts, options).map((post) => post.id), ["1"]);
  assert.equal(filterPosts(posts, { ...options, category: "question" }).length, 0);
  assert.equal(filterPosts(posts, { ...options, query: "없는 검색어" }).length, 0);
  assert.equal(filterPosts(posts, { ...options, tags: [] }).length, 4);
  assert.equal(paginate(sortPosts(filterPosts(posts, options), "latest"), 1)[0].id, "1");
  assert.equal(summarizeReviewTags(posts, "자월도").tags[0].percent, 50);
});

test("multiple tags require every selected feature; individual and full deselection restore results", () => {
  const options = { category: "review", islands: new Set(["자월도"]), activities: new Set(), query: "", tags: ["beautiful_sea", "family_friendly"] };
  assert.deepEqual(filterPosts(posts, options).map((post) => post.id), ["1"]);
  assert.deepEqual(filterPosts(posts, { ...options, tags: ["family_friendly"] }).map((post) => post.id), ["1", "2"]);
  assert.equal(filterPosts(posts, { ...options, tags: [] }).length, 4);
  assert.equal(filterPosts(posts, { ...options, tags: ["beautiful_sea", "quiet"] }).length, 0);
  const params = new URLSearchParams("tag=beautiful_sea&tag=family_friendly&tag=beautiful_sea&tag=unknown");
  assert.deepEqual(normalizeReviewTags(params.getAll("tag")), options.tags);
  assert.deepEqual(normalizeReviewTags(new URLSearchParams("tag=beautiful_sea").getAll("tag")), ["beautiful_sea"]);
});
