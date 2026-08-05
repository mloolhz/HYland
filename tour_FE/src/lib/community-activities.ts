import { SPORTS_CATEGORIES, SPORTS_DATA, type CategoryKey } from "@/data/sports";
import { serializeActivitiesQuery } from "@/lib/query";

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

/** 종목명으로 필터된 커뮤니티 목록 경로 (`/community?activities=...`) */
export function buildCommunityActivityLink(activityName: string): string {
  const serialized = serializeActivitiesQuery(new Set([activityName]));
  return serialized ? `/community?activities=${serialized}` : "/community";
}
