import { RECOMMENDATION_WEIGHTS } from "@/lib/recommendation/config/recommendation-weights";
import type { RecommendationScoreBreakdown } from "@/types/recommendation";

export function computeFinalScore(
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  useIslandBti: boolean,
): number {
  // 섬BTI를 안 쓰면 그 몫을 나머지 신호로 넘긴다. 전부 currentTripMatch에 몰면
  // 손으로 적은 특성 벡터 비중이 과해지므로, 실제 데이터 근거인 세 신호와 나눈다.
  const bti = RECOMMENDATION_WEIGHTS.islandBtiMatch;
  const weights = useIslandBti
    ? RECOMMENDATION_WEIGHTS
    : {
        ...RECOMMENDATION_WEIGHTS,
        islandBtiMatch: 0,
        currentTripMatch: RECOMMENDATION_WEIGHTS.currentTripMatch + bti * 0.3,
        facilityMatch: RECOMMENDATION_WEIGHTS.facilityMatch + bti * 0.23,
        sportsMatch: RECOMMENDATION_WEIGHTS.sportsMatch + bti * 0.32,
        communityMatch: RECOMMENDATION_WEIGHTS.communityMatch + bti * 0.15,
      };

  const weighted =
    scores.islandBtiMatch * weights.islandBtiMatch +
    scores.currentTripMatch * weights.currentTripMatch +
    scores.facilityMatch * weights.facilityMatch +
    scores.sportsMatch * weights.sportsMatch +
    scores.communityMatch * weights.communityMatch +
    scores.weather * weights.weather +
    scores.transport * weights.transport +
    scores.condition * weights.condition +
    scores.exploration * weights.exploration;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}
