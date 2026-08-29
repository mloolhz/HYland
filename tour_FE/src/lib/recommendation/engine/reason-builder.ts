import {
  IS_MOCK_WEATHER_CONTEXT,
  type IslandTravelContext,
} from "@/lib/recommendation/context/travel-context.mock";
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

  // 퍼센트 수치는 접이식 점수 상세에만 둔다. 여기서 또 쓰면 점수표·설명문과 함께
  // 같은 사실이 한 카드에 세 번 반복된다.
  if (ctx.useIslandBti && ctx.userPreference && scores.islandBtiMatch >= 70) {
    reasons.push("섬BTI 성향과 잘 맞는 섬이에요.");
  } else if (ctx.useIslandBti && ctx.userPreference) {
    reasons.push("섬BTI 성향을 반영해 후보를 선별했습니다.");
  }

  if (scores.currentTripMatch >= 75) {
    reasons.push("이번 여행 스타일과 잘 맞아요.");
  }

  // 파고·특보가 아직 mock이라, 이걸 근거로 쓰면 위쪽 날씨 카드(Gemini 실검색)와
  // 서로 모순되는 문장이 한 화면에 같이 뜬다. 실제 기상 API를 붙이기 전까지는 생략한다.
  if (!IS_MOCK_WEATHER_CONTEXT) {
    reasons.push(buildWeatherReason(weather));
  }

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

/**
 * 후보 전체의 평균을 기준으로 편차를 넓혀 순위 차이가 읽히게 만든다.
 *
 * 원점수는 요소들이 구조적으로 비슷해 83~90처럼 좁은 구간에 몰린다. 그대로 두면
 * 1위와 꼴찌가 7점 차라 "추천도"가 신뢰 신호로 작동하지 않는다.
 * min-max로 늘이면 후보 수준과 무관하게 항상 1위=100/꼴찌=0이 되어 과장되므로,
 * 평균은 유지한 채 편차만 확대한다(전체가 좋으면 다 같이 높게 남는다).
 */
/**
 * 의도 벡터 재설계(trip-intent-scorer)로 원점수 자체가 22~31점 폭으로 벌어진 뒤라
 * 강한 확대는 오히려 상위권을 전부 상한(99)에 붙여버린다. 상위 몇 개를 구분할
 * 정도로만 완만하게 둔다.
 */
const SCORE_CONTRAST = 1.5;

export function spreadFinalScores<T extends { finalScore: number }>(items: T[]): T[] {
  if (items.length < 2) return items;

  const mean = items.reduce((sum, item) => sum + item.finalScore, 0) / items.length;

  return items.map((item) => ({
    ...item,
    finalScore: Math.round(
      Math.min(99, Math.max(35, mean + (item.finalScore - mean) * SCORE_CONTRAST)),
    ),
  }));
}

export function attachRank(items: Omit<IslandRecommendationItem, "rank">[]): IslandRecommendationItem[] {
  // 편차 확대는 후보 전체를 놓고 계산해야 의미가 있으므로 자르기 전에 적용한다.
  return spreadFinalScores(items)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
