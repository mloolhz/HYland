import { useMemo } from "react";
import { ISLANDS } from "@/lib/island-data";
import { getBadgeStats } from "@/lib/user-profile";
import { useSession } from "@/store/session";

/**
 * 여권·마이페이지의 배지/방문 수치.
 *
 * 로그인 상태면 획득 배지·방문 섬은 DB 값을 쓴다. 전체 배지 수(분모)는 아직
 * 미션 정의가 프론트 mock 에 있어 그쪽에서 가져온다 — 미션 API 연결 후 교체.
 */
export function useBadgeStats() {
  const { profile } = useSession();

  return useMemo(() => {
    const base = getBadgeStats();
    // 로그인 전에는 mock 진행도 대신 0 으로 보여준다 (전체 개수는 카탈로그라 유지)
    if (!profile) {
      return { ...base, earned: 0, unearned: base.total, visited: 0, islandTotal: ISLANDS.length };
    }

    const earned = profile.stats.badgeCount;
    return {
      ...base,
      earned,
      unearned: Math.max(0, base.total - earned),
      visited: profile.stats.visitedCount,
      islandTotal: ISLANDS.length,
    };
  }, [profile]);
}
