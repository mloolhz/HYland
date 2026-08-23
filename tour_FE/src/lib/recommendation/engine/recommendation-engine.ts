import { ISLAND_RECOMMENDATION_FEATURES } from "@/data/island-recommendation-features";
import { getUniqueIslandIdsFromEarnedStamps } from "@/lib/passport/stamp-island-link";
import { buildMockIslandTravelContexts } from "@/lib/recommendation/context/travel-context.mock";
import { scoreContextFactors } from "@/lib/recommendation/engine/context-scorer";
import { computeFinalScore } from "@/lib/recommendation/engine/final-score";
import { applyHardFilters } from "@/lib/recommendation/engine/hard-filter";
import {
  attachRank,
  buildRecommendationReasons,
  buildRecommendationTags,
  pickRecommendedActivities,
} from "@/lib/recommendation/engine/reason-builder";
import { scoreCurrentTripMatch } from "@/lib/recommendation/engine/trip-intent-scorer";
import { getUserTraitLabelsFromBti } from "@/lib/recommendation/preference/bti-preference.mapper";
import { cosineSimilarityScore } from "@/lib/recommendation/preference/similarity";
import { loadUserPreference } from "@/lib/recommendation/preference/user-preference-storage";
import type {
  IslandRecommendationItem,
  RecommendationRequest,
  RecommendationResponse,
  UserPreference,
} from "@/types/recommendation";

export type RecommendationEngineOptions = {
  userPreference?: UserPreference | null;
  visitedIslandIds?: string[];
};

function resolveUserPreference(options?: RecommendationEngineOptions): UserPreference | null {
  return options?.userPreference ?? loadUserPreference();
}

function resolveVisitedIds(options?: RecommendationEngineOptions): Set<string> {
  const ids = options?.visitedIslandIds ?? getUniqueIslandIdsFromEarnedStamps();
  return new Set(ids);
}

export function runRecommendationEngine(
  request: RecommendationRequest,
  options?: RecommendationEngineOptions,
): RecommendationResponse {
  const userPreference = resolveUserPreference(options);
  const visitedIslandIds = resolveVisitedIds(options);
  const useIslandBti = request.useIslandBti === true && userPreference !== null;
  const contexts = buildMockIslandTravelContexts(request.trip.travelDate);
  const contextMap = new Map(contexts.map((ctx) => [ctx.islandId, ctx]));

  const candidates: Omit<IslandRecommendationItem, "rank">[] = [];

  for (const island of ISLAND_RECOMMENDATION_FEATURES) {
    const context = contextMap.get(island.islandId);
    if (!context) continue;

    const hardFilter = applyHardFilters(island, context, request.trip);
    if (!hardFilter.passed) continue;

    const islandBtiMatch =
      useIslandBti && userPreference
        ? cosineSimilarityScore(userPreference.vector, island.vector)
        : 0;

    const currentTripMatch = scoreCurrentTripMatch(request.trip, island);
    const contextScores = scoreContextFactors(island, context, request.trip, visitedIslandIds);

    const partialScores = {
      islandBtiMatch,
      currentTripMatch,
      weather: contextScores.weather,
      transport: contextScores.transport,
      condition: contextScores.condition,
      exploration: contextScores.exploration,
    };

    const finalScore = computeFinalScore(partialScores, useIslandBti);

    candidates.push({
      islandId: island.islandId,
      islandName: island.name,
      finalScore,
      scores: partialScores,
      recommendationReasons: buildRecommendationReasons(
        island.islandId,
        island.name,
        partialScores,
        {
          useIslandBti,
          userPreference,
          trip: request.trip,
          visitedIslandIds,
        },
        { weatherAlert: context.weatherAlert, waveHeightM: context.waveHeightM },
      ),
      tags: buildRecommendationTags(partialScores, visitedIslandIds.has(island.islandId)),
      estimatedBudget: island.averageBudget,
      recommendedActivities: pickRecommendedActivities(island.activities, request.trip.activities),
    });
  }

  const recommendations = attachRank(candidates);

  const userTraits =
    useIslandBti && userPreference
      ? getUserTraitLabelsFromBti(userPreference.islandBti, userPreference.vector)
      : [];

  return {
    useIslandBti,
    userIslandBti: userPreference?.islandBti ?? null,
    userTraits,
    recommendations,
  };
}
