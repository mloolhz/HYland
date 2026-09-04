import type { CourseStep } from "@/types/ai-recommend";
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
  /** 실제 레저시설 데이터(관광공사 API + 웹 조사) 기반 일치도 */
  facilityMatch: number;
  /** 종목-섬 목록(24종목 88쌍) 기반 일치도 */
  sportsMatch: number;
  /** 커뮤니티 후기 기반 일치도 */
  communityMatch: number;
  weather: number;
  transport: number;
  condition: number;
  exploration: number;
  finalScore: number;
};

/** 추천 섬 항목 (순위·추천도는 화면에 노출하지 않는다) */
export type IslandRecommendationItem = {
  islandId: string;
  islandName: string;
  finalScore: number;
  scores: Omit<RecommendationScoreBreakdown, "finalScore">;
  recommendationReasons: string[];
  tags: string[];
  estimatedBudget: number;
  recommendedActivities: string[];
  /**
   * 선택한 활동에 실제로 대응하는 레저시설 (관광공사 API + 웹 조사).
   * 추천도(%)를 없앤 뒤 "왜 이 섬인지"를 뒷받침하는 검증 가능한 근거로 쓴다.
   */
  facilityHighlights?: { name: string; activity: string }[];
  /** 이 섬에서 실제로 가능한 종목 중 선택한 활동에 해당하는 것 */
  sportHighlights?: string[];
  /**
   * 추천된 종목의 외부 이용·예약 안내 링크 (레저스포츠 탭과 같은 출처).
   * 추천을 보고 바로 예약·문의로 넘어갈 수 있게 한다.
   */
  externalLinks?: { sportName: string; label: string; url: string; tel?: string }[];
  /** 방문객이 자주 남긴 주의·팁 (커뮤니티 후기 합의) */
  communityCautions?: string[];
  /** 추천 근거가 된 커뮤니티 후기 */
  communityHighlights?: {
    postId: string;
    title: string;
    /** 본문에서 뽑은 대표 문장 (없으면 제목을 쓴다) */
    highlight?: string;
    activity: string;
    likes: number;
  }[];
  aiDescription?: string;
  /**
   * 하루 코스 (시간·활동·설명).
   * 예전 itinerary는 활동명만 나열한 5줄이라 접어둘 이유가 없었다.
   * 일반 질문 답변과 같은 타임라인 형태로 맞춘다.
   */
  course?: { title: string; steps: CourseStep[] };
};

export type RecommendationResponse = {
  useIslandBti: boolean;
  userIslandBti: IslandBtiResultCode | null;
  userTraits: string[];
  recommendations: IslandRecommendationItem[];
};
