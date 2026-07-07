export type LeaderboardPeriod = "week" | "month" | "all";

export type LeaderboardEntry = [name: string, points: number];

export const LEADERBOARD: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  week: [
    ["바다별탐험가", 2480],
    ["섬돌이", 2210],
    ["갯바위", 1985],
    ["라이딩킹", 1760],
    ["서해바람", 1540],
    ["물때달인", 1395],
    ["노을수집가", 1240],
    ["카약조아", 1105],
    ["트레일홀릭", 980],
  ],
  month: [
    ["섬마스터", 9840],
    ["바다별탐험가", 9215],
    ["인천갈매기", 8560],
    ["파도소리", 7930],
    ["라이딩킹", 7415],
    ["덕적드림", 6880],
    ["백패커준", 6320],
    ["갯바위", 5940],
    ["SUP러버", 5410],
  ],
  all: [
    ["등대지기", 128400],
    ["섬마스터", 117260],
    ["바다별탐험가", 103980],
    ["영종라이더", 95420],
    ["백령홀릭", 88750],
    ["인천갈매기", 81330],
    ["파도소리", 74980],
    ["노을수집가", 69540],
    ["물때달인", 64120],
  ],
};

export type Review = {
  isl: string;
  name: string;
  act: string;
  text: string;
};

export const REVIEWS: Review[] = [
  { isl: "백령도", name: "김OO", act: "사이클", text: "자전거로 섬 한바퀴 도니깐 기분이 너무 좋았어요~" },
  { isl: "무의도", name: "이OO", act: "카약", text: "하나개 해수욕장에서 카약 체험! 물이 맑아서 최고였어요" },
  { isl: "덕적도", name: "박OO", act: "SUP", text: "SUP 처음 타봤는데 강사님이 친절하게 알려주셨어요" },
  { isl: "영종도", name: "최OO", act: "사이클", text: "해안 사이클 코스 노을 뷰가 진짜 예술입니다…" },
  { isl: "소무의도", name: "정OO", act: "러닝", text: "무의바다누리길 트레일 러닝, 코스 난이도 딱 좋아요!" },
  { isl: "장봉도", name: "강OO", act: "갯벌체험", text: "아이들이랑 갯벌체험 다녀왔는데 온 가족이 대만족!" },
  { isl: "승봉도", name: "윤OO", act: "캠핑", text: "캠핑하면서 본 일몰이 아직도 눈에 아른거리네요" },
  { isl: "자월도", name: "한OO", act: "낚시", text: "방파제 낚시 포인트 추천받아 갔는데 손맛 제대로!" },
  { isl: "대이작도", name: "조OO", act: "하이킹", text: "풀등 모래섬 산책하고 부아산 전망대까지, 인생샷 건졌어요" },
  { isl: "신도", name: "오OO", act: "사이클", text: "신도-시도-모도 자전거길 강추! 평지라 초보도 OK" },
  { isl: "백령도", name: "서OO", act: "하이킹", text: "두무진 해안 트레킹, 서해의 해금강이라는 말이 실감나요" },
  { isl: "무의도", name: "임OO", act: "패들보드", text: "패들보드 타고 바다 위에서 본 섬, 잊지 못할 거예요" },
];

export const AVA_COLORS = [
  "#0F5FCC",
  "#F3B33D",
  "#2FA36B",
  "#8B7CF6",
  "#F06595",
  "#22B8CF",
  "#F76707",
  "#5C7CFA",
  "#12B886",
];

export function avaColor(name: string): string {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVA_COLORS[sum % AVA_COLORS.length];
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}
