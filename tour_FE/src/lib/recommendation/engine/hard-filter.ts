import { RECOMMENDATION_THRESHOLDS } from "@/lib/recommendation/config/recommendation-weights";
import type { IslandTravelContext } from "@/lib/recommendation/context/travel-context.mock";
import type { IslandRecommendationFeature, TripIntent } from "@/types/recommendation";

export type HardFilterResult = {
  passed: boolean;
  reasons: string[];
};

export function applyHardFilters(
  island: IslandRecommendationFeature,
  context: IslandTravelContext,
  trip: TripIntent,
): HardFilterResult {
  const reasons: string[] = [];

  if (!context.ferryAvailable) {
    reasons.push("여객선 운항이 중단된 상태입니다.");
  }

  if (context.weatherAlert === "storm") {
    reasons.push("심각한 기상특보로 방문이 어렵습니다.");
  }

  if (context.waveHeightM > RECOMMENDATION_THRESHOLDS.maxWaveHeightM) {
    reasons.push("파고가 높아 해상 이동이 제한됩니다.");
  }

  if (trip.duration !== undefined && trip.duration > 0) {
    if (island.recommendedDuration > trip.duration) {
      reasons.push("여행 기간상 방문하기 어렵습니다.");
    }
  }

  return { passed: reasons.length === 0, reasons };
}
