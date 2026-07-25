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
