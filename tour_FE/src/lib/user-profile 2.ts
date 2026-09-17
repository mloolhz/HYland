/**
 * 로그인한 사용자의 프로필
 *
 * 예전에는 이 파일이 데모 사용자의 여권 수치·리더보드 포인트·방문 섬 목록을
 * 직접 들고 있었다. 지금은 그 값들이 전부 DB 에서 오므로(GET /profile,
 * mission-progress·visited-islands 스토어) 여기 남은 것은 서버 응답을 화면용
 * 모양으로 옮기는 일뿐이다.
 */
import type { IslandBti } from "@/constants/island";
import type { ProfileResponse } from "@/api/me";
import { MISSION_QUESTS } from "@/mocks/missions";

/** 배지 분모는 미션 카탈로그 개수 — 정의는 정적이고 진행도만 DB 에서 온다 */
const BADGE_TOTAL = MISSION_QUESTS.length;

export type UserPassportStats = {
  level: number;
  levelTitle: string;
  /** 지금 레벨이 시작되는 방문 섬 수 */
  levelMin: number;
  expCurrent: number;
  expMax: number;
  visitedIslandCount: number;
  completedMissions: number;
  earnedBadgeCount: number;
  stampCount: number;
  stampTotal: number;
};

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
  levelMin: 0,
  expCurrent: 0,
  expMax: 0,
  visitedIslandCount: 0,
  completedMissions: 0,
  earnedBadgeCount: 0,
  stampCount: 0,
  stampTotal: 0,
  stamps: { current: 0, total: 0 },
};

/** 최고 레벨이면 더 오를 곳이 없다 */
export function isMaxLevel(stats: UserPassportStats): boolean {
  return stats.expMax <= stats.levelMin;
}

/**
 * 다음 레벨까지의 진행률.
 * 전체가 아니라 "지금 구간 안에서" 얼마나 왔는지를 센다 —
 * 방문 3곳(Lv.2 시작)에서 게이지가 38% 로 차 있으면 이상하다.
 */
export function getLevelPercent(stats: UserPassportStats): number {
  if (isMaxLevel(stats)) return 100;
  const span = stats.expMax - stats.levelMin;
  if (span <= 0) return 0;
  const done = stats.expCurrent - stats.levelMin;
  return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
}

/** 서버 프로필 응답을 화면이 쓰는 모양으로 옮긴다. 로그인 전이면 빈 프로필. */
export function mergeUserProfile(live: ProfileResponse | null | undefined): UserProfile {
  if (!live) return GUEST_PROFILE;

  return {
    id: live.userId,
    nickname: live.nickname,
    // 서버는 ISO(2026-09-05T…)로 주는데 화면 포맷터들은 "YYYY-MM-DD" 를 쪼갠다
    joinedAt: live.joinedAt.slice(0, 10),
    /**
     * bti(커뮤니티 4타입)와 섬BTI 코드(16타입)는 서로 다른 분류다.
     * 서버의 profile.bti 는 섬BTI 코드(AWCP 등)이므로 여기에 넣으면 안 된다.
     * (넣었다가 ISLAND_BTI["AWCP"] 가 undefined 라 마이페이지가 죽었다)
     */
    bti: "파도형",
    btiCode: live.bti,
    level: live.level,
    levelTitle: live.levelTitle,
    levelMin: live.levelMin,
    expCurrent: live.expCurrent,
    expMax: live.expMax,
    visitedIslandCount: live.stats.visitedCount,
    completedMissions: live.stats.completedMissions,
    earnedBadgeCount: live.stats.badgeCount,
    stampCount: live.stats.badgeCount,
    stampTotal: BADGE_TOTAL,
    stamps: { current: live.stats.badgeCount, total: BADGE_TOTAL },
  };
}
