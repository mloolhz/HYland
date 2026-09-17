import { useMemo } from "react";
import {
  calculateIslandSpiritGrowth,
  type IslandSpiritGrowth,
} from "@/lib/island-spirit-growth";
import { useVisitedIslands } from "@/store/visited-islands";

/**
 * 섬 정령 성장 = 탐험 레벨.
 *
 * 방문한 섬 수로 정해지고, 서버(user_island_visits)가 그 원본이다.
 * tour_BE/src/level.ts 와 같은 사다리(0/3/8/15)를 쓰므로 프로필 레벨과
 * 항상 같은 값이 나온다.
 */
export function useIslandSpiritGrowth(): IslandSpiritGrowth {
  const { ids } = useVisitedIslands();
  return useMemo(() => calculateIslandSpiritGrowth(ids.size), [ids]);
}
