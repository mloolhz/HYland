/** 추천 Final Score 가중치 — 하드코딩 금지, 여기서만 관리 */
export const RECOMMENDATION_WEIGHTS = {
  islandBtiMatch: 0.35,
  currentTripMatch: 0.3,
  weather: 0.15,
  transport: 0.1,
  condition: 0.05,
  exploration: 0.05,
} as const;

/** Exploration bonus (0~100 scale) */
export const EXPLORATION_SCORES = {
  unvisited: 100,
  visited: 30,
} as const;

/** Hard filter thresholds (mock/context layer에서 사용) */
export const RECOMMENDATION_THRESHOLDS = {
  /** 파고(m) — 초과 시 hard exclude (mock) */
  maxWaveHeightM: 2.5,
} as const;

/** 향후 행동 데이터 블렌딩 (MVP: BTI 100%) */
export const PREFERENCE_BLEND_WEIGHTS = {
  islandBti: 1,
  likes: 0,
  visits: 0,
  clicks: 0,
} as const;
