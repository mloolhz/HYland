import { ISLAND_RECOMMENDATION_FEATURES } from "@/data/island-recommendation-features";
import { getUniqueIslandIdsFromEarnedStamps } from "@/lib/passport/stamp-island-link";
import { buildMockIslandTravelContexts } from "@/lib/recommendation/context/travel-context.mock";
import { scoreContextFactors } from "@/lib/recommendation/engine/context-scorer";
import { computeFinalScore } from "@/lib/recommendation/engine/final-score";
import { applyHardFilters } from "@/lib/recommendation/engine/hard-filter";
import {
  pickTopIslands,
  buildRecommendationReasons,
  buildRecommendationTags,
  pickRecommendedActivities,
} from "@/lib/recommendation/engine/reason-builder";
import { scoreCurrentTripMatch } from "@/lib/recommendation/engine/trip-intent-scorer";
import { scoreCommunityMatch } from "@/lib/recommendation/community/community-signal";
import {
  getIslandFacilitySummary,
  scoreFacilityMatch,
} from "@/lib/recommendation/facility/island-facility-index";
import {
  getIslandSports,
  scoreSportsMatch,
} from "@/lib/recommendation/facility/island-sports-index";
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

  const candidates: IslandRecommendationItem[] = [];

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
    const facility = scoreFacilityMatch(island.islandId, request.trip);
    const sports = scoreSportsMatch(island.islandId, request.trip);
    const community = scoreCommunityMatch(island.islandId, request.trip);

    const partialScores = {
      islandBtiMatch,
      currentTripMatch,
      facilityMatch: facility.score,
      sportsMatch: sports.score,
      communityMatch: community.score,
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
        facility,
        sports,
        community,
      ),
      tags: buildRecommendationTags(partialScores, visitedIslandIds.has(island.islandId)),
      estimatedBudget: island.averageBudget,
      recommendedActivities: pickRecommendedActivities(
        island.activities,
        request.trip.activities,
        {
          sportNames: getIslandSports(island.islandId).map((s) => s.name),
          facilityActivities: [...(getIslandFacilitySummary(island.islandId)?.byActivity.keys() ?? [])],
        },
      ),
      facilityHighlights: facility.matchedActivities
        .flatMap((matched) => matched.samples)
        .slice(0, 3)
        .map((f) => ({ name: f.name, activity: f.activity })),
      sportHighlights: [...new Set(sports.matched.flatMap((m) => m.sportNames))].slice(0, 4),
      // 같은 글이 여러 활동에 걸릴 수 있다(카약·바다 → 같은 패들보드 후기). postId로 중복 제거.
      communityHighlights: [
        ...new Map(
          community.evidences
            .filter((e) => e.topPost !== null)
            .map((e) => [
              e.topPost!.id,
              {
                postId: e.topPost!.id,
                title: e.topPost!.title,
                // 본문에서 뽑은 문장이 있으면 제목보다 그걸 보여준다.
                // 제목은 "덕적도 SUP 첫 도전"처럼 사실만 담는 경우가 많은데,
                // 대표 문장은 "왜 좋았는지"가 드러나 근거로 훨씬 낫다.
                highlight: e.topPost!.highlight,
                activity: e.tripActivity,
                likes: e.topPost!.likes,
              },
            ]),
        ).values(),
      ].slice(0, 2),
    });
  }

  const recommendations = pickTopIslands(candidates);

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
