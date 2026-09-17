/**
 * 추천 Final Score 가중치 — 하드코딩 금지, 여기서만 관리
 *
 * 근거의 성격이 서로 달라 셋으로 나눠 뒀다.
 *  - facilityMatch : 실제 시설 145곳. 구체적이지만 조사 범위가 치우쳐 있다
 *                    (강화도 45곳 vs 연평도 2곳).
 *  - sportsMatch   : 종목-섬 88쌍. 사람이 정리해 섬당 1~9종으로 고르다.
 *                    시설 데이터의 조사 편중을 눌러주는 역할.
 *  - communityMatch: 이용자 후기. 가장 설득력 있는 근거지만 아직 글이 13건뿐이라
 *                    비중을 작게 뒀다. 글이 쌓이면 올릴 값.
 *
 * weather는 아직 mock이고 하드 필터에서도 빠져 있어(IS_MOCK_WEATHER_CONTEXT) 낮다.
 */
export const RECOMMENDATION_WEIGHTS = {
  islandBtiMatch: 0.26,
  currentTripMatch: 0.17,
  facilityMatch: 0.15,
  sportsMatch: 0.17,
  communityMatch: 0.07,
  weather: 0.06,
  transport: 0.06,
  condition: 0.03,
  exploration: 0.03,
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
