import { readToken } from "@/lib/token";

/**
 * localStorage에 BTI·성향을 쓸지 여부.
 * 토큰만으로 판단한다 — UI의 isLoggedIn과 맞추려면 Provider에서 세션 확정 후 load/save 한다.
 */
export function isMemberSession(): boolean {
  return Boolean(readToken());
}
