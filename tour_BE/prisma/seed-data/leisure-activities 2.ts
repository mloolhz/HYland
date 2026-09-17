/**
 * 레저 활동 종류 (leisure_activity_types)
 *
 * 활동을 늘릴 때는 이 배열에 한 줄 추가하고 `npm run db:seed` 만 돌리면 된다.
 * 마이그레이션은 필요 없다.
 *
 * 추가할 때 같이 맞춰야 하는 곳 — scripts/tour/check-consistency.mjs 가 검사한다.
 *   - scripts/tour/lib/activity.mjs  : ACTIVITY_TAXONOMY, ACTIVITY_ENUM, 판정 규칙
 *   - tour_FE/src/data/sports.ts     : 같은 이름의 종목
 *
 * label 은 수집 데이터의 activity 문자열과 같아야 한다. 프론트 종목명과
 * 표기가 다른 경우(수련단체활동 ↔ 수련·단체 활동)는 대조 시 공백·가운뎃점·
 * 하이픈을 무시하므로 그대로 두면 된다.
 */

export type LeisureActivitySeed = {
  id: string;
  label: string;
  /** sport_categories.id */
  categoryId: string;
};

export const LEISURE_ACTIVITIES: LeisureActivitySeed[] = [
  // 해상 레저
  { id: "YACHT", label: "요트", categoryId: "water" },
  { id: "CRUISE", label: "유람선", categoryId: "water" },
  { id: "PADDLE_BOAT", label: "패들보트", categoryId: "water" },
  { id: "MUDFLAT", label: "갯벌체험", categoryId: "water" },
  { id: "COASTAL_WALK", label: "해안 산책", categoryId: "water" },
  { id: "BEACH", label: "해수욕장", categoryId: "water" },
  // 육상 레저
  { id: "TREKKING", label: "트레킹", categoryId: "land" },
  { id: "CYCLING", label: "자전거", categoryId: "land" },
  { id: "CAMPING", label: "캠핑", categoryId: "land" },
  { id: "BACKPACKING", label: "백패킹", categoryId: "land" },
  // 체험
  { id: "FISHING", label: "낚시", categoryId: "exp" },
  { id: "PULDEUNG", label: "풀등 체험", categoryId: "exp" },
  { id: "NIGHT_GATHERING", label: "해루질", categoryId: "exp" },
  { id: "ZIPLINE", label: "짚라인", categoryId: "exp" },
  { id: "MONORAIL", label: "모노레일", categoryId: "exp" },
  { id: "LUGE", label: "루지", categoryId: "exp" },
  { id: "GOLF", label: "골프", categoryId: "exp" },
  { id: "GROUP_TRAINING", label: "수련단체활동", categoryId: "exp" },
  // 힐링
  { id: "FOREST_BATH", label: "산림욕", categoryId: "heal" },
  { id: "SUNSET", label: "일몰 감상", categoryId: "heal" },
  { id: "SEAL_WATCHING", label: "물범 관찰", categoryId: "heal" },
  { id: "STARGAZING", label: "은하수 체험", categoryId: "heal" },
  { id: "VILLAGE_TOUR", label: "섬마을 투어", categoryId: "heal" },
  { id: "SPA", label: "온천-스파", categoryId: "heal" },
  // 미분류 — 분류기가 판정하지 못한 시설이 들어온다 (검수 대기)
  { id: "ETC", label: "기타", categoryId: "exp" },
];
