import {
  getQuestStampVariant,
  getStampLayout,
  getStampTheme,
  STAMP_GRID_SLOTS,
  type StampLayout,
  type StampTheme,
} from "@/lib/passport/stamp-themes";
import type { StampVariant } from "@/components/landing/PassportInkStampArt";
import { missionQuestState, type MissionQuest } from "@/mocks/missions";

export type InkStampDisplay = {
  questId: number;
  place: string;
  activity: string;
  variant: StampVariant;
  theme: StampTheme;
  layout: StampLayout;
  earnedAt?: string;
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

export function questToInkStampDisplay(
  quest: MissionQuest,
  /** 실제 획득 시각 (ISO). 예전에는 날짜가 하드코딩돼 있었다. */
  earnedAt?: string | null,
): InkStampDisplay {
  const variant = getQuestStampVariant(quest.id, quest.category);
  const featured = FEATURED_PLACES[quest.id];

  return {
    questId: quest.id,
    place: featured?.place ?? quest.title,
    activity: featured?.activity ?? quest.reward.replace(/ 배지$/, ""),
    variant,
    theme: getStampTheme(variant),
    layout: getStampLayout(quest.id),
    earnedAt: earnedAt ? formatStampDate(earnedAt) : undefined,
  };
}

/** ISO → "2026.09.05" */
function formatStampDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function isInkStampEarned(quest: MissionQuest): boolean {
  return missionQuestState(quest) === "earned";
}

export function isInkStampDoing(quest: MissionQuest): boolean {
  return missionQuestState(quest) === "doing";
}

export { STAMP_GRID_SLOTS };
