import type { IslandBtiResultCode, IslandBtiResultData } from "@/types/island-bti";
import { ISLAND_BTI_AXIS_VALUES } from "@/types/island-bti";
import type { IslandBtiScoreMap } from "@/lib/island-bti";
import { ISLAND_BTI_RESULTS } from "./results-data.ts";

export { ISLAND_BTI_RESULT_CODES, ISLAND_BTI_RESULTS } from "./results-data.ts";

export function isIslandBtiResultCode(code: string): code is IslandBtiResultCode {
  return Object.prototype.hasOwnProperty.call(ISLAND_BTI_RESULTS, code);
}

export function getIslandBtiResult(code: string): IslandBtiResultData | null {
  if (!isIslandBtiResultCode(code)) return null;
  return ISLAND_BTI_RESULTS[code];
}

export { getIslandBtiType, getIslandBtiTypeSafe } from "@/lib/island-bti-type";

const AXIS_DISPLAY_LABELS: Record<"AB" | "WL" | "CI" | "PF", string> = {
  AB: "활동 에너지",
  WL: "선호 공간",
  CI: "동행 방식",
  PF: "여행 운영 방식",
};

const VALUE_DISPLAY_LABELS: Record<string, string> = {
  A: "Active",
  B: "Breezy",
  W: "Water",
  L: "Land",
  C: "Crew",
  I: "Independent",
  P: "Planned",
  F: "Flow",
};

export type IslandBtiAxisRatio = {
  dimension: "AB" | "WL" | "CI" | "PF";
  label: string;
  winner: string;
  winnerLabel: string;
  percent: number;
};

export function getIslandBtiAxisRatios(scores: IslandBtiScoreMap): IslandBtiAxisRatio[] {
  const dimensions = ["AB", "WL", "CI", "PF"] as const;

  return dimensions.map((dimension) => {
    const [left, right] = ISLAND_BTI_AXIS_VALUES[dimension];
    const leftScore = scores[left];
    const rightScore = scores[right];
    const winner = leftScore >= rightScore ? left : right;
    const winnerScore = Math.max(leftScore, rightScore);

    return {
      dimension,
      label: AXIS_DISPLAY_LABELS[dimension],
      winner,
      winnerLabel: VALUE_DISPLAY_LABELS[winner],
      percent: Math.round((winnerScore / 5) * 100),
    };
  });
}

export type IslandBtiPercentages = {
  AB: number;
  WL: number;
  CI: number;
  PF: number;
};

export function getIslandBtiPercentages(scores: IslandBtiScoreMap): IslandBtiPercentages {
  return {
    AB: Math.max(scores.A, scores.B) * 20,
    WL: Math.max(scores.W, scores.L) * 20,
    CI: Math.max(scores.C, scores.I) * 20,
    PF: Math.max(scores.P, scores.F) * 20,
  };
}

/**
 * main.tsx 라우터 기준 전용 AI 추천 페이지 경로.
 * 현재는 랜딩 페이지 AISection/HeroSection 위젯만 존재하며 별도 route 없음.
 */
export const ISLAND_BTI_AI_RECOMMEND_PATH: string | null = "/ai-recommend";
