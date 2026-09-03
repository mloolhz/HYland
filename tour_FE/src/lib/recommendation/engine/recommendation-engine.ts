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
  getFacilitiesForTripActivity,
  getIslandFacilitySummary,
  scoreFacilityMatch,
} from "@/lib/recommendation/facility/island-facility-index";
import {
  getIslandSports,
  getSportById,
  scoreSportsMatch,
} from "@/lib/recommendation/facility/island-sports-index";
import { LEISURE_FACILITY_LINKS } from "@/data/leisure-facility-links";
import { getPrimaryInfoSource, sourceButtonLabel } from "@/lib/sport-booking-resolve";
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

/**
 * 카드에 붙일 외부 링크를 모은다.
 *
 * 우선순위가 있다.
 *  1) 시설 자체의 홈페이지 — 관광공사 TourAPI(detailCommon2)의 homepage 필드.
 *     수집 때는 areaBasedList2만 불러 이 값이 빠져 있었고, 그래서 링크가 전부
 *     수작업으로 모은 포털 주소(인천 섬포털 등)였다. 추천한 바로 그 시설의
 *     홈페이지가 훨씬 구체적이라 이쪽을 먼저 쓴다.
 *  2) 종목 단위 안내처 — 시설 홈페이지가 없을 때의 대비책.
 *     판단 규칙은 레저스포츠 탭의 getPrimaryInfoSource를 그대로 재사용한다.
 *
 * 같은 기관이 여러 종목·시설의 안내처인 경우가 많아 URL로 중복을 없앤다.
 */
function buildExternalLinks(
  facilities: { id: string; name: string; activity: string }[],
  sportIds: string[],
) {
  const byUrl = new Map<string, { sportName: string; label: string; url: string; tel?: string }>();

  // 1) 시설 홈페이지 (API 출처).
  //    홈페이지가 있는 시설은 145곳 중 43곳뿐이라, 카드에 이름만 띄운 2곳으로
  //    한정하면 링크가 거의 안 잡힌다. 매칭된 시설 전체를 놓고 링크가 있는 것부터 고른다.
  for (const facility of facilities) {
    const url = LEISURE_FACILITY_LINKS[facility.id];
    if (!url || byUrl.has(url)) continue;
    byUrl.set(url, { sportName: facility.activity, label: facility.name, url });
    if (byUrl.size >= 3) break;
  }

  // 2) 부족하면 종목 단위 안내처로 채운다
  for (const sportId of sportIds) {
    if (byUrl.size >= 3) break;
    const sport = getSportById(sportId);
    if (!sport) continue;
    const source = getPrimaryInfoSource(sportId);
    if (!source?.url || byUrl.has(source.url)) continue;
    byUrl.set(source.url, {
      sportName: sport.name,
      label: sourceButtonLabel(source, sport.reservationType),
      url: source.url,
      tel: source.tel,
    });
  }

  return [...byUrl.values()].slice(0, 3);
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
    // 시설이 이미 확인해 준 활동은 종목 목록에 없더라도 감점하지 않는다.
    const confirmedByFacility = new Set(facility.matchedActivities.map((m) => m.tripActivity));
    const sports = scoreSportsMatch(island.islandId, request.trip, confirmedByFacility);
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
      // 레저스포츠 탭과 같은 출처를 그대로 쓴다. 추천을 보고 바로 예약·문의로
      // 넘어갈 수 있게, 매칭된 종목의 이용정보 링크를 카드에 붙인다.
      externalLinks: buildExternalLinks(
        facility.matchedActivities.flatMap((m) =>
          getFacilitiesForTripActivity(island.islandId, m.tripActivity).map((f) => ({
            id: f.id,
            name: f.name,
            activity: f.activity,
          })),
        ),
        sports.matched.flatMap((m) => m.sportIds),
      ),
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
