import { getIslandBtiResult } from "@/data/island-bti/results";
import type { IslandBtiAxisScores, IslandBtiResultCode } from "@/types/island-bti";
import {
  PREFERENCE_FEATURE_KEYS,
  type PreferenceFeatureKey,
  type PreferenceVector,
} from "@/types/recommendation";

const AXIS_MAX = 5;

/**
 * 8극성 점수(0~5) → 0~1 정규화
 * 섬BTI 코드(ALCF 등)를 직접 쓰지 않고 scores에서 파생한다.
 */
function normalizeAxisScores(scores: IslandBtiAxisScores): Record<keyof IslandBtiAxisScores, number> {
  return {
    A: scores.A / AXIS_MAX,
    B: scores.B / AXIS_MAX,
    W: scores.W / AXIS_MAX,
    L: scores.L / AXIS_MAX,
    C: scores.C / AXIS_MAX,
    I: scores.I / AXIS_MAX,
    P: scores.P / AXIS_MAX,
    F: scores.F / AXIS_MAX,
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * 섬BTI 4축 의미:
 * - AB: Active(A) / Breezy(B)
 * - WL: Water(W) / Land(L)
 * - CI: Crew(C) / Independent(I)
 * - PF: Planned(P) / Flow(F)
 *
 * 각 Feature는 축 조합의 가중합으로 설계 (코드→섬 하드매핑 없음)
 */
const FEATURE_AXIS_WEIGHTS: Record<PreferenceFeatureKey, Partial<Record<keyof IslandBtiAxisScores, number>>> = {
  activity: { A: 0.45, W: 0.15, C: 0.15, P: 0.1, I: 0.1, F: 0.05 },
  healing: { B: 0.45, F: 0.25, L: 0.15, W: 0.1, I: 0.05 },
  nature: { W: 0.3, L: 0.4, B: 0.1, F: 0.1, I: 0.1 },
  challenge: { A: 0.35, I: 0.25, P: 0.2, L: 0.1, W: 0.1 },
  leisure: { A: 0.2, W: 0.35, C: 0.2, F: 0.15, B: 0.1 },
  culture: { L: 0.35, P: 0.25, I: 0.2, C: 0.1, B: 0.1 },
  food: { C: 0.35, L: 0.25, B: 0.2, F: 0.1, W: 0.1 },
};

export function buildPreferenceVectorFromBtiScores(scores: IslandBtiAxisScores): PreferenceVector {
  const normalized = normalizeAxisScores(scores);
  const vector = {} as PreferenceVector;

  for (const feature of PREFERENCE_FEATURE_KEYS) {
    const weights = FEATURE_AXIS_WEIGHTS[feature];
    let sum = 0;
    let weightTotal = 0;

    for (const [axis, weight] of Object.entries(weights) as [keyof IslandBtiAxisScores, number][]) {
      sum += normalized[axis] * weight;
      weightTotal += weight;
    }

    vector[feature] = clamp01(weightTotal > 0 ? sum / weightTotal : 0);
  }

  return vector;
}

/** UI·LLM용 짧은 성향 키워드 (results.ts name/tagline 수정 없음) */
export function getUserTraitLabelsFromBti(code: IslandBtiResultCode, vector: PreferenceVector): string[] {
  const profile = getIslandBtiResult(code);
  const traits: string[] = [];

  if (vector.activity >= 0.65) traits.push("활동적인 여행 선호");
  if (vector.healing >= 0.65) traits.push("힐링·여유 선호");
  if (vector.nature >= 0.65) traits.push("자연·풍경 탐험 선호");
  if (vector.challenge >= 0.65) traits.push("도전·완주형 체험 선호");
  if (vector.leisure >= 0.65) traits.push("레저·바다 활동 선호");
  if (vector.culture >= 0.55) traits.push("마을·문화 탐방 선호");
  if (vector.food >= 0.55) traits.push("맛·로컬 경험 관심");

  if (traits.length === 0 && profile) {
    traits.push(profile.tagline);
  }

  return traits.slice(0, 4);
}
