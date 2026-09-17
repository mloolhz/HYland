import type { MissionCategory } from "@/mocks/missions";
import { SEASON_REWARDS, type SeasonReward } from "@/mocks/missions";

export type { SeasonReward };
export { SEASON_REWARDS };

export type LeaderboardEntry = [name: string, points: number];

/** 미션 & 인증 카테고리별 리더보드 — API 연동 전 임시 데이터 */
export const CATEGORY_LEADERBOARD: Record<MissionCategory, LeaderboardEntry[]> = {
  섬: [
    ["바다별탐험가", 2480],
    ["섬마스터", 2310],
    ["등대지기", 2150],
    ["갯바위", 1985],
    ["인천갈매기", 1820],
    ["섬돌이", 1660],
    ["백령홀릭", 1495],
    ["서해바람", 1340],
    ["트레일홀릭", 1180],
  ],
  해상: [
    ["카약조아", 2620],
    ["SUP러버", 2440],
    ["파도소리", 2090],
    ["물때달인", 1770],
    ["영종라이더", 1930],
    ["갯바위", 1610],
    ["섬돌이", 1450],
    ["바다별탐험가", 1295],
    ["서핑러버", 1185],
  ],
  육상: [
    ["라이딩킹", 2285],
    ["트레일홀릭", 2040],
    ["영종라이더", 1880],
    ["섬돌이", 1720],
    ["백패커준", 1560],
    ["파도소리", 1410],
    ["인천갈매기", 1270],
    ["갯바위", 1140],
    ["덕적드림", 1010],
  ],
  체험: [
    ["갯바위", 2350],
    ["물때달인", 2180],
    ["백령홀릭", 1550],
    ["섬돌이", 1875],
    ["파도소리", 1710],
    ["덕적드림", 1400],
    ["인천갈매기", 1260],
    ["서해바람", 1120],
    ["카약조아", 980],
  ],
  힐링: [
    ["노을수집가", 2020],
    ["갯바위", 2350],
    ["물때달인", 2180],
    ["섬돌이", 1875],
    ["파도소리", 1710],
    ["백령홀릭", 1550],
    ["덕적드림", 1400],
    ["인천갈매기", 1260],
    ["서해바람", 1120],
  ],
  기타: [
    ["파도소리", 2280],
    ["섬돌이", 2140],
    ["노을수집가", 1990],
    ["갯바위", 1830],
    ["바다별탐험가", 1680],
    ["인천갈매기", 1520],
    ["백패커준", 1370],
    ["라이딩킹", 1230],
    ["SUP러버", 1090],
  ],
};

/** 랜딩 리더보드 프리뷰 호환 — 섬 카테고리 기준 */
export const LANDING_LEADERBOARD: LeaderboardEntry[] = CATEGORY_LEADERBOARD.섬;

/** 순위 변동 (지난주 대비) — 양수 상승, 음수 하락, 0 동일, "new" 신규 진입. CATEGORY_LEADERBOARD 인덱스와 매칭 */
export type RankDelta = number | "new";

export const CATEGORY_RANK_DELTAS: Record<MissionCategory, RankDelta[]> = {
  섬: [1, -1, 2, 0, "new", -2, 1, 0, 3],
  해상: [0, 2, -1, 1, 0, 3, -2, "new", 1],
  육상: [1, 0, -1, 2, "new", -1, 0, 3, -2],
  체험: [2, 0, 1, -1, "new", 0, 2, -3, 1],
  힐링: [0, 2, -1, 1, 0, "new", -2, 1, 0],
  기타: [1, -2, 0, 3, -1, 0, "new", 2, -1],
};

export type LeaderboardPeriod = "week" | "month" | "all";

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

/** 랜딩 커뮤니티 카드용 고정 예시(실제 게시글 아님). 섬명은 플레이스홀더. */
export const COMMUNITY_LANDING_EXAMPLE_REVIEWS: Review[] = [
  {
    isl: "OO도",
    name: "김OO",
    act: "사이클",
    text: "섬 일주 사이클 코스가 평지라 초보도 편하게 달릴 수 있었어요.",
  },
  {
    isl: "△△도",
    name: "이OO",
    act: "하이킹",
    text: "해안 트레킹 하며 바다 풍경이 정말 인상적이었어요.",
  },
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

/** 관련사이트 — url에 링크 주소를 입력하세요 */
export type RelatedSite = {
  name: string;
  url: string;
};

export const RELATED_SITES: RelatedSite[] = [
  { name: "인천광역시", url: "https://www.incheon.go.kr/index" },
  { name: "인천관광공사", url: "https://www.ito.or.kr/" },
  { name: "인천항만공사", url: "https://www.icpa.or.kr/index.do" },
  { name: "인천섬발전지원센터", url: "https://www.iisland.or.kr/" },
  { name: "한국섬진흥원", url: "https://kidi.re.kr/home.do" },
  { name: "옹진문화관광", url: "https://www.ongjin.go.kr/open_content/tour/" },
  { name: "강화문화관광", url: "https://www.ganghwa.go.kr/open_content/tour/" },
  { name: "서해구문화관광", url: "https://www.seohae.go.kr/open_content/tour/" },
  { name: "인천투어(I TOUR)", url: "https://itour.incheon.go.kr/" },
];
