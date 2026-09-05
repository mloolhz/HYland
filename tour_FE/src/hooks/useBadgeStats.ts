import { useMemo } from "react";
import { ISLANDS } from "@/lib/island-data";
import { getMissionStampStats } from "@/lib/passport/passport-mission-stamps";
import { missionQuestState } from "@/mocks/missions";
import { useMissionProgress } from "@/store/mission-progress";
import { useSession } from "@/store/session";

/**
 * 여권·마이페이지의 배지/방문 수치.
 *
 * 획득 수는 미션 진행도(DB)에서 산출한다. 프로필의 badgeCount 를 쓰지 않는 것은
 * 미션 탭과 숫자를 맞추기 위해서다 — 배지 지급은 미션 완료 시점이라 둘이 같아야
 * 하는데, 배지 정의가 없던 시절 완료된 미션은 badgeCount 에 안 잡힌다.
 * 전체 개수(분모)는 미션 카탈로그를 그대로 쓴다.
 */
export function useBadgeStats() {
  const { profile } = useSession();
  const { quests } = useMissionProgress();

  return useMemo(() => {
    const stamp = getMissionStampStats(quests);
    const visited = quests.filter(
      (q) => q.category === "섬" && missionQuestState(q) === "earned",
    ).length;

    return {
      earned: stamp.earned,
      total: stamp.total,
      unearned: Math.max(0, stamp.total - stamp.earned),
      // 방문 섬은 프로필(DB)이 정답 — 섬 미션 없이 방문만 기록될 수도 있다
      visited: profile?.stats.visitedCount ?? visited,
      islandTotal: ISLANDS.length,
    };
  }, [profile, quests]);
}
