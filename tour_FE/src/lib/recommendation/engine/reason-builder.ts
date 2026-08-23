import type { IslandTravelContext } from "@/lib/recommendation/context/travel-context.mock";
import type {
  IslandRecommendationItem,
  RecommendationScoreBreakdown,
  TripIntent,
  UserPreference,
} from "@/types/recommendation";

type ReasonContext = {
  useIslandBti: boolean;
  userPreference: UserPreference | null;
  trip: TripIntent;
  visitedIslandIds: Set<string>;
};

type WeatherContext = Pick<IslandTravelContext, "weatherAlert" | "waveHeightM">;

/** "기상 조건은 보통 수준" 같은 추상 점수 대신, 특보·파고 등 구체적인 근거를 문장으로 만든다. */
function buildWeatherReason(weather: WeatherContext): string {
  const waveHeightLabel = weather.waveHeightM.toFixed(1);

  if (weather.weatherAlert === "storm") {
    return "여행 예정일에 폭풍 특보가 있어요. 일정 변경이나 실내 위주 코스를 고려하세요.";
  }
  if (weather.weatherAlert === "wind") {
    return `강풍 특보로 파도가 높아질 수 있어요(파고 약 ${waveHeightLabel}m 예상). 배편 지연·결항에 대비하세요.`;
  }
  if (weather.waveHeightM > 2) {
    return `파도가 높은 편이에요(파고 약 ${waveHeightLabel}m). 뱃멀미가 걱정되면 멀미약을 챙기세요.`;
  }
  if (weather.waveHeightM > 1.5) {
    return `파도가 다소 있는 편이에요(파고 약 ${waveHeightLabel}m). 배편 이용 시 참고하세요.`;
  }
  return `예보상 파도가 잔잔해요(파고 약 ${waveHeightLabel}m). 배편 이용하기 좋은 날씨예요.`;
}

export function buildRecommendationReasons(
  islandId: string,
  islandName: string,
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  ctx: ReasonContext,
  weather: WeatherContext,
): string[] {
  const reasons: string[] = [];

  if (ctx.useIslandBti && ctx.userPreference && scores.islandBtiMatch >= 70) {
    reasons.push(`섬BTI 성향과 ${scores.islandBtiMatch}% 일치합니다.`);
  } else if (ctx.useIslandBti && ctx.userPreference) {
    reasons.push("섬BTI 성향을 반영해 후보를 선별했습니다.");
  }

  if (scores.currentTripMatch >= 75) {
    reasons.push(`이번 여행 스타일과 ${scores.currentTripMatch}% 일치합니다.`);
  }

  reasons.push(buildWeatherReason(weather));

  if (scores.transport >= 75) {
    reasons.push("교통 접근성이 비교적 좋습니다.");
  }

  if (ctx.trip.duration && scores.condition >= 80) {
    reasons.push("여행 기간 조건에 적합합니다.");
  }

  if (!ctx.visitedIslandIds.has(islandId)) {
    reasons.push("아직 여권에 도장이 없는 섬이라 새로운 탐험지로 추천했어요.");
  }

  if (reasons.length === 0) {
    reasons.push(`${islandName}의 레저·환경 조건이 이번 여행과 맞습니다.`);
  }

  return reasons.slice(0, 4);
}

export function pickRecommendedActivities(
  islandActivities: string[],
  tripActivities: string[] | undefined,
  limit = 3,
): string[] {
  if (!tripActivities?.length) return islandActivities.slice(0, limit);

  const matched = islandActivities.filter((activity) =>
    tripActivities.some((selected) => activity.includes(selected) || selected.includes(activity)),
  );

  if (matched.length > 0) return matched.slice(0, limit);
  return islandActivities.slice(0, limit);
}

export function buildRecommendationTags(
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  visited: boolean,
): string[] {
  const tags: string[] = [];
  if (scores.islandBtiMatch >= 80) tags.push("섬BTI 일치");
  if (scores.currentTripMatch >= 85) tags.push("여행 의도 적합");
  if (scores.weather >= 80) tags.push("날씨 양호");
  if (!visited) tags.push("미방문");
  return tags;
}

export function attachRank(items: Omit<IslandRecommendationItem, "rank">[]): IslandRecommendationItem[] {
  return items
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
