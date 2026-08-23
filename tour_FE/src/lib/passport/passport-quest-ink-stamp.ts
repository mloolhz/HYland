import {
  getQuestStampVariant,
  getStampLayout,
  getStampTheme,
  STAMP_GRID_SLOTS,
  type StampLayout,
  type StampTheme,
} from "@/lib/passport/stamp-themes";
import type { StampVariant } from "@/components/landing/PassportInkStampArt";
import { MISSION_QUESTS, missionQuestState, type MissionQuest } from "@/mocks/missions";

export type InkStampDisplay = {
  questId: number;
  place: string;
  activity: string;
  variant: StampVariant;
  theme: StampTheme;
  layout: StampLayout;
  earnedAt?: string;
};

const FEATURED_DATES: Record<number, string> = {
  1: "2025.05.10",
  2: "2025.05.18",
  3: "2025.06.01",
  4: "2025.06.05",
  5: "2025.06.08",
  7: "2025.06.10",
  8: "2025.06.22",
  9: "2025.06.14",
  11: "2025.06.02",
  13: "2025.06.18",
  16: "2025.06.25",
  18: "2025.07.01",
  20: "2025.07.25",
};

const FEATURED_PLACES: Record<number, { place: string; activity: string }> = {
  1: { place: "백령도", activity: "탐험 완료" },
  2: { place: "자월도", activity: "하이킹" },
  3: { place: "덕적도", activity: "섬 컬렉터" },
  4: { place: "영흥도", activity: "등대 지기" },
  5: { place: "무의도", activity: "섬 완주" },
  7: { place: "강화도", activity: "레저 입문" },
  8: { place: "무의도", activity: "해양 레저" },
  9: { place: "영종도", activity: "사이클" },
  11: { place: "덕적도", activity: "캠핑" },
  13: { place: "강화 갯벌", activity: "생태 체험" },
  16: { place: "인천 앞바다", activity: "노을 감상" },
  18: { place: "섬BTI", activity: "첫 후기" },
  20: { place: "섬BTI", activity: "참여 완료" },
};

/** 첫 장 — 실제 획득한 배지(earned) 우선, 부족하면 진행 중(doing)으로 채움 */
const FEATURED_SLOTS = 7;

export function getRecentStampQuests(): MissionQuest[] {
  const earned = MISSION_QUESTS.filter((q) => missionQuestState(q) === "earned");
  const doing = MISSION_QUESTS.filter((q) => missionQuestState(q) === "doing");
  return [...earned, ...doing].slice(0, FEATURED_SLOTS);
}

export function getFeaturedMissionQuests(): MissionQuest[] {
  return getRecentStampQuests();
}

export function getRemainingMissionQuests(): MissionQuest[] {
  const shown = new Set(getRecentStampQuests().map((q) => q.id));
  return MISSION_QUESTS.filter((q) => !shown.has(q.id));
}

export function questToInkStampDisplay(quest: MissionQuest): InkStampDisplay {
  const variant = getQuestStampVariant(quest.id, quest.category);
  const featured = FEATURED_PLACES[quest.id];

  return {
    questId: quest.id,
    place: featured?.place ?? quest.title,
    activity: featured?.activity ?? quest.reward.replace(/ 배지$/, ""),
    variant,
    theme: getStampTheme(variant),
    layout: getStampLayout(quest.id),
    earnedAt: FEATURED_DATES[quest.id],
  };
}

export function isInkStampEarned(quest: MissionQuest): boolean {
  return missionQuestState(quest) === "earned";
}

export function isInkStampDoing(quest: MissionQuest): boolean {
  return missionQuestState(quest) === "doing";
}

export { STAMP_GRID_SLOTS };
