import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { ISLANDS, type IslandInfo } from "@/lib/island-data";
import { LEADERBOARD, type LeaderboardPeriod } from "@/lib/landing-data";
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
