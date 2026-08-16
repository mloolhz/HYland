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

export function buildRecommendationReasons(
  islandId: string,
  islandName: string,
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  ctx: ReasonContext,
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

  if (scores.weather >= 80) {
    reasons.push("여행 예정일의 기상 조건이 양호합니다.");
  } else if (scores.weather >= 55) {
    reasons.push("기상 조건은 보통 수준이니 일정 여유를 두세요.");
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

export function attachRank(items: Omit<IslandRecommendationItem, "rank">[]): IslandRecommendationItem[] {
  return items
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
