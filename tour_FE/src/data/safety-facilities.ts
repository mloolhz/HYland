/**
 * 섬별 안전시설 주소·연락처.
 *
 * 국민안전24 외부 링크 대신 앱 안에서 바로 주소·전화를 보여주기 위한 데이터.
 *
 * 채우는 규칙
 * - 값은 반드시 공식 출처(군/구청·보건소 홈페이지, 공공데이터)에서 확인한 것만.
 *   추정·임의 입력 금지 — 잘못된 응급정보는 위험하다.
 * - 아직 검증 전 초안은 `verified: false` + `source`(출처)를 남겨 둔다.
 *   팀이 확인하면 `verified: true`로 바꾼다.
 * - 긴급상황(119·112·122)은 전 섬 공통이라 여기 넣지 않는다(페이지 상단 고정).
 *
 * 구조
 * - DISTRICT_SAFETY: 행정구역(군/구) 거점 시설. 섬에 해당 시설이 없을 때의 대표 안내.
 * - ISLAND_SAFETY: 섬에 실제로 있는 시설(보건지소·병원·약국·파출소·AED 등).
 *   비어 있으면 그 섬은 거점(DISTRICT_SAFETY)으로 안내된다.
 */

/** 시설 종류 id — Safety 페이지의 FACILITIES와 동일하게 맞춘다. */
export type SafetyFacilityType =
  | "hospital"
  | "emergency"
  | "health-center"
  | "pharmacy"
  | "fire-station"
  | "police"
  | "coast-guard"
  | "aed";

export type SafetyFacility = {
  type: SafetyFacilityType;
  /** 시설 이름 (예: "강화군보건소") */
  name: string;
  /** 도로명 주소 (있으면) */
  address?: string;
  /** 대표 전화 — 하이픈 포함 문자열. tel: 링크는 페이지에서 숫자만 뽑아 만든다. */
  phone?: string;
  /** 안내 메모 (예: 위치가 육지, 운영시간 등) */
  note?: string;
  /** 출처 도메인/URL — 검증용 */
  source?: string;
  /** 팀 검증 완료 여부. 초안은 false. */
  verified?: boolean;
};

/**
 * 행정구역 거점 시설 (초안 — 공식 홈페이지 기준, 팀 검증 필요).
 * 키는 Safety 페이지 districtOf()가 돌려주는 값과 같다: "강화군" · "영종구" · "옹진군".
 */
export const DISTRICT_SAFETY: Record<string, SafetyFacility[]> = {
  강화군: [
    {
      type: "health-center",
      name: "강화군보건소",
      address: "인천 강화군 강화읍 충렬사로 26-1",
      phone: "032-930-4080",
      source: "ganghwa.go.kr",
      verified: false,
    },
  ],
  영종구: [
    {
      type: "health-center",
      name: "중구보건소",
      address: "인천 중구 참외전로 100 (전동)",
      phone: "032-772-4001",
      source: "icjg.go.kr",
      verified: false,
    },
    {
      type: "health-center",
      name: "영종보건지소",
      address: "인천 중구 운남서로 100-1",
      phone: "032-760-6885",
      source: "icjg.go.kr",
      verified: false,
    },
  ],
  옹진군: [
    {
      type: "health-center",
      name: "옹진군보건소",
      address: "인천 미추홀구 매소홀로 120 (용현동)",
      phone: "032-899-3120",
      note: "옹진군보건소는 섬이 아닌 인천 시내(미추홀구)에 있어요. 섬 안에서는 각 보건지소를 이용하세요.",
      source: "ongjin.go.kr",
      verified: false,
    },
    {
      type: "emergency",
      name: "옹진군보건소 보건행정과",
      phone: "032-899-3110",
      note: "섬 보건지소 위치·연락처 문의처.",
      source: "ongjin.go.kr",
      verified: false,
    },
  ],
};

/**
 * 섬에 실제로 있는 시설.
 * 값이 확인된 것만 넣고, 나머지는 빈 배열로 두면 거점(DISTRICT_SAFETY)으로 안내된다.
 * TODO(팀): 각 섬의 보건지소·병원·약국·파출소·AED 주소·전화를 공식 출처로 채워 주세요.
 */
export const ISLAND_SAFETY: Record<string, SafetyFacility[]> = {
  // 백령·대청도권역
  baek: [
    {
      type: "health-center",
      name: "백령보건지소",
      phone: "032-899-3183",
      source: "ongjin.go.kr",
      verified: false,
    },
  ],
  daech: [], // 자료 없음 (수집 필요)
  // 연평도권역
  yeonp: [], // 자료 없음 (수집 필요)
  // 강화도권역 — 팀 조사 자료. 병원은 치과·한의원을 빼고 일반 진료 위주로 정리(트리밍).
  gangh: [
    // 일반병원
    { type: "hospital", name: "의료법인해인강화병원", address: "인천 강화군 강화읍 강화대로312번길 11", verified: true },
    { type: "hospital", name: "해주병원", address: "인천 강화군 하점면 창후로 286", phone: "032-933-7114", verified: true },
    { type: "hospital", name: "강화요양병원", address: "인천 강화군 길상면 강화동로 181", phone: "032-937-0639", verified: true },
    { type: "hospital", name: "남궁내과의원", address: "인천 강화군 강화읍 강화대로 422", verified: true },
    { type: "hospital", name: "임성식내과의원", address: "인천 강화군 강화읍 강화대로 395, 준프라자빌딩 3층", verified: true },
    { type: "hospital", name: "중앙의원", address: "인천 강화군 강화읍 강화대로 412", verified: true },
    { type: "hospital", name: "유여성의원", address: "인천 강화군 강화읍 강화대로 410, 302호", verified: true },
    { type: "hospital", name: "온수의원", address: "인천 강화군 길상면 온수길36번길 2", phone: "032-937-6835", verified: true },
    { type: "hospital", name: "유안과의원", address: "인천 강화군 강화읍 강화대로 412-1", verified: true },
    { type: "hospital", name: "강화연세안과의원", address: "인천 강화군 강화읍 중앙로 23", verified: true },
    { type: "hospital", name: "강화튼튼신경외과의원", address: "인천 강화군 강화읍 강화대로 387, 이레빌딩", verified: true },
    { type: "hospital", name: "임용철마취통증의학과의원", address: "인천 강화군 강화읍 강화대로 395, 5층 502호", verified: true },
    // 응급의료센터
    { type: "emergency", name: "비에스종합병원", phone: "032-290-0001", verified: true },
    // 약국
    { type: "pharmacy", name: "부흥생명약국", phone: "032-932-5918", verified: true },
    { type: "pharmacy", name: "바다약국", phone: "032-934-0010", verified: true },
    { type: "pharmacy", name: "전등약국", phone: "032-937-8219", verified: true },
    { type: "pharmacy", name: "유신약국", phone: "032-937-0020", verified: true },
    { type: "pharmacy", name: "세광약국", phone: "032-934-2249", verified: true },
    { type: "pharmacy", name: "남산약국", phone: "032-934-5670", verified: true },
    { type: "pharmacy", name: "신세계약국", phone: "032-934-5424", verified: true },
    { type: "pharmacy", name: "다나약국", phone: "032-932-8575", verified: true },
    { type: "pharmacy", name: "감초약국", phone: "032-934-3806", verified: true },
    // 소방서(119안전센터)
    { type: "fire-station", name: "강화119안전센터", phone: "032-930-5894", verified: true },
    { type: "fire-station", name: "내가119안전센터", phone: "032-930-5823", verified: true },
    { type: "fire-station", name: "불은119안전센터", phone: "032-930-5811", verified: true },
    { type: "fire-station", name: "길상119안전센터", phone: "032-930-5822", verified: true },
    // 경찰서(지구대·파출소)
    { type: "police", name: "심도지구대", phone: "032-930-0301", verified: true },
    { type: "police", name: "선원파출소", phone: "032-930-0302", verified: true },
    { type: "police", name: "불은파출소", phone: "032-930-0303", verified: true },
    { type: "police", name: "길상파출소", phone: "032-930-0304", verified: true },
    { type: "police", name: "화도파출소", phone: "032-930-0305", verified: true },
    { type: "police", name: "양도파출소", phone: "032-930-0306", verified: true },
    { type: "police", name: "송해파출소", phone: "032-930-0307", verified: true },
    { type: "police", name: "하점파출소", phone: "032-930-0308", verified: true },
    { type: "police", name: "양사파출소", phone: "032-930-0309", verified: true },
    { type: "police", name: "내가파출소", phone: "032-930-0311", verified: true },
    // 해양경찰서
    { type: "coast-guard", name: "강화파출소", phone: "032-650-2226", verified: true },
    { type: "coast-guard", name: "창후리출장소", phone: "032-650-2134", verified: true },
    { type: "coast-guard", name: "선수출장소", phone: "032-650-2135", verified: true },
  ],
  gyo: [
    { type: "police", name: "교동파출소", phone: "032-930-0313", verified: true },
    { type: "pharmacy", name: "교동약국", phone: "032-933-8358", verified: true },
  ],
  seok: [
    { type: "police", name: "삼산파출소", phone: "032-930-0312", verified: true },
    { type: "coast-guard", name: "삼산출장소", phone: "032-650-2734", verified: true },
  ],
  // 북도권역
  jang: [{ type: "coast-guard", name: "장봉출장소", phone: "032-650-2133", verified: true }],
  sinsi: [{ type: "police", name: "북도파출소", phone: "032-760-8312", verified: true }],
  // 영종구·서해구권역
  yeongj: [], // 자료 없음 (수집 필요)
  muui: [], // 자료 없음 (수집 필요)
  // 영흥도권역
  yheung: [
    { type: "hospital", name: "하나의료조합영흥우리의원", phone: "032-886-9411", verified: true },
    { type: "pharmacy", name: "영흥우리약국", phone: "032-888-3634", verified: true },
    { type: "fire-station", name: "영흥119안전센터", phone: "032-810-6692", verified: true },
    { type: "police", name: "영흥파출소", phone: "032-760-8311", verified: true },
    { type: "coast-guard", name: "영흥파출소", phone: "032-650-2227", verified: true },
  ],
  // 자월도권역
  jawol: [], // 자료 없음 (수집 필요)
  seungb: [], // 시설 없음으로 확인됨
  ijak: [], // 시설 없음으로 확인됨
  // 덕적도권역
  deokj: [
    { type: "police", name: "덕적파출소", phone: "032-760-8313", verified: true },
    { type: "coast-guard", name: "덕적출장소", phone: "032-650-2735", verified: true },
  ],
  soya: [], // 시설 없음으로 확인됨
  mungap: [{ type: "health-center", name: "문갑보건진료소", phone: "032-833-8373", verified: true }],
  gureop: [], // 시설 없음으로 확인됨
};

/** 섬 + 시설종류로 보여줄 시설 목록. 섬 자체 시설을 먼저, 없으면 거점 시설로 채운다. */
export function getSafetyFacilities(
  islandId: string,
  district: string,
  type: SafetyFacilityType,
): SafetyFacility[] {
  const onIsland = (ISLAND_SAFETY[islandId] ?? []).filter((f) => f.type === type);
  if (onIsland.length > 0) return onIsland;
  return (DISTRICT_SAFETY[district] ?? []).filter((f) => f.type === type);
}
