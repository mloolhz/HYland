import { getUniqueIslandIdsFromEarnedStamps } from "@/lib/passport/stamp-island-link";

export type IslandSpiritLevel = 1 | 2 | 3 | 4;

export interface IslandSpiritGrowth {
  level: IslandSpiritLevel;
  title: string;
  visitedIslandCount: number;
  currentLevelMin: number;
  nextLevelTarget: number | null;
  progress: number;
  isMaxLevel: boolean;
}

const SPIRIT_LEVELS: {
  level: IslandSpiritLevel;
  title: string;
  min: number;
  next: number | null;
}[] = [
  { level: 1, title: "새싹 탐험가", min: 0, next: 3 },
  { level: 2, title: "섬길 탐험가", min: 3, next: 8 },
  { level: 3, title: "바다 모험가", min: 8, next: 15 },
  { level: 4, title: "섬 정령 마스터", min: 15, next: null },
];

function resolveLevelConfig(count: number) {
  if (count >= 15) return SPIRIT_LEVELS[3];
  if (count >= 8) return SPIRIT_LEVELS[2];
  if (count >= 3) return SPIRIT_LEVELS[1];
  return SPIRIT_LEVELS[0];
}

function calcProgress(count: number, min: number, next: number | null): number {
  if (next === null) return 100;
  const span = next - min;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((count - min) / span) * 100)));
}

/**
 * 섬BTI 정령 성장 상태 — 저장값 없이 매번 도장 원본에서 계산.
 */
export function calculateIslandSpiritGrowth(
  visitedIslandCount = getUniqueIslandIdsFromEarnedStamps().length,
): IslandSpiritGrowth {
  const config = resolveLevelConfig(visitedIslandCount);
  const isMaxLevel = config.next === null;

  return {
    level: config.level,
    title: config.title,
    visitedIslandCount,
    currentLevelMin: config.min,
    nextLevelTarget: config.next,
    progress: calcProgress(visitedIslandCount, config.min, config.next),
    isMaxLevel,
  };
}

export function getIslandSpiritLevelTitle(level: IslandSpiritLevel): string {
  return SPIRIT_LEVELS.find((entry) => entry.level === level)?.title ?? "새싹 탐험가";
}
