import { getIslandBtiResult } from "@/data/island-bti/results";
/** 섬BTI 결과 화면 「추천 섬」과 동일 — island-matches 기반 */
export type IslandBtiRecommendedDisplay = {
  islandName: string;
  reason: string;
};

export function getIslandBtiRecommendedDisplay(code: string): IslandBtiRecommendedDisplay[] {
  const profile = getIslandBtiResult(code);
  if (!profile) return [];

  return profile.recommendedIslands.map((islandName, index) => ({
    islandName,
    reason: profile.recommendedIslandReasons[index] ?? "",
  }));
}

export function buildBtiResultReasonByIsland(
  display: IslandBtiRecommendedDisplay[],
): Record<string, string> {
  return Object.fromEntries(display.map((row) => [row.islandName, row.reason]));
}
