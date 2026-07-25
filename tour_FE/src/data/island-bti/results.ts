import type { IslandBtiResultCode, IslandBtiResultData } from "@/types/island-bti";
import { ISLAND_BTI_AXIS_VALUES } from "@/types/island-bti";
import type { IslandBtiScoreMap } from "@/lib/island-bti";

export const ISLAND_BTI_RESULT_CODES: IslandBtiResultCode[] = [
  "AWCP",
  "AWCF",
  "AWIP",
  "AWIF",
  "ALCP",
  "ALCF",
  "ALIP",
  "ALIF",
  "BWCP",
  "BWCF",
  "BWIP",
  "BWIF",
  "BLCP",
  "BLCF",
  "BLIP",
  "BLIF",
];

export const ISLAND_BTI_RESULTS: Record<IslandBtiResultCode, IslandBtiResultData> = {
  AWCP: {
    code: "AWCP",
    name: "파도 작전대장",
    englishTraits: ["Active", "Water", "Crew", "Planned"],
    tagline: "목표를 세우고 크루와 함께 바다를 정복하는 지휘관",
    description: [
      "단체 해양레저와 기록 달성을 좋아함",
      "활동을 미리 예약하고 효율적으로 움직이는 편",
      "경쟁이나 협동 미션이 있으면 몰입도가 높아짐",
    ],
    recommendedActivities: ["단체 카약", "SUP 챌린지", "패들보트", "해변 팀 미션", "선상낚시"],
    recommendedIslands: ["대무의도", "영종·용유도", "덕적도"],
    recommendationReason:
      "활동적인 해양레저를 선호하고 친구들과 함께 목표를 달성할 때 만족도가 높은 유형입니다. 이동과 예약을 미리 준비하는 성향이 강해 여러 코스를 연결하는 여행에 잘 맞습니다.",
    travelTip: "계획을 모두 완료하려다 일행을 재촉할 수 있어요. 일정 사이에 자유시간을 넣어보세요.",
    bestMatch: "AWCF",
    complementaryMatch: "AWIP",
    cautionMatch: "BLIF",
  },
  AWCF: {
    code: "AWCF",
    name: "즉흥 해양원정대",
    englishTraits: ["Active", "Water", "Crew", "Flow"],
    tagline: "친구들과 바다를 발견하는 순간 바로 뛰어드는 행동파",
    description: [
      "계획보다 현장의 분위기에 따라 활동을 결정함",
      "일행의 반응이 좋으면 새로운 체험에도 적극적",
      "재미와 추억이 최우선",
    ],
    recommendedActivities: ["현장형 물놀이", "패들보트", "비치게임", "갯벌 팀 체험", "즉석 낚시 체험"],
    recommendedIslands: ["영종·용유도", "대무의도", "덕적도"],
    recommendationReason:
      "함께하는 분위기와 현장의 재미를 중요하게 여겨, 선택지가 많고 즉석에서 활동을 바꾸기 쉬운 섬 여행과 잘 맞습니다.",
    travelTip: "현장에서 결정하더라도 배편과 귀가 시간만큼은 미리 확인해주세요.",
    bestMatch: "AWCP",
    complementaryMatch: "AWIF",
    cautionMatch: "BLIP",
  },
  AWIP: {
    code: "AWIP",
    name: "블루 코스마스터",
    englishTraits: ["Active", "Water", "Independent", "Planned"],
    tagline: "나만의 해양 도전을 정교하게 설계하는 기록형 탐험가",
    description: [
      "혼자 또는 소수 인원으로 집중하는 레저 선호",
      "안전수칙과 장비 준비를 꼼꼼히 확인함",
      "체험 기록과 완주 성취를 중요하게 생각함",
    ],
    recommendedActivities: ["개인 SUP", "카약 코스", "낚시", "해안 러닝", "해변 인증 미션"],
    recommendedIslands: ["덕적도", "대이작도·소이작도 권역", "백령도"],
    recommendationReason:
      "독립적으로 움직이면서 준비를 꼼꼼히 하는 유형으로, 이동 계획과 장비 확인이 중요한 해양 코스와 잘 맞습니다.",
    travelTip: "계획한 기록에 집중하느라 주변 풍경을 놓치지 않도록 중간 휴식 시간을 넣어보세요.",
    bestMatch: "AWIF",
    complementaryMatch: "AWCP",
    cautionMatch: "BLCF",
  },
  AWIF: {
    code: "AWIF",
    name: "자유파도 개척자",
    englishTraits: ["Active", "Water", "Independent", "Flow"],
    tagline: "지도보다 파도를 따라 움직이는 자유로운 해양 모험가",
    description: [
      "혼자서도 새로운 활동에 잘 뛰어듦",
      "정해진 코스보다 현장에서 마음 가는 곳을 선택",
      "일행의 속도보다 자신의 감각을 중시함",
    ],
    recommendedActivities: ["자유 물놀이", "개인 카약", "즉흥 낚시", "해변 러닝", "해안 탐방"],
    recommendedIslands: ["대무의도", "영종·용유도", "덕적도"],
    recommendationReason:
      "현장에서 자유롭게 움직이면서도 활동적인 해양 경험을 선호해 접근성과 선택지가 좋은 섬과 잘 맞습니다.",
    travelTip: "즉흥적으로 움직이더라도 안전 장비와 운영 시간은 반드시 확인해주세요.",
    bestMatch: "AWIP",
    complementaryMatch: "AWCF",
    cautionMatch: "BLCP",
  },
  ALCP: {
    code: "ALCP",
    name: "산해 챌린지 리더",
    englishTraits: ["Active", "Land", "Crew", "Planned"],
    tagline: "크루와 함께 섬의 코스를 완주하는 원정대장",
    description: [
      "트레킹과 사이클을 팀 단위로 즐김",
      "코스 완주와 인증을 좋아함",
      "선두에서 일정을 관리하거나 사람들을 이끄는 편",
    ],
    recommendedActivities: ["섬 트레킹", "단체 사이클", "오르막 챌린지", "체크포인트 미션", "백패킹"],
    recommendedIslands: ["대무의도", "덕적도", "소이작도"],
    recommendationReason:
      "팀과 함께 코스를 완주하고 성취를 공유하는 데 만족도가 높아 탐방로와 인증 요소가 있는 섬 여행과 잘 맞습니다.",
    travelTip: "팀원의 체력 차이를 고려해 중간 이탈 지점과 휴식 장소를 미리 정해주세요.",
    bestMatch: "ALCF",
    complementaryMatch: "ALIP",
    cautionMatch: "BWIF",
  },
  ALCF: {
    code: "ALCF",
    name: "섬길 번개대장",
    englishTraits: ["Active", "Land", "Crew", "Flow"],
    tagline: "친구들과 재미있는 길이 보이면 일단 출발하는 현장파",
    description: [
      "정해진 완주보다 함께 뛰고 걷는 과정이 중요함",
      "예정에 없던 전망대나 마을길도 즐겁게 받아들임",
      "활동적인 친구들과 갈수록 만족도가 높음",
    ],
    recommendedActivities: ["즉흥 트레킹", "해안 러닝", "자전거 산책", "마을 퀘스트", "보물찾기"],
    recommendedIslands: ["대무의도", "덕적도", "소무의도"],
    recommendationReason:
      "함께 걷고 뛰며 현장에서 새로운 길을 발견하는 여행에 잘 맞아 다양한 탐방로와 마을길이 있는 섬을 추천합니다.",
    travelTip: "즉흥적으로 코스를 바꿀 때는 배 시간과 일몰 시간을 놓치지 않도록 주의해주세요.",
    bestMatch: "ALCP",
    complementaryMatch: "ALIF",
    cautionMatch: "BWIP",
  },
  ALIP: {
    code: "ALIP",
    name: "정상 정복 설계자",
    englishTraits: ["Active", "Land", "Independent", "Planned"],
    tagline: "코스를 분석하고 자신의 힘으로 완주하는 정복자",
    description: [
      "난이도와 이동 시간을 꼼꼼히 확인함",
      "혼자 걷거나 자신의 속도로 움직이는 것을 선호",
      "정상, 완주, 기록처럼 명확한 목표에 강함",
    ],
    recommendedActivities: ["장거리 트레킹", "하이킹", "사이클링", "섬 러닝", "백패킹"],
    recommendedIslands: ["덕적도", "대무의도", "백령도", "소이작도"],
    recommendationReason:
      "목표와 코스를 명확하게 세우고 독립적으로 완주하는 성향이 강해 장거리 탐방과 기록형 활동에 잘 맞습니다.",
    travelTip: "혼자 이동할 때는 현재 위치와 예상 귀환 시간을 다른 사람에게 공유해주세요.",
    bestMatch: "ALIF",
    complementaryMatch: "ALCP",
    cautionMatch: "BWCF",
  },
  ALIF: {
    code: "ALIF",
    name: "무계획 트레일러",
    englishTraits: ["Active", "Land", "Independent", "Flow"],
    tagline: "발길 닿는 대로 섬의 숨은 길을 찾아가는 탐험가",
    description: [
      "목적지를 정하기보다 걷다 발견하는 것을 좋아함",
      "혼자 움직이며 일정을 자유롭게 바꾸는 편",
      "작은 골목, 샛길, 이름 없는 풍경에 매력을 느낌",
    ],
    recommendedActivities: ["자유 트레킹", "해안길 탐방", "러닝", "사진 산책", "짧은 하이킹"],
    recommendedIslands: ["소이작도", "소무의도", "대무의도"],
    recommendationReason:
      "정해진 코스보다 발길에 따라 움직이는 것을 좋아해 부담 없이 탐방 방향을 바꿀 수 있는 섬과 잘 맞습니다.",
    travelTip: "샛길을 탐색할 때는 출입 제한 구역과 사유지를 반드시 확인해주세요.",
    bestMatch: "ALIP",
    complementaryMatch: "ALCF",
    cautionMatch: "BWCP",
  },
  BWCP: {
    code: "BWCP",
    name: "바다 피크닉 플래너",
    englishTraits: ["Breezy", "Water", "Crew", "Planned"],
    tagline: "모두가 편안한 바다 하루를 준비하는 섬 여행 총무",
    description: [
      "무리한 레저보다 함께 즐길 수 있는 체험 선호",
      "식사, 사진, 휴식 장소를 미리 챙기는 편",
      "일행 중 체력이 약한 사람까지 고려함",
    ],
    recommendedActivities: ["해변 피크닉", "갯벌체험", "패들보트", "가벼운 낚시", "노을 감상"],
    recommendedIslands: ["영종·용유도", "대무의도", "덕적도"],
    recommendationReason:
      "함께 편안하게 즐길 수 있는 바다 일정과 휴식 동선을 중요하게 여겨 기반시설과 선택지가 비교적 다양한 섬에 잘 맞습니다.",
    travelTip: "모두를 챙기느라 본인이 원하는 활동을 놓치지 않도록 개인 선택 시간도 넣어보세요.",
    bestMatch: "BWCF",
    complementaryMatch: "BWIP",
    cautionMatch: "ALIF",
  },
  BWCF: {
    code: "BWCF",
    name: "물멍 놀이메이트",
    englishTraits: ["Breezy", "Water", "Crew", "Flow"],
    tagline: "바다와 친구만 있으면 일정이 없어도 행복한 분위기 담당",
    description: [
      "레저의 난이도보다 함께 즐기는 분위기를 중시함",
      "사진, 간식, 물놀이를 자연스럽게 섞어 즐김",
      "계획이 틀어져도 비교적 스트레스를 덜 받음",
    ],
    recommendedActivities: ["가벼운 물놀이", "비치게임", "카페", "해변 산책", "일몰 감상"],
    recommendedIslands: ["영종·용유도", "대무의도", "덕적도"],
    recommendationReason:
      "친구들과 가볍게 즐기고 머물 수 있는 장소를 선호해 해변과 먹거리, 휴식 장소가 함께 있는 섬에 잘 맞습니다.",
    travelTip: "즉흥적으로 머무르더라도 마지막 교통편 시간은 미리 저장해주세요.",
    bestMatch: "BWCP",
    complementaryMatch: "BWIF",
    cautionMatch: "ALIP",
  },
  BWIP: {
    code: "BWIP",
    name: "고요한 해변 수집가",
    englishTraits: ["Breezy", "Water", "Independent", "Planned"],
    tagline: "조용한 바다를 찾아 나만의 휴식을 설계하는 기록가",
    description: [
      "붐비지 않는 시간과 장소를 선호함",
      "일출·일몰 시간이나 촬영 포인트를 미리 찾아봄",
      "자극적인 레저보다 바다의 분위기에 집중함",
    ],
    recommendedActivities: ["해변 산책", "바다 사진 촬영", "조용한 낚시", "물멍", "별 관찰"],
    recommendedIslands: ["소이작도", "백령도", "덕적도"],
    recommendationReason:
      "한적한 바다와 촬영 포인트를 미리 찾아 조용히 머무는 여행에 만족도가 높아 풍경과 여유가 있는 섬을 추천합니다.",
    travelTip: "좋은 촬영 지점을 찾더라도 안전선과 출입 가능 시간을 확인해주세요.",
    bestMatch: "BWIF",
    complementaryMatch: "BWCP",
    cautionMatch: "ALCF",
  },
  BWIF: {
    code: "BWIF",
    name: "느긋한 섬유영자",
    englishTraits: ["Breezy", "Water", "Independent", "Flow"],
    tagline: "한적한 바다 앞에서 아무것도 하지 않을 자유를 즐기는 사람",
    description: [
      "계획 없이 해변에 머무는 시간을 좋아함",
      "관광지를 많이 보는 것보다 마음에 드는 한 장소에 오래 머묾",
      "혼자 또는 조용한 동행과 잘 맞음",
    ],
    recommendedActivities: ["물멍", "해변 독서", "자유 산책", "카페", "가벼운 물놀이"],
    recommendedIslands: ["소무의도", "소이작도", "영종·용유도"],
    recommendationReason:
      "일정을 채우기보다 마음에 드는 해변에 오래 머무는 것을 선호해 짧고 느긋하게 둘러볼 수 있는 섬과 잘 맞습니다.",
    travelTip: "머무는 시간이 길어질 수 있으니 귀가 교통편 알림을 설정해두세요.",
    bestMatch: "BWIP",
    complementaryMatch: "BWCF",
    cautionMatch: "ALCP",
  },
  BLCP: {
    code: "BLCP",
    name: "섬마을 일정반장",
    englishTraits: ["Breezy", "Land", "Crew", "Planned"],
    tagline: "걷고 먹고 쉬는 완벽한 섬 하루를 설계하는 여행 총무",
    description: [
      "과격한 활동보다 모두가 참여할 수 있는 여행 선호",
      "맛집, 산책로, 포토존을 균형 있게 구성함",
      "가족·친구 단체여행에 강함",
    ],
    recommendedActivities: ["마을 산책", "짧은 둘레길", "먹거리 투어", "포토 미션", "문화·생태 체험"],
    recommendedIslands: ["소무의도", "덕적도", "영종·용유도"],
    recommendationReason:
      "구성원 모두가 편하게 참여할 수 있도록 산책, 먹거리, 휴식을 조합하는 성향이라 이동이 어렵지 않은 섬 여행과 잘 맞습니다.",
    travelTip: "일정을 촘촘히 구성하기보다 장소 사이에 충분한 이동 시간을 확보해주세요.",
    bestMatch: "BLCF",
    complementaryMatch: "BLIP",
    cautionMatch: "AWIF",
  },
  BLCF: {
    code: "BLCF",
    name: "골목 산책 메이트",
    englishTraits: ["Breezy", "Land", "Crew", "Flow"],
    tagline: "친구들과 걷다가 마음에 드는 곳에 멈추는 발견형 여행자",
    description: [
      "정해진 관광지보다 여행 중 발견하는 장소를 좋아함",
      "카페, 골목, 해안길을 자연스럽게 연결함",
      "대화와 분위기가 여행 만족도를 크게 좌우함",
    ],
    recommendedActivities: ["마을길 탐방", "포토 스폿 찾기", "가벼운 산책", "먹거리 투어", "즉흥 카페 방문"],
    recommendedIslands: ["소무의도", "대무의도", "영종·용유도"],
    recommendationReason:
      "일행과 대화하며 걷다가 새로운 장소를 발견하는 여행을 좋아해 골목과 해안길을 자유롭게 연결할 수 있는 섬과 잘 맞습니다.",
    travelTip: "마음에 드는 곳에 오래 머물 수 있으니 일행과 귀가 기준 시간만 정해두세요.",
    bestMatch: "BLCP",
    complementaryMatch: "BLIF",
    cautionMatch: "AWIP",
  },
  BLIP: {
    code: "BLIP",
    name: "풍경 기록 설계자",
    englishTraits: ["Breezy", "Land", "Independent", "Planned"],
    tagline: "조용한 섬의 풍경을 차분하게 수집하는 아카이빙 여행자",
    description: [
      "걷는 속도가 빠르지 않더라도 관찰을 많이 함",
      "촬영 장소와 시간대를 미리 찾아보는 편",
      "생태, 지질, 역사처럼 이야기가 있는 장소를 좋아함",
    ],
    recommendedActivities: ["사진 산책", "생태 탐방", "지질 관광", "문화유산 탐방", "일몰 관찰"],
    recommendedIslands: ["백령도", "소이작도", "소무의도"],
    recommendationReason:
      "풍경의 배경과 이야기를 관찰하고 기록하는 성향이 강해 생태, 지질, 역사 자원이 있는 섬과 잘 맞습니다.",
    travelTip: "기록에 집중하더라도 현장의 안내문과 보호 구역 규칙을 우선해주세요.",
    bestMatch: "BLIF",
    complementaryMatch: "BLCP",
    cautionMatch: "AWCF",
  },
  BLIF: {
    code: "BLIF",
    name: "바람 따라 산책자",
    englishTraits: ["Breezy", "Land", "Independent", "Flow"],
    tagline: "목적지 없이 천천히 걸으며 섬의 분위기를 느끼는 자유인",
    description: [
      "많이 보기보다 천천히 느끼는 여행을 선호",
      "일행이 있더라도 조용히 걷는 시간이 필요함",
      "작은 섬과 짧은 산책 코스에 만족도가 높음",
    ],
    recommendedActivities: ["둘레길 산책", "마을 탐방", "해안길 걷기", "독서", "풍경 감상"],
    recommendedIslands: ["소무의도", "소이작도", "덕적도"],
    recommendationReason:
      "목적지를 많이 정하지 않고 천천히 걷는 여행을 좋아해 짧은 탐방로와 조용한 풍경이 있는 섬과 잘 맞습니다.",
    travelTip: "혼자 조용히 걷더라도 현재 위치와 귀가 시간을 주기적으로 확인해주세요.",
    bestMatch: "BLIP",
    complementaryMatch: "BLCF",
    cautionMatch: "AWCP",
  },
};

export function isIslandBtiResultCode(code: string): code is IslandBtiResultCode {
  return Object.prototype.hasOwnProperty.call(ISLAND_BTI_RESULTS, code);
}

export function getIslandBtiResult(code: string): IslandBtiResultData | null {
  if (!isIslandBtiResultCode(code)) return null;
  return ISLAND_BTI_RESULTS[code];
}

const AXIS_DISPLAY_LABELS: Record<"AB" | "WL" | "CI" | "PF", string> = {
  AB: "활동 에너지",
  WL: "선호 공간",
  CI: "동행 방식",
  PF: "여행 운영 방식",
};

const VALUE_DISPLAY_LABELS: Record<string, string> = {
  A: "Active",
  B: "Breezy",
  W: "Water",
  L: "Land",
  C: "Crew",
  I: "Independent",
  P: "Planned",
  F: "Flow",
};

export type IslandBtiAxisRatio = {
  dimension: "AB" | "WL" | "CI" | "PF";
  label: string;
  winner: string;
  winnerLabel: string;
  percent: number;
};

export function getIslandBtiAxisRatios(scores: IslandBtiScoreMap): IslandBtiAxisRatio[] {
  const dimensions = ["AB", "WL", "CI", "PF"] as const;

  return dimensions.map((dimension) => {
    const [left, right] = ISLAND_BTI_AXIS_VALUES[dimension];
    const leftScore = scores[left];
    const rightScore = scores[right];
    const winner = leftScore >= rightScore ? left : right;
    const winnerScore = Math.max(leftScore, rightScore);

    return {
      dimension,
      label: AXIS_DISPLAY_LABELS[dimension],
      winner,
      winnerLabel: VALUE_DISPLAY_LABELS[winner],
      percent: Math.round((winnerScore / 5) * 100),
    };
  });
}
