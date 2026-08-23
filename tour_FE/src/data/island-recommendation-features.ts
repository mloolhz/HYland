import { ISLANDS } from "@/lib/island-data";
import type { IslandRecommendationFeature } from "@/types/recommendation";

/**
 * 섬별 추천 Feature 시드 — 관광·레저 intro/leisureCourses 기반 초기값.
 * UserPreference와 동일 7차원 + companion/difficulty/budget/duration.
 */
const ISLAND_FEATURE_SEED: Record<
  string,
  Omit<IslandRecommendationFeature, "islandId" | "name">
> = {
  baek: {
    vector: { activity: 0.75, healing: 0.45, nature: 0.92, challenge: 0.78, leisure: 0.65, culture: 0.35, food: 0.4 },
    companion: { solo: 0.7, couple: 0.55, friend: 0.75, family: 0.45 },
    difficulty: 0.75,
    averageBudget: 95000,
    recommendedDuration: 2,
    activities: ["트레킹", "사이클", "등대", "해안"],
  },
  daech: {
    vector: { activity: 0.45, healing: 0.75, nature: 0.8, challenge: 0.4, leisure: 0.5, culture: 0.35, food: 0.45 },
    companion: { solo: 0.75, couple: 0.7, friend: 0.55, family: 0.5 },
    difficulty: 0.35,
    averageBudget: 55000,
    recommendedDuration: 1,
    activities: ["산책", "낚시", "일몰"],
  },
  yeonp: {
    vector: { activity: 0.7, healing: 0.5, nature: 0.88, challenge: 0.65, leisure: 0.75, culture: 0.3, food: 0.35 },
    companion: { solo: 0.65, couple: 0.6, friend: 0.8, family: 0.45 },
    difficulty: 0.6,
    averageBudget: 75000,
    recommendedDuration: 1,
    activities: ["둘레길", "스노클링", "드라이브"],
  },
  gangh: {
    vector: { activity: 0.65, healing: 0.55, nature: 0.7, challenge: 0.5, leisure: 0.7, culture: 0.75, food: 0.65 },
    companion: { solo: 0.55, couple: 0.65, friend: 0.7, family: 0.85 },
    difficulty: 0.45,
    averageBudget: 65000,
    recommendedDuration: 1,
    activities: ["사이클", "갯벌", "문화", "사찰"],
  },
  gyo: {
    vector: { activity: 0.35, healing: 0.85, nature: 0.65, challenge: 0.25, leisure: 0.45, culture: 0.5, food: 0.55 },
    companion: { solo: 0.7, couple: 0.75, friend: 0.5, family: 0.6 },
    difficulty: 0.25,
    averageBudget: 45000,
    recommendedDuration: 1,
    activities: ["마을 산책", "낚시", "일출"],
  },
  seok: {
    vector: { activity: 0.7, healing: 0.55, nature: 0.82, challenge: 0.6, leisure: 0.75, culture: 0.35, food: 0.4 },
    companion: { solo: 0.65, couple: 0.7, friend: 0.75, family: 0.55 },
    difficulty: 0.55,
    averageBudget: 60000,
    recommendedDuration: 1,
    activities: ["등대", "트레킹", "카약"],
  },
  jang: {
    vector: { activity: 0.45, healing: 0.6, nature: 0.65, challenge: 0.3, leisure: 0.55, culture: 0.3, food: 0.4 },
    companion: { solo: 0.4, couple: 0.55, friend: 0.6, family: 0.9 },
    difficulty: 0.3,
    averageBudget: 50000,
    recommendedDuration: 1,
    activities: ["갯벌", "피크닉", "조개"],
  },
  sinsi: {
    vector: { activity: 0.75, healing: 0.5, nature: 0.75, challenge: 0.55, leisure: 0.8, culture: 0.45, food: 0.5 },
    companion: { solo: 0.55, couple: 0.65, friend: 0.85, family: 0.75 },
    difficulty: 0.45,
    averageBudget: 60000,
    recommendedDuration: 1,
    activities: ["사이클", "산책", "마을"],
  },
  yeongj: {
    vector: { activity: 0.65, healing: 0.55, nature: 0.6, challenge: 0.4, leisure: 0.75, culture: 0.4, food: 0.55 },
    companion: { solo: 0.5, couple: 0.7, friend: 0.75, family: 0.8 },
    difficulty: 0.35,
    averageBudget: 55000,
    recommendedDuration: 1,
    activities: ["해수욕장", "사이클", "노을"],
  },
  muui: {
    vector: { activity: 0.85, healing: 0.45, nature: 0.75, challenge: 0.6, leisure: 0.92, culture: 0.3, food: 0.45 },
    companion: { solo: 0.55, couple: 0.75, friend: 0.85, family: 0.8 },
    difficulty: 0.5,
    averageBudget: 70000,
    recommendedDuration: 1,
    activities: ["카약", "SUP", "러닝", "해수욕장"],
  },
  yheung: {
    vector: { activity: 0.6, healing: 0.65, nature: 0.7, challenge: 0.45, leisure: 0.7, culture: 0.35, food: 0.5 },
    companion: { solo: 0.55, couple: 0.75, friend: 0.7, family: 0.65 },
    difficulty: 0.45,
    averageBudget: 65000,
    recommendedDuration: 1,
    activities: ["드라이브", "낚시", "캠핑"],
  },
  jawol: {
    vector: { activity: 0.45, healing: 0.8, nature: 0.78, challenge: 0.35, leisure: 0.55, culture: 0.35, food: 0.45 },
    companion: { solo: 0.75, couple: 0.7, friend: 0.55, family: 0.5 },
    difficulty: 0.35,
    averageBudget: 55000,
    recommendedDuration: 1,
    activities: ["낚시", "산책", "일몰"],
  },
  seungb: {
    vector: { activity: 0.55, healing: 0.75, nature: 0.72, challenge: 0.4, leisure: 0.6, culture: 0.3, food: 0.4 },
    companion: { solo: 0.5, couple: 0.8, friend: 0.75, family: 0.55 },
    difficulty: 0.4,
    averageBudget: 60000,
    recommendedDuration: 1,
    activities: ["캠핑", "일몰", "트레킹"],
  },
  ijak: {
    vector: { activity: 0.7, healing: 0.55, nature: 0.85, challenge: 0.65, leisure: 0.6, culture: 0.35, food: 0.4 },
    companion: { solo: 0.7, couple: 0.65, friend: 0.75, family: 0.5 },
    difficulty: 0.6,
    averageBudget: 70000,
    recommendedDuration: 1,
    activities: ["하이킹", "전망대", "모래섬"],
  },
  deokj: {
    vector: { activity: 0.88, healing: 0.4, nature: 0.82, challenge: 0.72, leisure: 0.9, culture: 0.35, food: 0.5 },
    companion: { solo: 0.6, couple: 0.65, friend: 0.9, family: 0.65 },
    difficulty: 0.65,
    averageBudget: 75000,
    recommendedDuration: 1,
    activities: ["SUP", "카약", "트레킹", "바다"],
  },
  soya: {
    vector: { activity: 0.35, healing: 0.85, nature: 0.7, challenge: 0.25, leisure: 0.45, culture: 0.35, food: 0.45 },
    companion: { solo: 0.8, couple: 0.75, friend: 0.45, family: 0.5 },
    difficulty: 0.2,
    averageBudget: 40000,
    recommendedDuration: 1,
    activities: ["낚시", "해변", "사진"],
  },
  mungap: {
    vector: { activity: 0.3, healing: 0.9, nature: 0.68, challenge: 0.2, leisure: 0.4, culture: 0.3, food: 0.4 },
    companion: { solo: 0.85, couple: 0.8, friend: 0.4, family: 0.45 },
    difficulty: 0.15,
    averageBudget: 35000,
    recommendedDuration: 1,
    activities: ["산책", "낚시", "휴식"],
  },
  gureop: {
    vector: { activity: 0.35, healing: 0.8, nature: 0.72, challenge: 0.25, leisure: 0.42, culture: 0.45, food: 0.5 },
    companion: { solo: 0.7, couple: 0.7, friend: 0.5, family: 0.55 },
    difficulty: 0.2,
    averageBudget: 38000,
    recommendedDuration: 1,
    activities: ["마을", "낚시", "일출"],
  },
};

export const ISLAND_RECOMMENDATION_FEATURES: IslandRecommendationFeature[] = ISLANDS.map((island) => {
  const seed = ISLAND_FEATURE_SEED[island.id];
  if (!seed) {
    throw new Error(`Missing recommendation feature seed for island: ${island.id}`);
  }
  return {
    islandId: island.id,
    name: island.name,
    ...seed,
  };
});

export const ISLAND_FEATURE_MAP: Record<string, IslandRecommendationFeature> = Object.fromEntries(
  ISLAND_RECOMMENDATION_FEATURES.map((feature) => [feature.islandId, feature]),
);

export function getIslandRecommendationFeature(islandId: string): IslandRecommendationFeature | undefined {
  return ISLAND_FEATURE_MAP[islandId];
}
