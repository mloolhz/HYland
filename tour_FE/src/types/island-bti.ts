/** 섬BTI 성향 축 */
export type IslandBtiDimension = "AB" | "WL" | "CI" | "PF";

/** 축별 극성 값 — AB: A|B, WL: W|L, CI: C|I, PF: P|F */
export type IslandBtiAxisValue = "A" | "B" | "W" | "L" | "C" | "I" | "P" | "F";

export interface IslandBtiQuestionOption {
  text: string;
  value: IslandBtiAxisValue;
}

export interface IslandBtiQuestion {
  id: number;
  dimension: IslandBtiDimension;
  question: string;
  options: [IslandBtiQuestionOption, IslandBtiQuestionOption];
}

/** dimension에 허용되는 value 쌍 */
export const ISLAND_BTI_AXIS_VALUES: Record<
  IslandBtiDimension,
  [IslandBtiAxisValue, IslandBtiAxisValue]
> = {
  AB: ["A", "B"],
  WL: ["W", "L"],
  CI: ["C", "I"],
  PF: ["P", "F"],
};

export type IslandBtiResultCode =
  | "AWCP"
  | "AWCF"
  | "AWIP"
  | "AWIF"
  | "ALCP"
  | "ALCF"
  | "ALIP"
  | "ALIF"
  | "BWCP"
  | "BWCF"
  | "BWIP"
  | "BWIF"
  | "BLCP"
  | "BLCF"
  | "BLIP"
  | "BLIF";

export interface IslandBtiResultData {
  code: IslandBtiResultCode;
  themeColor: string;
  name: string;
  englishTraits: string[];
  tagline: string;
  description: string[];
  recommendedActivities: string[];
  recommendedIslands: string[];
  recommendationReason: string;
  travelTip: string;
  bestMatch: IslandBtiResultCode;
  complementaryMatch: IslandBtiResultCode;
  cautionMatch: IslandBtiResultCode;
}

/** 4개 축별 우세 점수 (각 축 0~5) */
export type IslandBtiDimensionScores = {
  AB: number;
  WL: number;
  CI: number;
  PF: number;
};

/** 8극성 원시 점수 — 검사·표시·저장에 사용 */
export type IslandBtiAxisScores = {
  A: number;
  B: number;
  W: number;
  L: number;
  C: number;
  I: number;
  P: number;
  F: number;
};

/** localStorage에 저장되는 검사 기록 */
export interface IslandBtiResultRecord {
  id: string;
  code: IslandBtiResultCode;
  scores: IslandBtiAxisScores;
  testedAt: string;
}

/** @deprecated IslandBtiResultRecord에서 id를 제외한 형태 — 기존 컴포넌트 호환용 */
export type CurrentIslandBtiResult = Omit<IslandBtiResultRecord, "id">;
