import { SPORTS_DATA, type Sport } from "@/data/sports";
import {
  matchesAnyActivity,
  TRIP_ACTIVITY_TO_LEISURE,
} from "@/lib/recommendation/vocabulary/activity-vocabulary";
import { applyConfidence } from "@/lib/recommendation/confidence";
import type { TripIntent } from "@/types/recommendation";

/**
 * "이 섬에서 무슨 종목을 할 수 있는가" — 종목 24종 × 섬 88쌍.
 *
 * 레저시설(145곳)과 겹쳐 보이지만 성격이 다르다. 시설 데이터는 조사 범위에 따라
 * 강화도 45곳 / 연평도 2곳처럼 심하게 치우쳐 있어, 그대로 두면 "조사가 많이 된 섬"이
 * 유리해진다. 반면 종목-섬은 사람이 정리한 목록이라 섬당 1~9종으로 고르다.
 * 두 신호를 같이 쓰면 시설 데이터의 조사 편중을 종목 데이터가 눌러준다.
 *
 * 예약 가능 종목(reservable)은 실제로 가서 할 수 있다는 뜻이라 조금 더 쳐준다.
 */

export type SportsMatchResult = {
  /** 0~100 */
  score: number;
  matched: { tripActivity: string; sportNames: string[]; reservableCount: number }[];
  /** 이 섬에서 가능한 전체 종목 수 */
  totalSports: number;
};

type IslandSportsEntry = { sports: Sport[] };

function buildIndex(): Map<string, IslandSportsEntry> {
  const index = new Map<string, IslandSportsEntry>();

  for (const sport of Object.values(SPORTS_DATA).flat()) {
    for (const island of sport.islands) {
      // id가 없는 섬(소이작도·볼음도)은 추천 대상 섬 목록에 없어 건너뛴다.
      if (!island.id) continue;
      const entry = index.get(island.id) ?? { sports: [] };
      entry.sports.push(sport);
      index.set(island.id, entry);
    }
  }

  return index;
}

const SPORTS_INDEX = buildIndex();

export function getIslandSports(islandId: string): Sport[] {
  return SPORTS_INDEX.get(islandId)?.sports ?? [];
}

/** 섬당 종목 수가 1~9로 좁아 상한을 낮게 둔다. */
const DEPTH_CAP = 2;

export function scoreSportsMatch(islandId: string, trip: TripIntent): SportsMatchResult {
  const sports = getIslandSports(islandId);
  const empty: SportsMatchResult = { score: 40, matched: [], totalSports: sports.length };

  if (sports.length === 0) return empty;

  const selected = (trip.activities ?? []).filter(
    (a) => (TRIP_ACTIVITY_TO_LEISURE[a]?.length ?? 0) > 0,
  );

  if (selected.length === 0) {
    const depth = Math.min(sports.length, 6) / 6;
    return { ...empty, score: applyConfidence(Math.round(40 + depth * 50), sports.length) };
  }

  const matched: SportsMatchResult["matched"] = [];
  let sum = 0;

  for (const activity of selected) {
    const names = TRIP_ACTIVITY_TO_LEISURE[activity];
    const hits = sports.filter((s) => matchesAnyActivity(s.name, names));

    if (hits.length > 0) {
      const reservableCount = hits.filter((s) => s.reservationType === "reservable").length;
      matched.push({
        tripActivity: activity,
        sportNames: hits.map((s) => s.name),
        reservableCount,
      });
      const depth = Math.min(hits.length, DEPTH_CAP) / DEPTH_CAP;
      const reservableBonus = reservableCount > 0 ? 0.1 : 0;
      sum += Math.min(1, 0.7 + depth * 0.2 + reservableBonus);
    }
  }

  return {
    score: applyConfidence(Math.round((sum / selected.length) * 100), sports.length),
    matched,
    totalSports: sports.length,
  };
}
