import { RECOMMENDATION_WEIGHTS } from "@/lib/recommendation/config/recommendation-weights";
import type { RecommendationScoreBreakdown } from "@/types/recommendation";

export function computeFinalScore(
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  useIslandBti: boolean,
): number {
  // 섬BTI를 안 쓰면 그 몫을 여행 조건 쪽으로 넘긴다. 전부 currentTripMatch에 몰면
  // 손으로 적은 특성 벡터 비중이 과해지므로, 실제 시설 근거인 facilityMatch와 나눈다.
  const weights = useIslandBti
    ? RECOMMENDATION_WEIGHTS
    : {
        ...RECOMMENDATION_WEIGHTS,
        islandBtiMatch: 0,
        currentTripMatch:
          RECOMMENDATION_WEIGHTS.currentTripMatch + RECOMMENDATION_WEIGHTS.islandBtiMatch / 2,
        facilityMatch:
          RECOMMENDATION_WEIGHTS.facilityMatch + RECOMMENDATION_WEIGHTS.islandBtiMatch / 2,
      };

  const weighted =
    scores.islandBtiMatch * weights.islandBtiMatch +
    scores.currentTripMatch * weights.currentTripMatch +
    scores.facilityMatch * weights.facilityMatch +
    scores.weather * weights.weather +
    scores.transport * weights.transport +
    scores.condition * weights.condition +
    scores.exploration * weights.exploration;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}
