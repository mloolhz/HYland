import { runRecommendationEngine } from "@/lib/recommendation/engine/recommendation-engine";
import { enrichRecommendationsWithLlm } from "@/lib/recommendation/llm/description.mock";
import { formatTripDateRangeLabel } from "@/lib/trip-date";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";

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
  const engineResult = runRecommendationEngine(request);
  const tripSummary = buildTripSummary(request.trip);
  const enriched = enrichRecommendationsWithLlm(engineResult, tripSummary, request.trip);
  return delay(enriched);
}

export { runRecommendationEngine };
