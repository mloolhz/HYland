import { ISLAND_MAP, ISLANDS } from "@/lib/island-data";
import {
  getUniqueIslandIdsFromEarnedStamps,
  resolveIslandIdFromStampPlace,
} from "@/lib/passport/stamp-island-link";
import { getMissionStampStats } from "@/lib/passport/passport-mission-stamps";
import {
  isInkStampEarned,
  questToInkStampDisplay,
} from "@/lib/passport/passport-quest-ink-stamp";
import { MISSION_QUESTS, type MissionQuest } from "@/mocks/missions";

export const INCHEON_ISLAND_TOTAL = ISLANDS.length;

export type PassportIslandStorySummary = {
  firstVisitedIsland: string | null;
  recentVisitedIsland: string | null;
  visitedIslandCount: number;
  earnedStampCount: number;
  completedMissionCount: number;
  explorationStartedAt: string | null;
  explorationRate: {
    visited: number;
    total: number;
    percent: number;
  };
};

function parseStampDate(dateStr: string): number {
  const [year, month, day] = dateStr.split(".").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function formatStoryDate(dateMs: number): string {
  const date = new Date(dateMs);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/** 획득한 여권 도장(미션) 개수 */
export function getEarnedPassportStampCount(quests: MissionQuest[] = MISSION_QUESTS): number {
  return quests.filter((quest) => isInkStampEarned(quest)).length;
}

/** 방문·도장 원본에서 나의 섬 이야기 요약을 계산한다. */
export function calculatePassportIslandStorySummary(
  /** 실제 진행도가 얹힌 미션 목록 (mission-progress 스토어) */
  quests: MissionQuest[] = MISSION_QUESTS,
  /** questId → 완료 시각. 없으면 날짜 없는 도장으로 본다. */
  completedAt: Map<number, string> = new Map(),
): PassportIslandStorySummary {
  const visitedIslandCount = getUniqueIslandIdsFromEarnedStamps(quests).length;
  const total = INCHEON_ISLAND_TOTAL;
  const islandTimeline = new Map<
    string,
    { name: string; earliest: number; latest: number }
  >();

  for (const quest of quests) {
    if (!isInkStampEarned(quest)) continue;

    const display = questToInkStampDisplay(quest, completedAt.get(quest.id));
    const islandId = resolveIslandIdFromStampPlace(display.place);
    if (!islandId || !display.earnedAt) continue;

    const islandName = ISLAND_MAP[islandId]?.name ?? display.place;
    const dateMs = parseStampDate(display.earnedAt);
    const existing = islandTimeline.get(islandId);

    if (!existing) {
      islandTimeline.set(islandId, {
        name: islandName,
        earliest: dateMs,
        latest: dateMs,
      });
      continue;
    }

    existing.earliest = Math.min(existing.earliest, dateMs);
    existing.latest = Math.max(existing.latest, dateMs);
  }

  const islands = [...islandTimeline.values()];
  const firstVisited =
    islands.length > 0
      ? islands.reduce((prev, curr) => (curr.earliest < prev.earliest ? curr : prev))
      : null;
  const recentVisited =
    islands.length > 0
      ? islands.reduce((prev, curr) => (curr.latest > prev.latest ? curr : prev))
      : null;

  return {
    firstVisitedIsland: firstVisited?.name ?? null,
    recentVisitedIsland: recentVisited?.name ?? null,
    visitedIslandCount,
    earnedStampCount: getEarnedPassportStampCount(quests),
    completedMissionCount: getMissionStampStats(quests).earned,
    explorationStartedAt: firstVisited ? formatStoryDate(firstVisited.earliest) : null,
    explorationRate: {
      visited: visitedIslandCount,
      total,
      percent: total > 0 ? Math.round((visitedIslandCount / total) * 100) : 0,
    },
  };
}
