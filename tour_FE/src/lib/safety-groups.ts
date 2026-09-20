import {
  ISLAND_SAFETY,
  type SafetyFacility,
  type SafetyFacilityType,
} from "@/data/safety-facilities";
import { ISLANDS } from "@/lib/island-data";

export const SAFE_KOREA_URL =
  "https://www.safekorea.go.kr/safekorea-kor/flsm/flsm/facilitiesSafteyMap.do";

export const FACILITY_LABELS: Record<SafetyFacilityType, string> = {
  hospital: "일반병원",
  "health-center": "보건소·보건지소",
  pharmacy: "약국",
  "fire-station": "소방서·119안전센터",
  police: "경찰서·파출소",
  "coast-guard": "해양경찰·출장소",
};

export type SafetyFacilityGroup = {
  id: string;
  area: string;
  name: string;
  facilities: SafetyFacility[];
};

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
}

/** 화면에는 주소와 연락처가 모두 확인된 시설만 표시한다. 원본 데이터는 보존한다. */
function canDisplayFacility(facility: SafetyFacility): boolean {
  return Boolean(facility.address?.trim()) && Boolean(facility.phone?.trim());
}

/** 같은 시설 유형·명칭·주소·전화가 반복된 경우, 표에서는 한 번만 보인다. */
function uniqueFacilities(facilities: SafetyFacility[]): SafetyFacility[] {
  const seen = new Set<string>();
  return facilities.filter((facility) => {
    const key = [facility.type, facility.name, facility.address, facility.phone].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildSafetyGroups(): SafetyFacilityGroup[] {
  const islandGroups = ISLANDS.map((island) => ({
    id: island.id,
    area: island.region,
    name: island.name,
    facilities: uniqueFacilities((ISLAND_SAFETY[island.id] ?? []).filter(canDisplayFacility)),
    hasSourceData: (ISLAND_SAFETY[island.id] ?? []).length > 0,
  })).filter((group) => group.facilities.length > 0 || group.hasSourceData);

  const byName = (a: SafetyFacilityGroup, b: SafetyFacilityGroup) =>
    a.name.localeCompare(b.name, "ko");
  const islandsWithInfo = islandGroups.filter((group) => group.facilities.length > 0).sort(byName);
  const islandsWithoutInfo = islandGroups.filter((group) => group.facilities.length === 0).sort(byName);

  // 시설이 있는 섬을 먼저(이름순), 정보가 없는 섬은 맨 뒤로(이름순) 보낸다.
  return [...islandsWithInfo, ...islandsWithoutInfo];
}
