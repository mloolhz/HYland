import { getIslandProfile, type IslandProfile } from "@/data/island-profiles";
import type { TripIntent } from "@/types/recommendation";

export type IslandProfileMatch = { season: number; audience: number; activities: number; profile?: IslandProfile };

function seasonForDate(date?: string): string | undefined {
  const month = date ? Number(date.slice(5, 7)) : NaN;
  if (!Number.isInteger(month) || month < 1 || month > 12) return undefined;
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

function audienceTypes(trip: TripIntent): string[] {
  const types: string[] = [];
  if (trip.companion === "family") types.push("가족");
  if (trip.companion === "couple" || trip.companion === "friend") types.push("친구·연인");
  if (trip.travelMood === "healing") types.push("휴양");
  return types;
}

function normalise(text: string): string { return text.replace(/[·\s]/g, "").toLowerCase(); }

function activityMatches(requested: string, available: string): boolean {
  const wanted = normalise(requested);
  const candidate = normalise(available);
  return wanted.includes(candidate) || candidate.includes(wanted) ||
    (wanted.includes("갯벌") && candidate.includes("갯벌")) ||
    (wanted.includes("트레킹") && (candidate.includes("걷기") || candidate.includes("등산"))) ||
    (wanted.includes("사이클") && candidate.includes("자전거"));
}

/** TOP3는 계절 → 동행/여행유형 → 활동 일치 순으로 사전식 우선순위를 적용한다. */
export function scoreIslandProfileMatch(islandName: string, trip: TripIntent): IslandProfileMatch {
  const profile = getIslandProfile(islandName);
  if (!profile) return { season: 0, audience: 0, activities: 0 };
  const season = seasonForDate(trip.travelDate);
  const peakMonth = trip.travelDate ? `${Number(trip.travelDate.slice(5, 7))}월` : undefined;
  const seasonMatch = season && profile.season.includes(season) ? (profile.peakMonth === peakMonth ? 2 : 1) : 0;
  const audienceMatch = audienceTypes(trip).some((type) => profile.travelType.includes(type)) ? 1 : 0;
  const activityMatch = (trip.activities ?? []).filter((activity) => profile.activities.some((available) => activityMatches(activity, available))).length;
  return { season: seasonMatch, audience: audienceMatch, activities: activityMatch, profile };
}

export function hasIslandProfileConditions(trip: TripIntent): boolean {
  return Boolean(trip.travelDate || trip.companion || trip.travelMood || trip.activities?.length);
}

export function compareIslandProfileMatch(a: IslandProfileMatch, b: IslandProfileMatch): number {
  return b.season - a.season || b.audience - a.audience || b.activities - a.activities;
}

export function buildIslandProfileReason(match: IslandProfileMatch): string | undefined {
  if (!match.profile) return undefined;
  const activity = match.profile.activities[0];
  if (match.season > 0) return `${match.profile.season.join("·")}철에 인기 있고 ${activity} 활동이 대표적이에요.`;
  if (match.audience > 0 || match.activities > 0) return `${activity} 활동이 대표적인 ${match.profile.travelType.join("·")}형 섬이에요.`;
  return undefined;
}
