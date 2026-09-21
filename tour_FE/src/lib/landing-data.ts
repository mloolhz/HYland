import { SEASON_REWARDS, type SeasonReward } from "@/mocks/missions";

export type { SeasonReward };
export { SEASON_REWARDS };

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

export type LandingExampleReview = {
  isl: string;
  name: string;
  act: string;
  text: string;
};

/** 랜딩 커뮤니티 카드 — 실제 글이 아닌 UI 예시(플레이스홀더). */
export const COMMUNITY_LANDING_EXAMPLE_REVIEWS: LandingExampleReview[] = [
  {
    isl: "00도",
    name: "김00",
    act: "사이클",
    text: "섬 일주 사이클 코스가 평지라 초보도 편하게 달릴 수 있었어요.",
  },
  {
    isl: "△△도",
    name: "이00",
    act: "하이킹",
    text: "해안 트레킹 하며 바다 풍경이 정말 인상적이었어요.",
  },
];

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
