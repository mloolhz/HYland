import { RECOMMENDATION_THRESHOLDS } from "@/lib/recommendation/config/recommendation-weights";
import {
  IS_MOCK_WEATHER_CONTEXT,
  type IslandTravelContext,
} from "@/lib/recommendation/context/travel-context.mock";
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

  // 결항·기상특보·파고는 현재 seededNoise로 만든 가짜 값이다. 이걸로 후보를 자르면
  // 18개 섬 중 10개가 실제 근거 없이 사라지고, 날짜별로 결정적이라 특정 날짜엔
  // 특정 섬이 영구히 안 나온다. 실제 기상 API를 붙일 때까지는 제외 사유로 쓰지 않는다.
  if (!IS_MOCK_WEATHER_CONTEXT) {
    if (!context.ferryAvailable) {
      reasons.push("여객선 운항이 중단된 상태입니다.");
    }

    if (context.weatherAlert === "storm") {
      reasons.push("심각한 기상특보로 방문이 어렵습니다.");
    }

    if (context.waveHeightM > RECOMMENDATION_THRESHOLDS.maxWaveHeightM) {
      reasons.push("파고가 높아 해상 이동이 제한됩니다.");
    }
  }

  // 여행 기간은 사용자가 직접 고른 실제 조건이라 그대로 적용한다.
  if (trip.duration !== undefined && trip.duration > 0) {
    if (island.recommendedDuration > trip.duration) {
      reasons.push("여행 기간상 방문하기 어렵습니다.");
    }
  }

  return { passed: reasons.length === 0, reasons };
}
