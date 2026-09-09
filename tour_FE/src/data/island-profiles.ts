/** 네이버 검색 데이터(블랙키위) 기반 섬별 계절·여행 성향 특징. */
export type IslandProfile = { island: string; season: string[]; peakMonth: string; ageMain: string[]; travelType: string[]; activities: string[]; note: string };

export const ISLAND_PROFILES: IslandProfile[] = [
  { island: "강화도", season: ["여름", "가을"], peakMonth: "8월", ageMain: ["30대", "40대", "20대"], travelType: ["가족", "친구·연인"], activities: ["갯벌체험", "캠핑", "펜션", "마니산 등산", "루지", "온천"], note: "연중 인기, 접근성 좋아 당일치기~1박 폭넓게 소화" },
  { island: "교동도", season: ["봄", "가을"], peakMonth: "5월", ageMain: ["50대+"], travelType: ["휴양"], activities: ["대룡시장 레트로 골목", "평화전망대", "걷기"], note: "조용한 역사탐방·휴양, 액티비티보다 한적한 감성" },
  { island: "석모도", season: ["봄", "여름"], peakMonth: "7월", ageMain: ["50대+", "40대"], travelType: ["휴양", "가족"], activities: ["보문사", "미네랄 온천", "해수욕장"], note: "사찰·온천 힐링, 가족 나들이" },
  { island: "볼음도", season: ["여름"], peakMonth: "7월", ageMain: ["50대+"], travelType: ["휴양"], activities: ["은행나무", "갯벌 조개잡이"], note: "관광 인프라 적은 한적한 오지, 조용한 자연" },
  { island: "주문도", season: ["여름"], peakMonth: "6월", ageMain: ["50대+", "40대"], travelType: ["휴양", "가족"], activities: ["대빈창해변 캠핑", "낚시", "갯벌체험", "트레킹"], note: "붐비지 않는 자연·백패킹" },
  { island: "신시모도", season: ["봄", "가을"], peakMonth: "9월", ageMain: ["30대", "40대", "50대+"], travelType: ["친구·연인", "가족"], activities: ["자전거·스쿠터 라이딩", "수기해변", "카페"], note: "영종도서 가깝고 당일치기 라이딩·드라이브" },
  { island: "장봉도", season: ["여름"], peakMonth: "7월", ageMain: ["40대", "50대+"], travelType: ["가족"], activities: ["해수욕장", "갯벌체험", "캠핑", "등산"], note: "가족 물놀이·아웃도어, 당일치기~1박" },
  { island: "연평도", season: ["가을"], peakMonth: "9월", ageMain: ["50대+", "30대"], travelType: ["휴양"], activities: ["꽃게 미식", "안보관광"], note: "꽃게철 미식·조용한 여행, 접경지" },
  { island: "백령도", season: ["여름", "겨울"], peakMonth: "7월", ageMain: ["50대+"], travelType: ["휴양"], activities: ["기암절벽", "해변 경관"], note: "원거리 2박3일 이상 경관여행" },
];

const PROFILE_ISLAND_ALIASES: Record<string, string> = { "신도·시도·모도": "신시모도" };

export function getIslandProfile(islandName: string): IslandProfile | undefined {
  const profileName = PROFILE_ISLAND_ALIASES[islandName] ?? islandName;
  return ISLAND_PROFILES.find((profile) => profile.island === profileName);
}
