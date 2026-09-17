import {
  getCategoryProgress,
  MISSION_QUESTS,
  missionQuestState,
  type MissionCategory,
  type MissionQuest,
} from "@/mocks/missions";

export const PASSPORT_STAMPS_PER_PAGE = 12;

/**
 * 배지 획득 현황.
 *
 * quests 를 넘기면 그 진행도로 계산한다. 화면에서는 실제 DB 진행도가 얹힌
 * 목록(useMissionProgress)을 넘겨야 미션 탭과 숫자가 맞는다. 인자를 생략하면
 * 정적 정의를 쓰는데, 이는 로그인 전 기본값 용도다.
 */
export function getMissionStampStats(quests: MissionQuest[] = MISSION_QUESTS) {
  const earned = quests.filter((q) => missionQuestState(q) === "earned").length;
  const doing = quests.filter((q) => missionQuestState(q) === "doing").length;
  const total = quests.length;
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { earned, doing, total, percent };
}

/** 카테고리별 획득 현황 — 위와 같은 이유로 quests 를 받는다 */
export function getCategoryProgressOf(category: MissionCategory, quests: MissionQuest[]) {
  const list = quests.filter((q) => q.category === category);
  return { earned: list.filter((q) => missionQuestState(q) === "earned").length, total: list.length };
}

export { getCategoryProgress };
