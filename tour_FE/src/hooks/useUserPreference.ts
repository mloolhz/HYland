import { useMemo } from "react";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { buildPreferenceVectorFromBtiScores } from "@/lib/recommendation/preference/bti-preference.mapper";
import {
  loadUserPreference,
  upsertUserPreferenceFromBtiResult,
} from "@/lib/recommendation/preference/user-preference-storage";
import type { UserPreference } from "@/types/recommendation";

/**
 * 최신 섬BTI 기준 UserPreference.
 * 저장된 preference가 없거나 BTI 검사일이 더 최신이면 갱신한다.
 */
export function useUserPreference(): UserPreference | null {
  const { latestResult } = useIslandBti();

  return useMemo(() => {
    if (!latestResult) return loadUserPreference();

    const stored = loadUserPreference();
    if (!stored) return upsertUserPreferenceFromBtiResult(latestResult);

    const storedTime = new Date(stored.testedAt).getTime();
    const latestTime = new Date(latestResult.testedAt).getTime();

    if (latestTime >= storedTime && stored.islandBti !== latestResult.code) {
      return upsertUserPreferenceFromBtiResult(latestResult);
    }

    if (latestTime > storedTime) {
      return upsertUserPreferenceFromBtiResult(latestResult);
    }

    return stored;
  }, [latestResult]);
}

export function getEffectivePreferenceVector(preference: UserPreference | null) {
  return preference?.vector ?? buildPreferenceVectorFromBtiScores({
    A: 2, B: 3, W: 2, L: 3, C: 2, I: 3, P: 2, F: 3,
  });
}
