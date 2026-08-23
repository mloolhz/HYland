import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { ISLANDS, type IslandInfo } from "@/lib/island-data";
import { CATEGORY_LEADERBOARD, LEADERBOARD, type LeaderboardPeriod } from "@/lib/landing-data";
import { MISSION_CATEGORIES, MISSION_QUESTS, missionQuestState, type MissionCategory } from "@/mocks/missions";
import { getMissionStampStats } from "@/lib/passport/passport-mission-stamps";
import { DEMO_USER_PASSPORT, type UserPassportStats } from "@/mocks/userPassport";
import { MOCK_POSTS } from "@/mocks/posts";

export type { UserPassportStats };

export type UserProfile = UserPassportStats & {
  id: string;
  nickname: string;
  bti: IslandBti;
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

export function getCurrentUserProfile(): UserProfile {
  const author = MOCK_POSTS.find((p) => p.author.id === CURRENT_USER_ID)?.author;
  const passport = getCurrentUserPassportStats();

  // 미션창과 동기화 — 카운트를 MISSION_QUESTS에서 실시간 산출
  const stampStats = getMissionStampStats(); // { earned, total, ... }
  const visitedIslandCount = MISSION_QUESTS.filter(
    (q) => q.category === "섬" && missionQuestState(q) === "earned",
  ).length;

  return {
    id: CURRENT_USER_ID,
    nickname: author?.nickname ?? "이파도",
    bti: author?.bti ?? "파도형",
    joinedAt: "2024-06-15",
    ...passport,
    visitedIslandCount,
    completedMissions: stampStats.earned, // 완료 미션 = 획득 배지
    earnedBadgeCount: stampStats.earned,
    stamps: { current: stampStats.earned, total: stampStats.total },
  };
}

/** 배지 현황 — 미션창과 동일 출처 (획득 / 미획득 / 전체) */
export function getBadgeStats() {
  const { earned, total } = getMissionStampStats();
  return { earned, total, unearned: Math.max(0, total - earned) };
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
