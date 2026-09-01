import { LEISURE_FACILITIES, type LeisureFacility } from "@/data/leisure-facilities";
import type { TripIntent } from "@/types/recommendation";

/**
 * 관광공사 API + 웹 조사로 수집한 실제 레저시설(145곳)을 섬별로 색인한다.
 *
 * 기존 추천은 손으로 적어둔 섬 특성 벡터에만 의존해서, "왜 이 섬인지"를
 * 숫자 말고는 설명할 수 없었다. 실제 시설 데이터를 쓰면 "선택하신 트레킹
 * 시설이 19곳 있어요"처럼 검증 가능한 근거를 만들 수 있다.
 */

/** 조건 패널의 관심 활동 → 실제 시설 활동명. 시설 데이터에 없는 활동은 빈 배열. */
const TRIP_ACTIVITY_TO_FACILITY: Record<string, string[]> = {
  바다: ["해수욕장", "유람선", "요트", "패들보트", "풀등 체험", "해루질"],
  산책: ["해안 산책", "섬마을 투어", "산림욕"],
  트레킹: ["트레킹", "백패킹"],
  카약: ["패들보트", "요트"], // 시설 데이터에 '카약'이 따로 없어 근사 매칭
  사이클: ["자전거"],
  낚시: ["낚시", "해루질"],
  갯벌: ["갯벌체험", "풀등 체험", "해루질"],
  // '카페'는 레저시설 수집 대상이 아니라 매칭 불가 — 점수에서 제외한다(감점 아님).
  카페: [],
};

/** 여행 분위기 → 시설 카테고리. 활동을 안 고른 경우의 보조 신호. */
const MOOD_TO_CATEGORY: Record<string, string[]> = {
  healing: ["heal"],
  active: ["water", "land"],
  nature: ["land", "heal"],
  social: ["exp"],
  adventure: ["water", "land"],
};

export type IslandFacilitySummary = {
  islandId: string;
  total: number;
  byActivity: Map<string, LeisureFacility[]>;
  byCategory: Map<string, number>;
};

function buildIndex(): Map<string, IslandFacilitySummary> {
  const index = new Map<string, IslandFacilitySummary>();

  for (const facility of LEISURE_FACILITIES) {
    let entry = index.get(facility.islandId);
    if (!entry) {
      entry = {
        islandId: facility.islandId,
        total: 0,
        byActivity: new Map(),
        byCategory: new Map(),
      };
      index.set(facility.islandId, entry);
    }

    entry.total += 1;
    const list = entry.byActivity.get(facility.activity) ?? [];
    list.push(facility);
    entry.byActivity.set(facility.activity, list);
    entry.byCategory.set(facility.category, (entry.byCategory.get(facility.category) ?? 0) + 1);
  }

  return index;
}

const FACILITY_INDEX = buildIndex();

export function getIslandFacilitySummary(islandId: string): IslandFacilitySummary | undefined {
  return FACILITY_INDEX.get(islandId);
}

/** 선택한 활동 하나에 대해 이 섬이 가진 시설들 */
export function getFacilitiesForTripActivity(
  islandId: string,
  tripActivity: string,
): LeisureFacility[] {
  const summary = FACILITY_INDEX.get(islandId);
  if (!summary) return [];

  const names = TRIP_ACTIVITY_TO_FACILITY[tripActivity];
  if (!names || names.length === 0) return [];

  return names.flatMap((name) => summary.byActivity.get(name) ?? []);
}

/**
 * 시설 개수를 그대로 쓰면 강화도(45곳)가 소야도(2곳)를 항상 압도한다.
 * "그 활동이 되긴 하는가"(coverage)를 주로 보고, 선택지 다양성(depth)은
 * 3곳에서 상한을 둬 거들기만 하게 한다.
 */
const DEPTH_CAP = 3;

export type FacilityMatchResult = {
  /** 0~100 */
  score: number;
  /** 선택한 활동 중 실제 시설이 있는 활동들 */
  matchedActivities: { tripActivity: string; count: number; samples: LeisureFacility[] }[];
  /** 매칭 대상이 된 활동 수 (카페처럼 매칭 불가인 것은 제외) */
  scorableCount: number;
  total: number;
};

export function scoreFacilityMatch(islandId: string, trip: TripIntent): FacilityMatchResult {
  const summary = FACILITY_INDEX.get(islandId);
  const empty: FacilityMatchResult = {
    score: 50,
    matchedActivities: [],
    scorableCount: 0,
    total: summary?.total ?? 0,
  };
  if (!summary) return { ...empty, score: 30 };

  const selected = (trip.activities ?? []).filter(
    (a) => (TRIP_ACTIVITY_TO_FACILITY[a]?.length ?? 0) > 0,
  );

  const matchedActivities: FacilityMatchResult["matchedActivities"] = [];

  if (selected.length > 0) {
    let sum = 0;
    for (const activity of selected) {
      const facilities = getFacilitiesForTripActivity(islandId, activity);
      if (facilities.length > 0) {
        matchedActivities.push({
          tripActivity: activity,
          count: facilities.length,
          samples: facilities.slice(0, 2),
        });
      }
      const coverage = facilities.length > 0 ? 1 : 0;
      const depth = Math.min(facilities.length, DEPTH_CAP) / DEPTH_CAP;
      sum += coverage * 0.75 + depth * 0.25;
    }
    return {
      score: Math.round((sum / selected.length) * 100),
      matchedActivities,
      scorableCount: selected.length,
      total: summary.total,
    };
  }

  // 활동을 안 골랐으면 분위기에 맞는 카테고리 시설이 있는지로 대신 본다.
  const categories = trip.travelMood ? MOOD_TO_CATEGORY[trip.travelMood] ?? [] : [];
  if (categories.length > 0) {
    const count = categories.reduce((sum, c) => sum + (summary.byCategory.get(c) ?? 0), 0);
    const depth = Math.min(count, DEPTH_CAP * 2) / (DEPTH_CAP * 2);
    return {
      score: Math.round(40 + depth * 60),
      matchedActivities: [],
      scorableCount: 0,
      total: summary.total,
    };
  }

  // 조건이 전혀 없으면 시설이 아예 없는 섬만 약간 낮게 둔다.
  return {
    score: summary.total > 0 ? 60 : 30,
    matchedActivities: [],
    scorableCount: 0,
    total: summary.total,
  };
}
