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
  matched: {
    tripActivity: string;
    sportNames: string[];
    /** 외부 이용정보 링크를 뽑기 위한 종목 id */
    sportIds: string[];
    reservableCount: number;
  }[];
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

const SPORT_BY_ID = new Map(Object.values(SPORTS_DATA).flat().map((s) => [s.id, s]));

/** 종목 id로 조회 (외부 이용정보 링크를 붙일 때 쓴다) */
export function getSportById(sportId: string): Sport | undefined {
  return SPORT_BY_ID.get(sportId);
}

/** 섬당 종목 수가 1~9로 좁아 상한을 낮게 둔다. */
const DEPTH_CAP = 2;

/**
 * @param confirmedByFacility 시설 데이터가 이미 "가능하다"고 확인해 준 활동들.
 *   종목 목록에 없다고 감점하면 안 되는 경우를 걸러내기 위해 받는다.
 */
export function scoreSportsMatch(
  islandId: string,
  trip: TripIntent,
  confirmedByFacility?: Set<string>,
): SportsMatchResult {
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
        sportIds: hits.map((s) => s.id),
        reservableCount,
      });
      const depth = Math.min(hits.length, DEPTH_CAP) / DEPTH_CAP;
      const reservableBonus = reservableCount > 0 ? 0.1 : 0;
      sum += Math.min(1, 0.7 + depth * 0.2 + reservableBonus);
    } else if (confirmedByFacility?.has(activity)) {
      // 시설 데이터가 "된다"고 하는데 종목 목록에 없는 경우.
      // 석모도가 그렇다 — 시설엔 트레킹이 있지만 종목 목록엔 없어서,
      // 예전엔 종목 점수가 0이 되어 다른 신호가 아무리 좋아도 밀렸다.
      // 한 소스가 확인해 준 사실을 다른 소스의 공백으로 뒤집지 않는다.
      sum += 0.5;
    } else {
      // 종목 목록은 전수 조사가 아니라 큐레이션이다. 목록에 없다고 "못 한다"는
      // 뜻은 아니므로 0점을 주지 않는다. 다만 목록이 길게 정리된 섬에서 없다면
      // 그건 실제로 없을 가능성이 높으니 그만큼 낮춘다.
      const catalogued = Math.min(sports.length / 6, 1);
      sum += 0.1 + 0.3 * (1 - catalogued);
    }
  }

  return {
    score: applyConfidence(Math.round((sum / selected.length) * 100), sports.length),
    matched,
    totalSports: sports.length,
  };
}
