import {
  EXPLORATION_SCORES,
} from "@/lib/recommendation/config/recommendation-weights";
import type { IslandTravelContext } from "@/lib/recommendation/context/travel-context.mock";
import type { IslandRecommendationFeature, TripIntent } from "@/types/recommendation";

export type ContextScores = {
  weather: number;
  transport: number;
  condition: number;
  exploration: number;
};

function scoreWeather(context: IslandTravelContext): number {
  if (context.weatherAlert === "storm") return 0;
  if (context.weatherAlert === "wind") return 55;
  if (context.waveHeightM > 2) return 45;
  if (context.waveHeightM > 1.5) return 70;
  return 92;
}

function scoreTransport(context: IslandTravelContext): number {
  const minutes = context.transportMinutesFromIncheon;
  const base =
    minutes <= 60 ? 95 : minutes <= 90 ? 85 : minutes <= 120 ? 72 : minutes <= 180 ? 58 : 45;

  return Math.min(100, Math.round(base));
}

function scoreCondition(trip: TripIntent, island: IslandRecommendationFeature): number {
  if (trip.duration === undefined) return 75;

  if (trip.duration >= island.recommendedDuration) return 100;
  return 40;
}

function scoreExploration(visitedIslandIds: Set<string>, islandId: string): number {
  return visitedIslandIds.has(islandId)
    ? EXPLORATION_SCORES.visited
    : EXPLORATION_SCORES.unvisited;
}

export function scoreContextFactors(
  island: IslandRecommendationFeature,
  context: IslandTravelContext,
  trip: TripIntent,
  visitedIslandIds: Set<string>,
): ContextScores {
  return {
    weather: scoreWeather(context),
    transport: scoreTransport(context),
    condition: scoreCondition(trip, island),
    exploration: scoreExploration(visitedIslandIds, island.islandId),
  };
}
