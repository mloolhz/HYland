import { runRecommendationEngine } from "@/lib/recommendation/engine/recommendation-engine";
import { enrichRecommendationsWithLlm } from "@/lib/recommendation/llm/description.mock";
import { formatTripDateRangeLabel } from "@/lib/trip-date";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";
import type { IslandRecommendationItem } from "@/types/recommendation";
import { ISLAND_BTI_ISLAND_MATCHES } from "@/data/island-bti/island-matches";
import type { IslandBtiResultCode } from "@/types/island-bti";

function buildMinimalBtiItem(islandName: string, reason: string): IslandRecommendationItem {
  const emptyScores = {
    islandBtiMatch: 0,
    currentTripMatch: 0,
    facilityMatch: 0,
    sportsMatch: 0,
    communityMatch: 0,
    weather: 0,
    transport: 0,
    condition: 0,
    exploration: 0,
  };
  return {
    islandId: `bti-${islandName}`,
    islandName,
    finalScore: 0,
    scores: emptyScores,
    recommendationReasons: [reason],
    tags: [],
    estimatedBudget: 0,
    recommendedActivities: [],
  };
}

/** 결과 페이지의 공통 매핑을 그대로 카드 응답으로 만든다. 일반 추천 엔진을 거치지 않는다. */
export async function getFixedIslandBtiRecommendations(
  code: IslandBtiResultCode,
): Promise<RecommendationResponse> {
  const matches = ISLAND_BTI_ISLAND_MATCHES[code];
  return delay({
    useIslandBti: true,
    userIslandBti: code,
    userTraits: [],
    recommendations: matches.map(({ island, reason }) => buildMinimalBtiItem(island, reason)),
  });
}

function delay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

function buildTripSummary(trip: RecommendationRequest["trip"]): string {
  const parts: string[] = [];
  if (trip.travelDate) {
    const end = trip.travelEndDate ?? trip.travelDate;
    parts.push(formatTripDateRangeLabel(trip.travelDate, end));
  }
  if (trip.companion) parts.push(`동행 ${trip.companion}`);
  if (trip.travelMood) parts.push(`분위기 ${trip.travelMood}`);
  if (trip.activities?.length) parts.push(`활동 ${trip.activities.join(", ")}`);
  return parts.join(" · ");
}

/** FE mock API — 백엔드 POST /api/recommendations 교체 지점 */
export async function postRecommendations(
  request: RecommendationRequest,
): Promise<RecommendationResponse> {
  const matches = request.fixedIslandBtiCode
    ? ISLAND_BTI_ISLAND_MATCHES[request.fixedIslandBtiCode]
    : null;
  const engineResult = runRecommendationEngine({
    ...request,
    fixedIslandNames: matches?.map(({ island }) => island),
  });
  const tripSummary = buildTripSummary(request.trip);
  const enriched = enrichRecommendationsWithLlm(engineResult, tripSummary, request.trip);
  if (!matches) return delay(enriched);

  const byName = new Map(enriched.recommendations.map((item) => [item.islandName, item]));
  return delay({
    ...enriched,
    userIslandBti: request.fixedIslandBtiCode ?? enriched.userIslandBti,
    useIslandBti: true,
    recommendations: matches.map(({ island, reason }) => {
      const existing = byName.get(island);
      return existing
        ? { ...existing, recommendationReasons: [reason], aiDescription: undefined }
        : buildMinimalBtiItem(island, reason);
    }),
  });
}

export { runRecommendationEngine };
