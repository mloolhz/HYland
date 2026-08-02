import { SPORTS_CATEGORIES, SPORTS_DATA, type CategoryKey } from "@/data/sports";

export type CommunityActivityGroup = {
  key: CategoryKey;
  label: string;
  activities: string[];
};

/** 레저스포츠 탭(SPORTS_DATA) 종목명 — 커뮤니티 글쓰기 활동 드롭다운용 */
export const COMMUNITY_ACTIVITY_OPTIONS: CommunityActivityGroup[] = SPORTS_CATEGORIES.map(
  (cat) => ({
    key: cat.key,
    label: cat.label,
    activities: SPORTS_DATA[cat.key].map((sport) => sport.name),
  }),
);
