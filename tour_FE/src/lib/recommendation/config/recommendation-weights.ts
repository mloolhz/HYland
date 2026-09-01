/**
 * 추천 Final Score 가중치 — 하드코딩 금지, 여기서만 관리
 *
 * facilityMatch는 관광공사 API·웹 조사로 수집한 실제 레저시설 145곳을 근거로 하는
 * 유일한 "검증 가능한" 신호라 비중을 크게 뒀다. 반대로 weather는 아직 mock이고
 * 하드 필터에서도 빠져 있어(IS_MOCK_WEATHER_CONTEXT) 비중을 줄였다.
 */
export const RECOMMENDATION_WEIGHTS = {
  islandBtiMatch: 0.3,
  currentTripMatch: 0.22,
  facilityMatch: 0.25,
  weather: 0.08,
  transport: 0.08,
  condition: 0.04,
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
