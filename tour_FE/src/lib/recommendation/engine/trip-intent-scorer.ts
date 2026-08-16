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

function buildTripIntentVector(trip: TripIntent): PreferenceVector {
  const base: PreferenceVector = {
    activity: 0.5,
    healing: 0.5,
    nature: 0.5,
    challenge: 0.5,
    leisure: 0.5,
    culture: 0.5,
    food: 0.5,
  };

  if (trip.travelMood) {
    const moodWeights = MOOD_TO_FEATURES[trip.travelMood];
    for (const key of PREFERENCE_FEATURE_KEYS) {
      const delta = moodWeights[key] ?? 0;
      base[key] = clamp01(base[key] + delta * 0.35);
    }
  }

  if (trip.intensity) {
    const intensityWeights = INTENSITY_TO_FEATURES[trip.intensity];
    for (const key of PREFERENCE_FEATURE_KEYS) {
      const delta = intensityWeights[key] ?? 0;
      base[key] = clamp01(base[key] + delta * 0.3);
    }
  }

  for (const activity of trip.activities ?? []) {
    const normalized = activity.trim();
    const keywordMatch = Object.entries(ACTIVITY_KEYWORDS).find(([keyword]) =>
      normalized.includes(keyword),
    );
    if (!keywordMatch) continue;
    const [, weights] = keywordMatch;
    for (const key of PREFERENCE_FEATURE_KEYS) {
      const boost = weights[key] ?? 0;
      base[key] = clamp01(base[key] + boost * 0.25);
    }
  }

  return base;
}

function featureMatchScore(
  intent: PreferenceVector,
  island: PreferenceVector,
): number {
  let sum = 0;
  for (const key of PREFERENCE_FEATURE_KEYS) {
    sum += 1 - Math.abs(intent[key] - island[key]);
  }
  return Math.round((sum / PREFERENCE_FEATURE_KEYS.length) * 100);
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
  const intentVector = buildTripIntentVector(trip);
  const featurePart = featureMatchScore(intentVector, island.vector);
  const companionPart = companionScore(trip.companion, island);
  const durationPart = durationScore(trip.duration, island);

  return Math.round(featurePart * 0.65 + companionPart * 0.2 + durationPart * 0.15);
}

export function buildTripIntentVectorForDebug(trip: TripIntent): PreferenceVector {
  return buildTripIntentVector(trip);
}
