import { useMemo } from "react";
import {
  calculateIslandSpiritGrowth,
  type IslandSpiritGrowth,
} from "@/lib/island-spirit-growth";

/** 도장 원본에서 매 렌더마다 성장 상태를 계산 */
export function useIslandSpiritGrowth(): IslandSpiritGrowth {
  return useMemo(() => calculateIslandSpiritGrowth(), []);
}
