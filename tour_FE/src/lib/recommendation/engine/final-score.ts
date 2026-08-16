import { RECOMMENDATION_WEIGHTS } from "@/lib/recommendation/config/recommendation-weights";
import type { RecommendationScoreBreakdown } from "@/types/recommendation";

export function computeFinalScore(
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  useIslandBti: boolean,
): number {
  const weights = useIslandBti
    ? RECOMMENDATION_WEIGHTS
    : {
        ...RECOMMENDATION_WEIGHTS,
        islandBtiMatch: 0,
        currentTripMatch: RECOMMENDATION_WEIGHTS.currentTripMatch + RECOMMENDATION_WEIGHTS.islandBtiMatch,
      };

  const weighted =
    scores.islandBtiMatch * weights.islandBtiMatch +
    scores.currentTripMatch * weights.currentTripMatch +
    scores.weather * weights.weather +
    scores.transport * weights.transport +
    scores.condition * weights.condition +
    scores.exploration * weights.exploration;

  return Math.round(Math.min(100, Math.max(0, weighted)));
}
