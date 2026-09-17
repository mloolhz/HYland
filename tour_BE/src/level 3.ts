/**
 * 탐험 레벨 — 방문한 섬 개수로 정해진다.
 *
 * 예전에는 user_profiles.level 에 값을 넣어 주는 곳이 아예 없어서 누구나
 * 영원히 Lv.1 이었다. 이제 인증이 승인돼 섬 방문이 기록되면 레벨이 오른다.
 *
 * 프론트의 "섬 정령 성장"도 같은 사다리를 쓰므로 두 곳의 레벨이 항상 같다.
 * 기준을 바꿀 때는 tour_FE/src/lib/island-spirit-growth.ts 도 같이 고쳐야 한다.
 */

export type LevelTier = {
  level: number;
  title: string;
  /** 이 레벨이 되는 최소 방문 섬 수 */
  min: number;
  /** 다음 레벨에 필요한 방문 섬 수 (최고 레벨이면 null) */
  next: number | null;
};

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: "새싹 탐험가", min: 0, next: 3 },
  { level: 2, title: "섬길 탐험가", min: 3, next: 8 },
  { level: 3, title: "바다 모험가", min: 8, next: 15 },
  { level: 4, title: "섬 정령 마스터", min: 15, next: null },
];

export function levelFromVisits(visitedCount: number): LevelTier {
  // 위(높은 레벨)에서부터 내려오며 처음 충족하는 구간
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i -= 1) {
    if (visitedCount >= LEVEL_TIERS[i].min) return LEVEL_TIERS[i];
  }
  return LEVEL_TIERS[0];
}

/**
 * 화면이 쓰는 모양으로.
 * exp 는 별도 점수가 아니라 "방문한 섬 수 / 다음 레벨까지" 그 자체다.
 * 근거가 화면에 보이지 않는 숫자를 또 만들지 않기 위해서다.
 */
export function levelSnapshot(visitedCount: number) {
  const tier = levelFromVisits(visitedCount);
  return {
    level: tier.level,
    levelTitle: tier.title,
    /** 지금 레벨이 시작되는 방문 섬 수 — 화면이 구간 내 진행률을 낼 때 쓴다 */
    levelMin: tier.min,
    expCurrent: visitedCount,
    expMax: tier.next ?? tier.min,
  };
}
