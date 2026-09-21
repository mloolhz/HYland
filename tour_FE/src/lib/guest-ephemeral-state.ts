import { clearAiSessionId } from "@/lib/ai-session-id";
import {
  ISLAND_BTI_GUEST_HISTORY_STORAGE_KEY,
  ISLAND_BTI_HISTORY_STORAGE_KEY,
} from "@/lib/island-bti-storage";
import { readToken } from "@/lib/token";
import { USER_PREFERENCE_STORAGE_KEY } from "@/lib/recommendation/preference/user-preference-storage";

type ResetGuestOptions = {
  /** 로그인 판정 전·로그아웃 직후에도 디스크 캐시를 지울 때 */
  ignoreToken?: boolean;
};

/**
 * 비회원: BTI·추천 성향·AI 대화 ID를 브라우저 저장소에 남기지 않는다.
 * 새로고침마다 호출해 예전 localStorage(sessionStorage) 캐시도 지운다.
 */
export function resetGuestEphemeralPersistence(options?: ResetGuestOptions): void {
  if (typeof window === "undefined") return;
  if (!options?.ignoreToken && readToken()) return;

  sessionStorage.removeItem(ISLAND_BTI_GUEST_HISTORY_STORAGE_KEY);
  sessionStorage.removeItem(USER_PREFERENCE_STORAGE_KEY);
  clearAiSessionId();

  // 예전 버전에서 비회원도 localStorage에 쓰던 흔적
  localStorage.removeItem(ISLAND_BTI_HISTORY_STORAGE_KEY);
  localStorage.removeItem(USER_PREFERENCE_STORAGE_KEY);
}
