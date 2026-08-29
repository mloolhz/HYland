import { getIslandBtiResult } from "@/data/island-bti/results";
import { ISLAND_MAP } from "@/lib/island-data";
import type { IslandBtiResultCode } from "@/types/island-bti";
import type { IslandRecommendationItem, RecommendationResponse } from "@/types/recommendation";

export type LlmDescriptionInput = {
  userIslandBti: string | null;
  userTraits: string[];
  item: IslandRecommendationItem;
  tripSummary: string;
};

/** LLM 역할: TOP3 확정 후 자연어 설명만 생성 (mock) */
export function buildMockLlmDescription(input: LlmDescriptionInput): string {
  const profile = input.userIslandBti
    ? getIslandBtiResult(input.userIslandBti as IslandBtiResultCode)
    : null;
  const islandInfo = ISLAND_MAP[input.item.islandId];
  // 성향 문구는 실제로 보여줄 게 있을 때만 쓴다. 예전에는 fallback("이번 여행 조건")까지
  // 만들어 `${traitLine}의 취향과`를 따로 문단으로 넣는 바람에, 문장이 "과"에서 끊긴 채
  // 단독 문단으로 렌더됐다.
  const traitLine = input.userTraits.length > 0 ? input.userTraits.join(", ") : null;

  const btiLine = profile
    ? `${profile.code}(${profile.name}) 성향의 당신에게 ${input.item.islandName}를 추천해요.`
    : `이번 여행 조건에 맞춰 ${input.item.islandName}를 추천해요.`;

  // 일치도 수치("...87% 일치해요")는 점수표·추천 근거와 같은 사실을 세 번째로 반복하던
  // 문장이라 뺐다. 수치는 접이식 점수 상세 한 곳에서만 보여준다.
  const traitLineSentence = traitLine ? `${traitLine} 취향과 잘 맞아요.` : null;

  const activityLine =
    input.item.recommendedActivities.length > 0
      ? `${input.item.islandName}에서 ${input.item.recommendedActivities.join(" · ")} 활동을 즐기기 좋아요.`
      : islandInfo?.intro ?? "";

  const explorationReason = input.item.recommendationReasons.find((reason) =>
    reason.includes("여권"),
  );

  const parts = [btiLine, traitLineSentence, activityLine];
  if (explorationReason) parts.push(explorationReason);

  return parts.filter(Boolean).join("\n\n");
}

export function buildMockItinerary(item: IslandRecommendationItem): { order: number; name: string }[] {
  const activities = item.recommendedActivities;
  const steps = [
    { order: 1, name: "인천항 출발 · 섬 도착" },
    ...activities.map((name, index) => ({ order: index + 2, name })),
    { order: activities.length + 2, name: "일몰 감상 후 귀항" },
  ];
  return steps;
}

export function enrichRecommendationsWithLlm(
  response: RecommendationResponse,
  tripSummary: string,
): RecommendationResponse {
  return {
    ...response,
    recommendations: response.recommendations.map((item) => ({
      ...item,
      aiDescription: buildMockLlmDescription({
        userIslandBti: response.userIslandBti,
        userTraits: response.userTraits,
        item,
        tripSummary,
      }),
      itinerary: buildMockItinerary(item),
    })),
  };
}
