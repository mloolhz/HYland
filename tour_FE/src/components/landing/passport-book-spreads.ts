import {
  MISSION_CATEGORIES,
  MISSION_QUESTS,
  type MissionCategory,
  type MissionQuest,
} from "@/mocks/missions";
import { PASSPORT_STAMPS_PER_PAGE } from "@/lib/passport/passport-mission-stamps";

/** 카테고리 페이지 — 여러 장으로 나뉘면 (1/3) 표기 */
export type PassportCategoryPage = {
  type: "mission-stamps";
  quests: MissionQuest[];
  category: MissionCategory;
  /** 해당 카테고리 안에서 몇 번째 장인지 (1부터) */
  pageInCategory: number;
  totalPagesInCategory: number;
};

export type PassportBookLeftPage =
  | { type: "profile" }
  | { type: "blank" }
  | PassportCategoryPage;

export type PassportBookRightPage = PassportCategoryPage | { type: "island-story" };

export type PassportBookSpread = {
  index: number;
  left: PassportBookLeftPage;
  right: PassportBookRightPage;
};

/** 카테고리 순서(섬→해상→육상→체험→힐링→기타)대로 페이지 구성 — 카테고리는 새 장에서 시작 */
function buildCategoryPages(allQuests: MissionQuest[]): PassportCategoryPage[] {
  const pages: PassportCategoryPage[] = [];

  for (const category of MISSION_CATEGORIES) {
    const quests = allQuests.filter((q) => q.category === category);
    if (quests.length === 0) continue;

    const totalPagesInCategory = Math.ceil(quests.length / PASSPORT_STAMPS_PER_PAGE);
    for (let i = 0; i < totalPagesInCategory; i += 1) {
      pages.push({
        type: "mission-stamps",
        category,
        quests: quests.slice(i * PASSPORT_STAMPS_PER_PAGE, (i + 1) * PASSPORT_STAMPS_PER_PAGE),
        pageInCategory: i + 1,
        totalPagesInCategory,
      });
    }
  }

  return pages;
}

/** 여권 펼침 — 0: 프로필 + 첫 카테고리, 이후: 카테고리 페이지 2장씩 */
export function buildMissionBookSpreads(allQuests: MissionQuest[] = MISSION_QUESTS): PassportBookSpread[] {
  const pages = buildCategoryPages(allQuests);
  const spreads: PassportBookSpread[] = [];

  // 첫 펼침: 좌측 프로필 + 우측 첫 카테고리 페이지
  spreads.push({
    index: 0,
    left: { type: "profile" },
    right: pages[0] ?? { type: "island-story" },
  });

  // 이후: 남은 페이지를 좌우 2장씩
  for (let i = 1; i < pages.length; i += 2) {
    spreads.push({
      index: spreads.length,
      left: pages[i],
      right: pages[i + 1] ?? { type: "island-story" },
    });
  }

  appendIslandStorySpread(spreads);

  return spreads;
}

/** 마지막 페이지 — 나의 섬 이야기 (우측). 이미 배치됐으면 그대로 둠 */
function appendIslandStorySpread(spreads: PassportBookSpread[]) {
  if (spreads.length === 0) return;
  if (spreads[spreads.length - 1].right.type === "island-story") return;

  spreads.push({
    index: spreads.length,
    left: { type: "blank" },
    right: { type: "island-story" },
  });
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
