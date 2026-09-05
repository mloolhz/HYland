import { useMemo } from "react";
import {
  calculateIslandSpiritGrowth,
  type IslandSpiritGrowth,
} from "@/lib/island-spirit-growth";
import { getUniqueIslandIdsFromEarnedStamps } from "@/lib/passport/stamp-island-link";
import { useMissionProgress } from "@/store/mission-progress";

/** 실제 미션 진행도(DB)에서 정령 성장 상태를 계산 */
export function useIslandSpiritGrowth(): IslandSpiritGrowth {
  const { quests } = useMissionProgress();
  return useMemo(
    () => calculateIslandSpiritGrowth(getUniqueIslandIdsFromEarnedStamps(quests).length),
    [quests],
  );
}
