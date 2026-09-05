import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { ISLANDS, type IslandInfo } from "@/lib/island-data";
import { CATEGORY_LEADERBOARD, LEADERBOARD, type LeaderboardPeriod } from "@/lib/landing-data";
import { MISSION_CATEGORIES, MISSION_QUESTS, missionQuestState, type MissionCategory } from "@/mocks/missions";
import { getMissionStampStats } from "@/lib/passport/passport-mission-stamps";
import { DEMO_USER_PASSPORT, type UserPassportStats } from "@/mocks/userPassport";
import type { ProfileResponse } from "@/api/me";

export type { UserPassportStats };

export type UserProfile = UserPassportStats & {
  id: string;
  nickname: string;
  /** 커뮤니티 표시용 4타입 (파도형/등대형/갯벌형/해류형) */
  bti: IslandBti;
  /** 섬BTI 검사 결과 코드 (AWCP 등 16타입). 아직 검사 전이면 null */
  btiCode?: string | null;
  joinedAt: string;
  stamps: { current: number; total: number };
};

/** Demo user points — not listed on the public leaderboard board */
export const MY_LEADERBOARD_POINTS: Record<LeaderboardPeriod, number> = {
  week: 1050,
  month: 6120,
  all: 58200,
};

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  week: "이번 주",
  month: "이번 달",
  all: "전체",
};

/** 추후 GET /api/users/me/passport 등으로 교체 */
export function getCurrentUserPassportStats(): UserPassportStats {
  return DEMO_USER_PASSPORT;
}

export async function fetchCurrentUserPassportStats(): Promise<UserPassportStats> {
  // TODO: const res = await fetch("/api/users/me/passport");
  return getCurrentUserPassportStats();
}

export function getPassportExpPercent(stats = getCurrentUserPassportStats()): number {
  return Math.round((stats.expCurrent / stats.expMax) * 100);
}

/**
 * mergeUserProfile 의 바탕값.
 *
 * 닉네임·레벨·활동 수치는 로그인하면 서버 값이 전부 덮어쓴다. 여기 남은 것은
 * 아직 API 가 없는 항목(BTI 유형·가입일)과 미션 카탈로그에서 뽑는 분모뿐이다.
 * 예전에는 mock 게시글에서 작성자를 찾아 닉네임을 채웠는데, 그 글들이 사라진
 * 지금은 의미가 없어 걷어냈다.
 */
export function getCurrentUserProfile(): UserProfile {
  const passport = getCurrentUserPassportStats();

  // 미션창과 동기화 — 카운트를 MISSION_QUESTS에서 실시간 산출
  const stampStats = getMissionStampStats(); // { earned, total, ... }
  const visitedIslandCount = MISSION_QUESTS.filter(
    (q) => q.category === "섬" && missionQuestState(q) === "earned",
  ).length;

  return {
    id: CURRENT_USER_ID,
    nickname: "",
    bti: "파도형",
    joinedAt: "2024-06-15",
    ...passport,
    visitedIslandCount,
    completedMissions: stampStats.earned, // 완료 미션 = 획득 배지
    earnedBadgeCount: stampStats.earned,
    stamps: { current: stampStats.earned, total: stampStats.total },
  };
}

/** 배지 현황 — 미션창과 동일 출처 (획득 / 미획득 / 전체 + 섬 방문) */
/**
 * 로그인한 사용자의 실제 프로필을 mock 위에 덮어쓴다.
 *
 * 닉네임·레벨·경험치·활동 수치는 DB 값이 우선이고, 아직 API 가 없는 항목
 * (BTI 유형, 가입일 등)은 mock 값을 그대로 쓴다. 로그인 전이면 mock 그대로다.
 * 컴포넌트에서는 hooks/useUserProfile 로 쓴다.
 */
/**
 * 비로그인 방문자에게 보여줄 빈 프로필.
 *
 * 예전에는 mock(이파도 · Lv.3 · 방문 6)으로 폴백했는데, 이파도가 실제 가입
 * 계정이 되면서 로그인도 안 한 사람에게 남의 이름과 통계가 보였다.
 */
export const GUEST_PROFILE: UserProfile = {
  id: "",
  nickname: "게스트",
  bti: "파도형",
  joinedAt: "",
  level: 1,
  levelTitle: "여행 준비 중",
  expCurrent: 0,
  expMax: 1000,
  visitedIslandCount: 0,
  completedMissions: 0,
  earnedBadgeCount: 0,
  stampCount: 0,
  stampTotal: 0,
  stamps: { current: 0, total: 0 },
};

export function mergeUserProfile(live: ProfileResponse | null | undefined): UserProfile {
  // 로그인 전에는 남의 mock 대신 빈 프로필을 준다
  if (!live) return GUEST_PROFILE;
  const base = getCurrentUserProfile();

  return {
    ...base,
    id: live.userId,
    nickname: live.nickname,
    /**
     * bti(커뮤니티 4타입)와 섬BTI 코드(16타입)는 서로 다른 분류다.
     * 서버의 profile.bti 는 섬BTI 코드(AWCP 등)이므로 여기에 넣으면 안 된다.
     * (넣었다가 ISLAND_BTI["AWCP"] 가 undefined 라 마이페이지가 죽었다)
     */
    bti: base.bti,
    btiCode: live.bti,
    level: live.level,
    levelTitle: live.levelTitle,
    expCurrent: live.expCurrent,
    expMax: live.expMax,
    visitedIslandCount: live.stats.visitedCount,
    completedMissions: live.stats.completedMissions,
    earnedBadgeCount: live.stats.badgeCount,
    stampCount: live.stats.badgeCount,
  };
}

export function getBadgeStats() {
  const { earned, total } = getMissionStampStats();
  const visited = MISSION_QUESTS.filter(
    (q) => q.category === "섬" && missionQuestState(q) === "earned",
  ).length;
  return {
    earned,
    total,
    unearned: Math.max(0, total - earned),
    visited,
    islandTotal: ISLANDS.length,
  };
}

export function getVisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => i.visited);
}

export function getUnvisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => !i.visited);
}

export function getIslandVisitStats() {
  // 미션창과 동일 출처 — 섬 방문 미션 획득 수
  const visited = getCurrentUserProfile().visitedIslandCount;
  const total = ISLANDS.length;

  return {
    visited,
    total,
    percent: total > 0 ? Math.round((visited / total) * 100) : 0,
  };
}

export function getLeaderboardRank(period: LeaderboardPeriod = "month") {
  const points = MY_LEADERBOARD_POINTS[period];
  const board = LEADERBOARD[period];
  const rank = board.filter(([, score]) => score > points).length + 1;

  return {
    rank,
    points,
    period,
    periodLabel: PERIOD_LABEL[period],
    boardSize: board.length,
  };
}

/** 데모 사용자의 카테고리별 미션 포인트 — 공개 리더보드에는 미포함 */
export const MY_CATEGORY_POINTS: Record<MissionCategory, number> = {
  섬: 1520,
  해상: 980,
  육상: 1240,
  체험: 1780,
  힐링: 1410,
  기타: 1610,
};

export function getCategoryLeaderboardRank(category: MissionCategory) {
  const points = MY_CATEGORY_POINTS[category];
  const board = CATEGORY_LEADERBOARD[category];
  const above = board.filter(([, score]) => score > points);
  const below = board.filter(([, score]) => score < points);
  const rank = above.length + 1;

  // 바로 위 순위(다음 목표)와 바로 아래 순위
  const next = above.length > 0 ? above[above.length - 1] : null;
  const prevScore = below.length > 0 ? below[0][1] : Math.round(points * 0.85);

  const nextName = next ? next[0] : null;
  const nextPoints = next ? next[1] : null;
  const pointsToNext = next ? next[1] - points : 0;

  // 아래 순위 대비 다음 순위까지의 진행률
  const span = nextPoints !== null ? nextPoints - prevScore : 1;
  const progressPercent =
    nextPoints === null ? 100 : Math.max(4, Math.min(100, Math.round(((points - prevScore) / span) * 100)));

  return {
    rank,
    points,
    category,
    boardSize: board.length,
    nextName,
    nextPoints,
    pointsToNext,
    progressPercent,
  };
}

/** 카테고리 전체의 내 순위 요약 */
export function getAllCategoryRanks() {
  return MISSION_CATEGORIES.map((category) => getCategoryLeaderboardRank(category));
}
