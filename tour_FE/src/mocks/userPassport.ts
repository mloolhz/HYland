/** 데모 사용자 여권·탐험 수치 (단일 출처) */
export type UserPassportStats = {
  level: number;
  levelTitle: string;
  expCurrent: number;
  expMax: number;
  visitedIslandCount: number;
  completedMissions: number;
  earnedBadgeCount: number;
  stampCount: number;
  stampTotal: number;
};

export const DEMO_USER_PASSPORT: UserPassportStats = {
  level: 3,
  levelTitle: "탐험가",
  expCurrent: 1350,
  expMax: 2000,
  visitedIslandCount: 3,
  completedMissions: 8,
  earnedBadgeCount: 3,
  stampCount: 3,
  stampTotal: 48,
};
