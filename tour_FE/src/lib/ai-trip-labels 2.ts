import { formatTripDurationLabel } from "@/lib/trip-date";
import type { TripIntent } from "@/types/recommendation";

export const COMPANION_LABELS = {
  solo: "혼자",
  friend: "친구",
  couple: "연인",
  family: "가족",
} as const;

export const MOOD_LABELS = {
  healing: "힐링",
  active: "활동",
  nature: "자연",
  social: "함께",
  adventure: "모험",
} as const;

export function getDurationChipLabel(duration?: number): string {
  return formatTripDurationLabel(duration ?? 1);
}

export function getTripConditionChips(trip: TripIntent): string[] {
  const chips: string[] = [getDurationChipLabel(trip.duration)];

  if (trip.companion) chips.push(COMPANION_LABELS[trip.companion]);
  if (trip.travelMood) chips.push(MOOD_LABELS[trip.travelMood]);
  if (trip.activities?.length) chips.push(...trip.activities);

  return chips;
}

/** 조건 적용 시 채팅에 표시할 자동 메시지 */
export function buildApplyMessage(trip: TripIntent): string {
  const parts: string[] = [getDurationChipLabel(trip.duration)];

  if (trip.companion) parts.push(COMPANION_LABELS[trip.companion]);
  if (trip.travelMood) parts.push(MOOD_LABELS[trip.travelMood]);
  if (trip.activities?.length) parts.push(trip.activities.join("·"));

  return `${parts.join(" · ")} 조건으로 섬 추천해줘`;
}
