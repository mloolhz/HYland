import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { ISLANDS, type IslandInfo } from "@/lib/island-data";
import { CATEGORY_LEADERBOARD, LEADERBOARD, type LeaderboardPeriod } from "@/lib/landing-data";
import type { MissionCategory } from "@/mocks/missions";
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

  return {
    id: CURRENT_USER_ID,
    nickname: author?.nickname ?? "이파도",
    bti: author?.bti ?? "파도형",
    joinedAt: "2024-06-15",
    ...passport,
    stamps: { current: passport.stampCount, total: passport.stampTotal },
  };
}

export function getVisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => i.visited);
}

export function getUnvisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => !i.visited);
}

export function getIslandVisitStats() {
  const passport = getCurrentUserPassportStats();
  const total = ISLANDS.length;

  return {
    visited: passport.visitedIslandCount,
    total,
    percent: Math.round((passport.visitedIslandCount / total) * 100),
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
  탐험: 1520,
  레저: 980,
  생태: 1780,
  기타: 1610,
};

export function getCategoryLeaderboardRank(category: MissionCategory) {
  const points = MY_CATEGORY_POINTS[category];
  const board = CATEGORY_LEADERBOARD[category];
  const rank = board.filter(([, score]) => score > points).length + 1;

  return { rank, points, category, boardSize: board.length };
}
