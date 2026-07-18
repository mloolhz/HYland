import { CURRENT_USER_ID } from "@/constants/auth";
import type { IslandBti } from "@/constants/island";
import { getIslandStats, ISLANDS, type IslandInfo } from "@/lib/island-data";
import { LEADERBOARD, type LeaderboardPeriod } from "@/lib/landing-data";
import { MISSION_BADGES } from "@/mocks/missions";
import { MOCK_POSTS } from "@/mocks/posts";

export type UserProfile = {
  id: string;
  nickname: string;
  bti: IslandBti;
  level: number;
  levelTitle: string;
  expCurrent: number;
  expMax: number;
  completedMissions: number;
  earnedBadgeCount: number;
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

export function getCurrentUserProfile(): UserProfile {
  const author = MOCK_POSTS.find((p) => p.author.id === CURRENT_USER_ID)?.author;
  const earnedBadgeCount = MISSION_BADGES.filter((b) => b.state === "earned").length;

  return {
    id: CURRENT_USER_ID,
    nickname: author?.nickname ?? "이파도",
    bti: author?.bti ?? "파도형",
    level: 3,
    levelTitle: "탐험가",
    expCurrent: 1350,
    expMax: 2000,
    completedMissions: 28,
    earnedBadgeCount,
    stamps: { current: 12, total: 48 },
  };
}

export function getVisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => i.visited);
}

export function getUnvisitedIslands(): IslandInfo[] {
  return ISLANDS.filter((i) => !i.visited);
}

export function getIslandVisitStats() {
  return getIslandStats();
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
