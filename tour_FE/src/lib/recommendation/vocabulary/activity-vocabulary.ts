/**
 * 추천에 쓰는 세 데이터 소스가 서로 다른 활동 이름을 쓴다. 그 어휘를 한곳에서 맞춘다.
 *
 *  - 조건 패널      : 바다 / 산책 / 카페 / 트레킹 / 카약 / 사이클 / 낚시 / 갯벌 /
 *                     캠핑 / 온천 / 골프  (11종)
 *  - 레저시설·종목  : 캠핑 / 트레킹 / 낚시 / 해수욕장 / 해안 산책 / 갯벌체험 ... (24종)
 *  - 커뮤니티 게시글: 하이킹 / 사이클 / 카약 / SUP / 패들보드 / 러닝 / 드라이브 ...
 *
 * 레저시설과 종목 데이터는 활동 이름 체계가 같아 매핑을 공유한다.
 * 커뮤니티는 사용자가 자유롭게 적은 값이라 별도 매핑이 필요하다.
 */

/** 조건 패널 활동 → 레저시설·종목 활동명 */
export const TRIP_ACTIVITY_TO_LEISURE: Record<string, string[]> = {
  바다: ["해수욕장", "유람선", "요트", "패들보트", "풀등 체험", "해루질"],
  산책: ["해안 산책", "섬마을 투어", "산림욕"],
  트레킹: ["트레킹", "백패킹"],
  카약: ["패들보트", "요트"], // 시설·종목 데이터에 '카약'이 따로 없어 근사 매칭
  사이클: ["자전거"],
  낚시: ["낚시", "해루질"],
  갯벌: ["갯벌체험", "풀등 체험", "해루질"],
  캠핑: ["캠핑", "백패킹"],
  // 시설은 "온천-스파", 종목은 "온천·스파"로 표기가 달라 공통 어간으로 잡는다.
  온천: ["온천"],
  골프: ["골프"],
  // '카페'는 레저 데이터 수집 대상이 아니라 매칭 불가 — 점수에서 제외한다(감점 아님).
  카페: [],
};

/** 조건 패널 활동 → 커뮤니티 게시글 activity 값 */
export const TRIP_ACTIVITY_TO_COMMUNITY: Record<string, string[]> = {
  바다: ["카약", "SUP", "패들보드", "해수욕", "요트"],
  산책: ["러닝", "드라이브", "산책", "해안 산책", "섬마을 투어"],
  트레킹: ["하이킹", "트레킹", "등산", "백패킹"],
  카약: ["카약", "SUP", "패들보드"],
  사이클: ["사이클", "자전거"],
  낚시: ["낚시", "해루질"],
  갯벌: ["갯벌체험", "갯벌"],
  캠핑: ["캠핑", "백패킹", "차박"],
  온천: ["온천", "스파"],
  골프: ["골프"],
  카페: [],
};

/**
 * 커뮤니티 게시글의 `island`는 사람이 적은 섬 이름이라 추천 엔진의 islandId로 옮겨야 한다.
 * 부속 섬은 배편·생활권을 같이 쓰는 본섬으로 묶는다(소무의도는 무의도에서 다리로 연결).
 */
export const ISLAND_NAME_TO_ID: Record<string, string> = {
  강화도: "gangh",
  교동도: "gyo",
  석모도: "seok",
  볼음도: "gangh",
  영종도: "yeongj",
  용유도: "yeongj",
  무의도: "muui",
  소무의도: "muui",
  신도: "sinsi",
  시도: "sinsi",
  모도: "sinsi",
  "신도·시도·모도": "sinsi",
  장봉도: "jang",
  영흥도: "yheung",
  자월도: "jawol",
  승봉도: "seungb",
  대이작도: "ijak",
  덕적도: "deokj",
  소야도: "soya",
  문갑도: "mungap",
  굴업도: "gureop",
  백령도: "baek",
  대청도: "daech",
  연평도: "yeonp",
};

export function resolveIslandId(islandName: string): string | null {
  return ISLAND_NAME_TO_ID[islandName.trim()] ?? null;
}

/** 활동 이름 목록 중 하나라도 겹치는지 (부분 문자열까지 허용) */
export function matchesAnyActivity(value: string, candidates: string[]): boolean {
  const v = value.trim();
  return candidates.some((c) => v === c || v.includes(c) || c.includes(v));
}
