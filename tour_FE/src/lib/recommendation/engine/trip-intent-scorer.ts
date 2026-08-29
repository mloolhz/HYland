import {
  PREFERENCE_FEATURE_KEYS,
  type CompanionFeatureKey,
  type IslandRecommendationFeature,
  type PreferenceFeatureKey,
  type PreferenceVector,
  type TripIntent,
} from "@/types/recommendation";

const MOOD_TO_FEATURES: Record<
  NonNullable<TripIntent["travelMood"]>,
  Partial<Record<PreferenceFeatureKey, number>>
> = {
  healing: { healing: 1, activity: -0.3 },
  active: { activity: 1, leisure: 0.5, challenge: 0.4 },
  nature: { nature: 1, healing: 0.3 },
  social: { leisure: 0.6, culture: 0.4, activity: 0.3 },
  adventure: { challenge: 1, activity: 0.7, nature: 0.4 },
};

const INTENSITY_TO_FEATURES: Record<
  NonNullable<TripIntent["intensity"]>,
  Partial<Record<PreferenceFeatureKey, number>>
> = {
  relaxed: { healing: 0.8, activity: -0.4 },
  moderate: { activity: 0.3, nature: 0.3 },
  active: { activity: 0.9, challenge: 0.6, leisure: 0.5 },
};

const ACTIVITY_KEYWORDS: Record<string, Partial<Record<PreferenceFeatureKey, number>>> = {
  바다: { leisure: 0.8, nature: 0.5 },
  산책: { healing: 0.6, nature: 0.5 },
  카페: { healing: 0.5, culture: 0.3 },
  트레킹: { activity: 0.7, challenge: 0.6, nature: 0.5 },
  낚시: { leisure: 0.5, healing: 0.4 },
  카약: { leisure: 0.8, activity: 0.6 },
  SUP: { leisure: 0.85, activity: 0.7 },
  사이클: { activity: 0.7, nature: 0.4 },
  캠핑: { nature: 0.6, healing: 0.5 },
  갯벌: { culture: 0.3, leisure: 0.4, nature: 0.4 },
  문화: { culture: 0.9 },
  맛집: { food: 0.9 },
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * 사용자가 실제로 표현한 축에 얼마나 무게를 둘지(salience).
 * 예전에는 7축을 단순 평균해서, 고르지도 않은 축(음식·문화 등)이 점수를 희석시켰다.
 * 그 탓에 어떤 섬을 넣어도 77~87점에 몰려 순위가 사실상 무의미했다.
 */
type TripIntentProfile = {
  vector: PreferenceVector;
  /** 축별 관심도 — 표현하지 않은 축은 0에 가깝다 */
  salience: PreferenceVector;
};

/** 아무 축도 고르지 않았을 때도 완전히 0이 되지 않도록 하는 하한 */
const SALIENCE_FLOOR = 0.15;

function buildTripIntentProfile(trip: TripIntent): TripIntentProfile {
  const vector: PreferenceVector = {
    activity: 0.5,
    healing: 0.5,
    nature: 0.5,
    challenge: 0.5,
    leisure: 0.5,
    culture: 0.5,
    food: 0.5,
  };
  const salience: PreferenceVector = {
    activity: 0,
    healing: 0,
    nature: 0,
    challenge: 0,
    leisure: 0,
    culture: 0,
    food: 0,
  };

  // 이전보다 계수를 키워 의도 벡터가 실제로 0/1 쪽으로 벌어지게 한다.
  const apply = (
    weights: Partial<Record<PreferenceFeatureKey, number>>,
    scale: number,
  ) => {
    for (const key of PREFERENCE_FEATURE_KEYS) {
      const delta = weights[key] ?? 0;
      if (delta === 0) continue;
      vector[key] = clamp01(vector[key] + delta * scale);
      salience[key] += Math.abs(delta);
    }
  };

  if (trip.travelMood) apply(MOOD_TO_FEATURES[trip.travelMood], 0.5);
  if (trip.intensity) apply(INTENSITY_TO_FEATURES[trip.intensity], 0.4);

  for (const activity of trip.activities ?? []) {
    const normalized = activity.trim();
    const keywordMatch = Object.entries(ACTIVITY_KEYWORDS).find(([keyword]) =>
      normalized.includes(keyword),
    );
    if (!keywordMatch) continue;
    apply(keywordMatch[1], 0.35);
  }

  return { vector, salience };
}

/**
 * 표현한 축을 무겁게 보는 가중 일치도.
 * 관심 없는 축의 차이는 하한(SALIENCE_FLOOR)만큼만 반영된다.
 */
function featureMatchScore(profile: TripIntentProfile, island: PreferenceVector): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const key of PREFERENCE_FEATURE_KEYS) {
    const weight = SALIENCE_FLOOR + profile.salience[key];
    weightedSum += weight * (1 - Math.abs(profile.vector[key] - island[key]));
    weightTotal += weight;
  }

  if (weightTotal === 0) return 50;
  return Math.round((weightedSum / weightTotal) * 100);
}

function companionScore(
  companion: CompanionFeatureKey | undefined,
  island: IslandRecommendationFeature,
): number {
  if (!companion) return 70;
  return Math.round(island.companion[companion] * 100);
}

function durationScore(duration: number | undefined, island: IslandRecommendationFeature): number {
  if (!duration) return 75;
  const diff = Math.abs(island.recommendedDuration - duration);
  if (diff === 0) return 100;
  if (diff === 1) return 75;
  return 40;
}

/** 이번 여행 의도 vs 섬 Feature — 0~100 */
export function scoreCurrentTripMatch(
  trip: TripIntent,
  island: IslandRecommendationFeature,
): number {
  const profile = buildTripIntentProfile(trip);
  const featurePart = featureMatchScore(profile, island.vector);
  const companionPart = companionScore(trip.companion, island);
  const durationPart = durationScore(trip.duration, island);

  return Math.round(featurePart * 0.65 + companionPart * 0.2 + durationPart * 0.15);
}

export function buildTripIntentVectorForDebug(trip: TripIntent): PreferenceVector {
  return buildTripIntentProfile(trip).vector;
}
