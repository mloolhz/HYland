import { readToken } from "@/lib/token";

/** JWT가 있으면 회원 — 섬BTI·추천 성향은 localStorage에 유지 */
export function isMemberSession(): boolean {
  return Boolean(readToken());
}
