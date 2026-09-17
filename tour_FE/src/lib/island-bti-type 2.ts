import { getIslandBtiResult } from "@/data/island-bti/results";
import { getMyIslandBtiProfileCharacter } from "@/data/profile-characters";
import type { ProfileCharacter } from "@/types/profile-character";
import type { IslandBtiResultCode } from "@/types/island-bti";

export type IslandBtiTypeProfile = {
  code: IslandBtiResultCode;
  title: string;
  subtitle: string;
  description: string[];
  traits: string[];
  themeColor: string;
  character: ProfileCharacter | null;
  recommendedIslands: string[];
  recommendedActivities: string[];
  compatibility: {
    best: IslandBtiResultCode;
    complementary: IslandBtiResultCode;
    caution: IslandBtiResultCode;
  };
};

const FALLBACK_TYPE: IslandBtiTypeProfile = {
  code: "BWCF",
  title: "섬BTI 유형",
  subtitle: "여행 유형 정보를 불러올 수 없습니다.",
  description: ["검사를 다시 진행해 주세요."],
  traits: [],
  themeColor: "#2480f5",
  character: null,
  recommendedIslands: [],
  recommendedActivities: [],
  compatibility: {
    best: "BWCF",
    complementary: "AWIP",
    caution: "BLIF",
  },
};

/** 유형 코드로 16개 유형 상세 정보를 안전하게 조회합니다. */
export function getIslandBtiType(code: string): IslandBtiTypeProfile | null {
  const data = getIslandBtiResult(code);
  if (!data) return null;

  return {
    code: data.code,
    title: data.name,
    subtitle: data.tagline,
    description: data.description,
    traits: data.englishTraits,
    themeColor: data.themeColor,
    character: getMyIslandBtiProfileCharacter(data.code),
    recommendedIslands: data.recommendedIslands,
    recommendedActivities: data.recommendedActivities,
    compatibility: {
      best: data.bestMatch,
      complementary: data.complementaryMatch,
      caution: data.cautionMatch,
    },
  };
}

/** 조회 실패 시에도 UI가 깨지지 않도록 fallback을 반환합니다. */
export function getIslandBtiTypeSafe(code: string): IslandBtiTypeProfile {
  return getIslandBtiType(code) ?? FALLBACK_TYPE;
}

/** @alias getIslandBtiType */
export const getIslandBtiTypeByCode = getIslandBtiType;
