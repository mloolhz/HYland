import { readToken } from "@/lib/token";

/** JWT가 있으면 회원 — 섬BTI·추천 성향만 localStorage에 유지 (비회원은 메모리만) */
export function isMemberSession(): boolean {
  return Boolean(readToken());
}
