import { SPORTS_DATA } from "@/data/sports";
import { ISLANDS } from "@/lib/island-data";

export type MissionBadgeState = "earned" | "doing" | "locked";

/* ── 미션 & 인증 (게이지형 퀘스트) — API 연동 전 임시 데이터 (랜딩·미션 페이지 공용 단일 출처) ── */



export type MissionCategory = "섬" | "해상" | "육상" | "체험" | "힐링" | "기타";



export const MISSION_CATEGORIES: MissionCategory[] = ["섬", "해상", "육상", "체험", "힐링", "기타"];



/** 배지 희귀도 — 수집 재미를 위한 등급 */

export type MissionTier = "일반" | "희귀" | "전설";



/** 카테고리별 대표 이모지·색상 (배지 프레임·게이지·그룹 헤더 공용) — 인천 색깔 10 중 6색 사용 */

export const CATEGORY_META: Record<MissionCategory, { emoji: string; color: string; colorName: string }> = {

  섬: { emoji: "🏝️", color: "#2A5C93", colorName: "인천바다색" },

  해상: { emoji: "⛵", color: "#1E6FA8", colorName: "바다파랑" },

  육상: { emoji: "🚴", color: "#3E8354", colorName: "문학산녹색" },

  체험: { emoji: "🎯", color: "#B08A4A", colorName: "강화갯벌색" },

  힐링: { emoji: "🌿", color: "#5A9E6F", colorName: "힐링그린" },

  기타: { emoji: "✨", color: "#B0503A", colorName: "개항장벽돌색" },

};



export type MissionQuest = {

  id: number;

  category: MissionCategory;

  icon: string;

  title: string;

  desc: string;

  /** 현재 진행 수치 */

  current: number;

  /** 배지 획득에 필요한 목표 수치 */

  target: number;

  /** 진행 수치 단위 (곳, 종, 회 등) */

  unit: string;

  /** 획득 시 지급되는 배지 이름 */

  reward: string;

  /** 배지 희귀도 */

  tier: MissionTier;

  /** 레저스포츠 종목 id (`SPORTS_DATA`와 연동, SVG 아이콘 등) */
  sportId?: string;

};



const ISLAND_VISIT_QUESTS: MissionQuest[] = ISLANDS.map((island, index) => ({
  id: index + 1,
  category: "섬",
  icon: "",
  title: `${island.name} 방문`,
  desc: `${island.name}에 방문하면 획득해요`,
  current: island.visited ? 1 : 0,
  target: 1,
  unit: "회",
  reward: `${island.name} 방문 배지`,
  tier: "일반",
}));

/** 레저스포츠 페이지 체험 탭(`SPORTS_DATA.exp`) 종목과 동기화 */
const EXP_SPORT_ICONS: Record<string, string> = {
  mud: "🐚",
  fish: "🎣",
  pool: "🏝️",
  night: "🔦",
  zip: "",
  monorail: "🚝",
  luge: "🛷",
};

const EXP_SPORT_DEMO_PROGRESS: Partial<Record<string, number>> = {
  mud: 1,
};

const EXPERIENCE_SPORT_QUESTS: MissionQuest[] = SPORTS_DATA.exp.map((sport, index) => ({
  id: 36 + index,
  category: "체험",
  sportId: sport.id,
  icon: EXP_SPORT_ICONS[sport.id] ?? "🎯",
  title: sport.name,
  desc: `${sport.name} 1회 체험`,
  current: EXP_SPORT_DEMO_PROGRESS[sport.id] ?? 0,
  target: 1,
  unit: "회",
  reward: `${sport.name} 배지`,
  tier: "일반",
}));

/** 레저스포츠 페이지 힐링 탭(`SPORTS_DATA.heal`) 종목과 동기화 */
const HEAL_SPORT_ICONS: Record<string, string> = {
  forest: "🌲",
  sunset: "🌅",
  seal: "🦭",
  walk: "🚶",
  star: "🌌",
  village: "🏘️",
  spa: "♨️",
};

const HEAL_SPORT_DEMO_PROGRESS: Partial<Record<string, number>> = {
  sunset: 2,
};

const HEAL_SPORT_TARGETS: Partial<Record<string, number>> = {
  sunset: 4,
};

const HEALING_SPORT_QUESTS: MissionQuest[] = SPORTS_DATA.heal.map((sport, index) => ({
  id: 48 + index,
  category: "힐링",
  sportId: sport.id,
  icon: HEAL_SPORT_ICONS[sport.id] ?? "🌿",
  title: sport.name,
  desc:
    sport.id === "sunset"
      ? "섬에서 일몰을 감상하고 인증샷을 남겨요"
      : `${sport.name} 1회 체험`,
  current: HEAL_SPORT_DEMO_PROGRESS[sport.id] ?? 0,
  target: HEAL_SPORT_TARGETS[sport.id] ?? 1,
  unit: "회",
  reward: `${sport.name} 배지`,
  tier: sport.id === "star" || sport.id === "seal" ? "희귀" : "일반",
}));

/** 리더보드 시즌 순위 보상 — Leaderboard 페이지 `SEASON_REWARDS`와 동기화 */
export type SeasonReward = {
  rank: string;
  medal: string;
  title: string;
  desc: string;
};

export const SEASON_REWARDS: SeasonReward[] = [
  { rank: "1위", medal: "🏆", title: "골드 탐험가 배지", desc: "여권 특별 스탬프 + 프로필 골드 테두리" },
  { rank: "2·3위", medal: "🥈", title: "실버 탐험가 배지", desc: "여권 특별 스탬프 지급" },
  { rank: "4~10위", medal: "🥉", title: "브론즈 탐험가 배지", desc: "여권 기본 스탬프 지급" },
];

const LEADERBOARD_REWARD_MISSION_DESC: Record<string, string> = {
  "1위": "시즌 종합 리더보드 1위 달성",
  "2·3위": "시즌 종합 리더보드 2~3위 달성",
  "4~10위": "시즌 종합 리더보드 4~10위 달성",
};

const LEADERBOARD_REWARD_TIERS: MissionTier[] = ["전설", "희귀", "일반"];

const LEADERBOARD_REWARD_QUESTS: MissionQuest[] = SEASON_REWARDS.map((reward, index) => ({
  id: 55 + index,
  category: "기타",
  icon: reward.medal,
  title: reward.title.replace(/ 배지$/, ""),
  desc: LEADERBOARD_REWARD_MISSION_DESC[reward.rank] ?? reward.desc,
  current: 0,
  target: 1,
  unit: "회",
  reward: reward.title,
  tier: LEADERBOARD_REWARD_TIERS[index] ?? "일반",
}));

function createGrandSlamQuest(
  category: Extract<MissionCategory, "해상" | "육상" | "체험" | "힐링">,
  id: number,
  sportCount: number,
  current = 0,
): MissionQuest {
  return {
    id,
    category,
    icon: "🏆",
    title: `${category} 그랜드슬램`,
    desc: `${category} ${sportCount}종을 모두 정복해요`,
    current,
    target: sportCount,
    unit: "종",
    reward: `${category} 그랜드슬램 배지`,
    tier: "전설",
  };
}

const GRAND_SLAM_QUESTS = {
  해상: createGrandSlamQuest("해상", 34, SPORTS_DATA.water.length),
  육상: createGrandSlamQuest("육상", 47, SPORTS_DATA.land.length),
  체험: createGrandSlamQuest("체험", 58, SPORTS_DATA.exp.length),
  힐링: createGrandSlamQuest("힐링", 59, SPORTS_DATA.heal.length),
};

export const MISSION_QUESTS: MissionQuest[] = [
  ...ISLAND_VISIT_QUESTS,

  // ── 해상 (5) ──
  { id: 30, category: "해상", icon: "🛶", title: "물놀이 시작", desc: "카약 또는 SUP를 1회 체험해요", current: 1, target: 1, unit: "회", reward: "물놀이 배지", tier: "일반" },
  { id: 31, category: "해상", icon: "🏄", title: "서핑 비기너", desc: "SUP·서핑을 3회 체험해요", current: 1, target: 3, unit: "회", reward: "서핑 비기너 배지", tier: "일반" },
  { id: 32, category: "해상", icon: "🚢", title: "유람선 탑승", desc: "섬 유람선·여객선을 1회 탑승해요", current: 0, target: 1, unit: "회", reward: "유람선 배지", tier: "일반" },
  { id: 33, category: "해상", icon: "🛥️", title: "패들보트 체험", desc: "패들보드를 1회 체험해요", current: 0, target: 1, unit: "회", reward: "패들보트 배지", tier: "일반" },
  GRAND_SLAM_QUESTS.해상,

  // ── 육상 (4) ──
  { id: 35, category: "육상", icon: "🚴", title: "사이클 라이더", desc: "섬 자전거 코스를 3회 달려요", current: 2, target: 3, unit: "회", reward: "사이클 라이더 배지", tier: "일반" },
  { id: 45, category: "육상", icon: "🥾", title: "트레킹", desc: "섬 트레킹 코스를 3회 완주해요", current: 1, target: 3, unit: "회", reward: "트레킹 배지", tier: "일반" },
  { id: 46, category: "육상", icon: "⛺", title: "캠핑·백패킹", desc: "섬에서 캠핑 또는 백패킹을 1회 체험해요", current: 0, target: 1, unit: "회", reward: "캠핑·백패킹 배지", tier: "일반" },
  GRAND_SLAM_QUESTS.육상,

  ...EXPERIENCE_SPORT_QUESTS,
  GRAND_SLAM_QUESTS.체험,

  ...HEALING_SPORT_QUESTS,
  GRAND_SLAM_QUESTS.힐링,

  // ── 기타 (8) ──
  { id: 40, category: "기타", icon: "✍️", title: "첫 후기", desc: "섬 여행 후기를 처음 남겨요", current: 1, target: 1, unit: "개", reward: "첫 후기 배지", tier: "일반" },
  { id: 41, category: "기타", icon: "💬", title: "댓글 요정", desc: "커뮤니티에 댓글 5개를 남겨요", current: 5, target: 5, unit: "개", reward: "댓글 요정 배지", tier: "일반" },
  { id: 42, category: "기타", icon: "🧩", title: "섬BTI 참여", desc: "나의 섬BTI 테스트에 참여해요", current: 1, target: 1, unit: "회", reward: "섬BTI 배지", tier: "일반" },
  { id: 43, category: "기타", icon: "❤️", title: "인싸 탐험가", desc: "내 글이 좋아요 10개를 받아요", current: 10, target: 10, unit: "개", reward: "인싸 탐험가 배지", tier: "희귀" },
  { id: 44, category: "기타", icon: "📸", title: "이야기꾼", desc: "섬 여행 후기를 10개 남겨요", current: 4, target: 10, unit: "개", reward: "이야기꾼 배지", tier: "희귀" },

  ...LEADERBOARD_REWARD_QUESTS,
];



export function missionQuestState(quest: MissionQuest): MissionBadgeState {

  if (quest.current >= quest.target) return "earned";

  if (quest.current > 0) return "doing";

  return "locked";

}



export function missionQuestPercent(quest: MissionQuest): number {

  if (quest.target <= 0) return 0;

  return Math.min(100, Math.round((quest.current / quest.target) * 100));

}



/** 카테고리별 획득/전체 배지 수 */

export function getCategoryProgress(category: MissionCategory) {

  const quests = MISSION_QUESTS.filter((q) => q.category === category);

  const earned = quests.filter((q) => missionQuestState(q) === "earned").length;

  return { earned, total: quests.length };

}

