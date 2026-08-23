import {
  getCategoryProgress,
  MISSION_QUESTS,
  missionQuestState,
} from "@/mocks/missions";

export const PASSPORT_STAMPS_PER_PAGE = 12;

export function getMissionStampStats() {
  const earned = MISSION_QUESTS.filter((q) => missionQuestState(q) === "earned").length;
  const doing = MISSION_QUESTS.filter((q) => missionQuestState(q) === "doing").length;
  const total = MISSION_QUESTS.length;
  const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
  return { earned, doing, total, percent };
}

export { getCategoryProgress };
