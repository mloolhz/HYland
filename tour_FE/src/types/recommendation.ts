import type { IslandBtiResultCode } from "@/types/island-bti";

/** 추천 알고리즘 공통 Feature 키 (User ↔ Island 비교용) */
export const PREFERENCE_FEATURE_KEYS = [
  "activity",
  "healing",
  "nature",
  "challenge",
  "leisure",
  "culture",
  "food",
] as const;

export type PreferenceFeatureKey = (typeof PREFERENCE_FEATURE_KEYS)[number];

/** 0~1 정규화된 여행 성향 벡터 */
export type PreferenceVector = Record<PreferenceFeatureKey, number>;

/** 동행·여행 조건 매칭용 (섬 Feature에만 companion 점수 포함) */
export type CompanionFeatureKey = "solo" | "couple" | "friend" | "family";

export type CompanionVector = Record<CompanionFeatureKey, number>;

/** 섬BTI 기반 사용자 추천 프로필 */
export type UserPreference = {
  /** 서버 연동 전 FE demo user id */
  userId: string;
  islandBti: IslandBtiResultCode;
  /** Base Preference — 섬BTI scores에서 파생 */
  vector: PreferenceVector;
  /** 향후 행동 데이터 블렌딩용 (MVP: 1.0) */
  btiWeight: number;
  source: "island-bti";
  updatedAt: string;
  testedAt: string;
};

/** 섬 추천 Feature (관광·레저 메타 + companion) */
export type IslandRecommendationFeature = {
  islandId: string;
  name: string;
  vector: PreferenceVector;
  companion: CompanionVector;
  difficulty: number;
  averageBudget: number;
  recommendedDuration: number;
  activities: string[];
};

/** 이번 여행 의도 (Current Trip Intent) */
export type TripIntent = {
  travelDate?: string;
  /** travelDate와 같으면 당일치기 */
  travelEndDate?: string;
  duration?: number;
  departure?: string;
  companion?: CompanionFeatureKey;
  intensity?: "relaxed" | "moderate" | "active";
  travelMood?: "healing" | "active" | "nature" | "social" | "adventure";
  activities?: string[];
};

/** 추천 요청 */
export type RecommendationRequest = {
  trip: TripIntent;
  /** 기본 true — false면 이번 여행 조건 중심 */
  useIslandBti?: boolean;
};

/** 세부 추천 점수 (0~100) */
export type RecommendationScoreBreakdown = {
  islandBtiMatch: number;
  currentTripMatch: number;
  weather: number;
  transport: number;
  condition: number;
  exploration: number;
  finalScore: number;
};

/** TOP N 추천 항목 */
export type IslandRecommendationItem = {
  rank: number;
  islandId: string;
  islandName: string;
  finalScore: number;
  scores: Omit<RecommendationScoreBreakdown, "finalScore">;
  recommendationReasons: string[];
  tags: string[];
  estimatedBudget: number;
  recommendedActivities: string[];
  aiDescription?: string;
  itinerary?: { order: number; name: string }[];
};

export type RecommendationResponse = {
  useIslandBti: boolean;
  userIslandBti: IslandBtiResultCode | null;
  userTraits: string[];
  recommendations: IslandRecommendationItem[];
};
