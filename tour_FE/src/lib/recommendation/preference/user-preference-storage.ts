import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBtiResultRecord } from "@/types/island-bti";
import type { UserPreference } from "@/types/recommendation";
import { PREFERENCE_BLEND_WEIGHTS } from "@/lib/recommendation/config/recommendation-weights";
import {
  buildPreferenceVectorFromBtiScores,
} from "@/lib/recommendation/preference/bti-preference.mapper";

export const USER_PREFERENCE_STORAGE_KEY = "hyland:user-preference";

function isUserPreference(value: unknown): value is UserPreference {
  if (!value || typeof value !== "object") return false;
  const candidate = value as UserPreference;
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.islandBti === "string" &&
    typeof candidate.updatedAt === "string" &&
    candidate.vector !== null &&
    typeof candidate.vector === "object"
  );
}

export function loadUserPreference(): UserPreference | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(USER_PREFERENCE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isUserPreference(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveUserPreference(preference: UserPreference): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(USER_PREFERENCE_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.warn("Failed to save user preference:", error);
  }
}

/** 섬BTI 검사 완료/재검사 시 Preference 자동 갱신 */
export function upsertUserPreferenceFromBtiResult(
  record: IslandBtiResultRecord,
  userId: string = CURRENT_USER_ID,
): UserPreference {
  const preference: UserPreference = {
    userId,
    islandBti: record.code,
    vector: buildPreferenceVectorFromBtiScores(record.scores),
    btiWeight: PREFERENCE_BLEND_WEIGHTS.islandBti,
    source: "island-bti",
    testedAt: record.testedAt,
    updatedAt: new Date().toISOString(),
  };

  saveUserPreference(preference);
  return preference;
}

export function clearUserPreference(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_PREFERENCE_STORAGE_KEY);
}
