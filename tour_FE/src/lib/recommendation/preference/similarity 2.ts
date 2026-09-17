import {
  PREFERENCE_FEATURE_KEYS,
  type PreferenceFeatureKey,
  type PreferenceVector,
} from "@/types/recommendation";

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function magnitude(values: number[]): number {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

/** Cosine similarity → 0~100 점수 */
export function cosineSimilarityScore(
  user: PreferenceVector,
  island: PreferenceVector,
  weights?: Partial<Record<PreferenceFeatureKey, number>>,
): number {
  const userValues: number[] = [];
  const islandValues: number[] = [];
  const featureWeights: number[] = [];

  for (const key of PREFERENCE_FEATURE_KEYS) {
    userValues.push(user[key]);
    islandValues.push(island[key]);
    featureWeights.push(weights?.[key] ?? 1);
  }

  const weightedUser = userValues.map((value, index) => value * featureWeights[index]);
  const weightedIsland = islandValues.map((value, index) => value * featureWeights[index]);

  const denom = magnitude(weightedUser) * magnitude(weightedIsland);
  if (denom === 0) return 0;

  const similarity = dot(weightedUser, weightedIsland) / denom;
  return Math.round(Math.min(1, Math.max(0, similarity)) * 100);
}
