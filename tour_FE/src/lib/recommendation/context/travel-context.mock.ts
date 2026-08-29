import { ISLANDS } from "@/lib/island-data";

export type IslandTravelContext = {
  islandId: string;
  ferryAvailable: boolean;
  waveHeightM: number;
  weatherAlert: "none" | "wind" | "storm";
  transportMinutesFromIncheon: number;
  carAccessible: boolean;
  publicTransportAccessible: boolean;
};

/** travelTime 문자열 → 분 (mock 파싱) */
function parseTravelMinutes(travelTime: string): number {
  const hourMatch = travelTime.match(/(\d+)\s*시간/);
  const minMatch = travelTime.match(/(\d+)\s*분/);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const mins = minMatch ? Number(minMatch[1]) : 0;
  return hours * 60 + mins;
}

/** 외부 API 교체 전 mock — travelDate 기반 결정적 변동 */
function seededNoise(seed: string, index: number): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 997;
  }
  return (hash % 100) / 100;
}

/**
 * 이 모듈의 날씨·해상 데이터(파고·기상특보·결항)가 실제 값이 아니라
 * seededNoise()로 만들어낸 가짜라는 표시.
 *
 * 실제 기상 API를 붙이면 false로 바꾼다. hard-filter가 이 값을 보고,
 * 가짜 데이터로 섬을 후보에서 제외하지 않도록 막는다.
 * (교통 소요시간은 island-data의 travelTime을 파싱한 실제 값이라 해당 없음)
 */
export const IS_MOCK_WEATHER_CONTEXT = true;

/**
 * 날씨·교통 mock context.
 * 실제 API 연동 시 이 모듈만 교체한다.
 */
export function buildMockIslandTravelContexts(travelDate?: string): IslandTravelContext[] {
  const dateKey = travelDate ?? new Date().toISOString().slice(0, 10);

  return ISLANDS.map((island, index) => {
    const noise = seededNoise(dateKey, index);
    const baseMinutes = parseTravelMinutes(island.travelTime);

    return {
      islandId: island.id,
      ferryAvailable: noise > 0.08,
      waveHeightM: 0.5 + noise * 2.2,
      weatherAlert: noise > 0.92 ? "storm" : noise > 0.78 ? "wind" : "none",
      transportMinutesFromIncheon: baseMinutes,
      carAccessible: island.id === "gangh" || island.id === "yeongj" || island.id === "muui",
      publicTransportAccessible: baseMinutes <= 120,
    };
  });
}

export function getIslandTravelContext(
  islandId: string,
  travelDate?: string,
): IslandTravelContext | undefined {
  return buildMockIslandTravelContexts(travelDate).find((ctx) => ctx.islandId === islandId);
}
