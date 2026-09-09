export const REVIEW_TAG_CATEGORIES = [
  { id: "nature", label: "풍경·자연" },
  { id: "activities", label: "활동·즐길거리" },
  { id: "atmosphere", label: "분위기·여행 스타일" },
  { id: "convenience", label: "교통·여행 편의" },
  { id: "considerations", label: "여행 시 참고할 점" },
] as const;

export type ReviewTagCategory = (typeof REVIEW_TAG_CATEGORIES)[number]["id"];

export const REVIEW_TAGS = [
  { id: "beautiful_sea", label: "바다가 예뻐요", category: "nature" },
  { id: "beautiful_sunset", label: "일몰이 예뻐요", category: "nature" },
  { id: "photogenic", label: "사진 찍기 좋아요", category: "nature" },
  { id: "unspoiled_nature", label: "자연 그대로예요", category: "nature" },
  { id: "good_for_walking", label: "산책하기 좋아요", category: "nature" },
  { id: "varied_activities", label: "액티비티가 다양해요", category: "activities" },
  { id: "good_for_fishing", label: "낚시하기 좋아요", category: "activities" },
  { id: "good_for_trekking", label: "트레킹하기 좋아요", category: "activities" },
  { id: "good_for_cycling", label: "자전거 타기 좋아요", category: "activities" },
  { id: "good_for_swimming", label: "물놀이하기 좋아요", category: "activities" },
  { id: "quiet", label: "조용하고 한적해요", category: "atmosphere" },
  { id: "relaxing", label: "힐링하기 좋아요", category: "atmosphere" },
  { id: "couple_friendly", label: "연인과 가기 좋아요", category: "atmosphere" },
  { id: "family_friendly", label: "가족과 가기 좋아요", category: "atmosphere" },
  { id: "solo_friendly", label: "혼자 가기 좋아요", category: "atmosphere" },
  { id: "car_free_friendly", label: "뚜벅이도 괜찮아요", category: "convenience" },
  { id: "car_recommended", label: "차가 있으면 좋아요", category: "convenience" },
  { id: "convenient_ferry", label: "배편이 편리해요", category: "convenience" },
  { id: "good_for_day_trip", label: "당일치기 좋아요", category: "convenience" },
  { id: "good_for_overnight_stay", label: "숙박하기 좋아요", category: "convenience" },
  { id: "limited_activities", label: "즐길거리가 적어요", category: "considerations" },
  { id: "difficult_without_car", label: "뚜벅이는 불편해요", category: "considerations" },
  { id: "long_travel_time", label: "이동시간이 길어요", category: "considerations" },
  { id: "limited_amenities", label: "편의시설이 적어요", category: "considerations" },
  { id: "weather_dependent", label: "날씨 영향을 많이 받아요", category: "considerations" },
] as const satisfies readonly { id: string; label: string; category: ReviewTagCategory }[];

export type ReviewTagId = (typeof REVIEW_TAGS)[number]["id"];
export const MAX_REVIEW_TAGS = 5;

export function isReviewTagId(value: unknown): value is ReviewTagId {
  return typeof value === "string" && REVIEW_TAGS.some((tag) => tag.id === value);
}

/** Older reviews have no tags; unknown IDs and duplicates never affect counts. */
export function normalizeReviewTags(value: unknown): ReviewTagId[] {
  return Array.isArray(value) ? [...new Set(value.filter(isReviewTagId))] : [];
}

export function isValidReviewTags(value: unknown): value is ReviewTagId[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= MAX_REVIEW_TAGS
    && value.every(isReviewTagId) && new Set(value).size === value.length;
}

export function reviewTagLabel(id: ReviewTagId): string {
  return `#${REVIEW_TAGS.find((tag) => tag.id === id)!.label.replace(/\s/g, "")}`;
}
