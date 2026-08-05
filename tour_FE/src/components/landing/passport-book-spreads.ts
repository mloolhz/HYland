import type { MissionQuest } from "@/mocks/missions";
import {
  getFeaturedMissionQuests,
  getRemainingMissionQuests,
} from "@/lib/passport/passport-quest-ink-stamp";
import { PASSPORT_STAMPS_PER_PAGE } from "@/lib/passport/passport-mission-stamps";

export type PassportBookSpread = {
  index: number;
  left: { type: "profile" } | { type: "mission-stamps"; quests: MissionQuest[] };
  right: {
    type: "mission-stamps";
    quests: MissionQuest[];
    showCategorySummary?: boolean;
  };
};

/** 여권 펼침 — 0: 프로필+대표배지, 이후: 미션 배지 페이지 */
export function buildMissionBookSpreads(): PassportBookSpread[] {
  const featured = getFeaturedMissionQuests();
  const spreads: PassportBookSpread[] = [
    {
      index: 0,
      left: { type: "profile" },
      right: {
        type: "mission-stamps",
        quests: featured,
      },
    },
  ];

  const remaining = getRemainingMissionQuests();
  let cursor = 0;
  let spreadIndex = 1;

  while (cursor < remaining.length) {
    const leftQuests = remaining.slice(cursor, cursor + PASSPORT_STAMPS_PER_PAGE);
    const rightQuests = remaining.slice(
      cursor + PASSPORT_STAMPS_PER_PAGE,
      cursor + PASSPORT_STAMPS_PER_PAGE * 2,
    );
    if (leftQuests.length === 0 && rightQuests.length === 0) break;

    spreads.push({
      index: spreadIndex,
      left: { type: "mission-stamps", quests: leftQuests },
      right: { type: "mission-stamps", quests: rightQuests },
    });
    cursor += PASSPORT_STAMPS_PER_PAGE * 2;
    spreadIndex += 1;
  }

  return spreads;
}

export type BookNavState = {
  spread: number;
  totalSpreads: number;
  canPrev: boolean;
  canNext: boolean;
  flipping: boolean;
};

/** @deprecated legacy passport badge spreads */
export { BADGES_PER_SIDE, buildBookSpreads } from "./passport-book-spreads-legacy";
