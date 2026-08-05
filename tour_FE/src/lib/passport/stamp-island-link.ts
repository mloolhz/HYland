import { ISLANDS } from "@/lib/island-data";
import { MISSION_QUESTS } from "@/mocks/missions";
import { isInkStampEarned, questToInkStampDisplay } from "@/lib/passport/passport-quest-ink-stamp";

/** 도장 장소명 → 섬 id (비섬·메타 장소는 null) */
const PLACE_TO_ISLAND_ID: Record<string, string> = {
  "강화 갯벌": "gangh",
};

const NON_ISLAND_PLACES = new Set(["섬BTI", "인천 앞바다"]);

/**
 * 여권 도장 장소명을 섬 id로 변환한다.
 * 매칭되지 않거나 섬과 무관한 장소면 null.
 */
export function resolveIslandIdFromStampPlace(place: string): string | null {
  const trimmed = place.trim();
  if (!trimmed || NON_ISLAND_PLACES.has(trimmed)) return null;

  const alias = PLACE_TO_ISLAND_ID[trimmed];
  if (alias) return alias;

  const exact = ISLANDS.find((island) => island.name === trimmed);
  if (exact) return exact.id;

  const partial = ISLANDS.find(
    (island) => trimmed.includes(island.name) || island.name.includes(trimmed),
  );
  return partial?.id ?? null;
}

/**
 * 획득한 여권 도장 중 섬과 연결된 고유 섬 id 목록.
 * 같은 섬에서 도장을 여러 번 받아도 1개로 집계한다.
 * — MISSION_QUESTS + passport-quest-ink-stamp 를 단일 원본으로 사용.
 */
export function getUniqueIslandIdsFromEarnedStamps(): string[] {
  const ids = new Set<string>();

  for (const quest of MISSION_QUESTS) {
    if (!isInkStampEarned(quest)) continue;

    const { place } = questToInkStampDisplay(quest);
    const islandId = resolveIslandIdFromStampPlace(place);
    if (islandId) ids.add(islandId);
  }

  return [...ids];
}
