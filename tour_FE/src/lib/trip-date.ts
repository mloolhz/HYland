const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYmd(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function todayStart(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function isValidYmd(value: string | undefined): value is string {
  return Boolean(value && YMD_RE.test(value));
}

/** 시작·종료 포함 일수 */
export function computeTripDurationDays(start: string, end: string): number {
  const startDate = parseYmd(start);
  const endDate = parseYmd(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);
}

export function formatTripDurationLabel(durationDays: number): string {
  if (durationDays <= 1) return "당일치기";
  const nights = durationDays - 1;
  return `${nights}박 ${durationDays}일`;
}

export function formatTripDateRangeLabel(start: string, end: string): string {
  const durationDays = computeTripDurationDays(start, end);
  const startLabel = formatYmd(parseYmd(start)).replace(/-/g, ".");
  if (start === end) {
    return `${startLabel} · ${formatTripDurationLabel(durationDays)}`;
  }
  const endShort = formatYmd(parseYmd(end)).slice(5).replace(/-/g, ".");
  return `${startLabel} – ${endShort} · ${formatTripDurationLabel(durationDays)}`;
}

export function normalizeTripRange(start: string, end: string): { start: string; end: string } {
  if (parseYmd(end).getTime() < parseYmd(start).getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const value = parseYmd(date).getTime();
  return value >= parseYmd(start).getTime() && value <= parseYmd(end).getTime();
}

export const TRIP_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const MAX_TRIP_DURATION_DAYS = 5;

export function clampTripEndDate(start: string, end: string): string {
  const normalized = normalizeTripRange(start, end);
  const duration = computeTripDurationDays(normalized.start, normalized.end);
  if (duration <= MAX_TRIP_DURATION_DAYS) return normalized.end;

  const clamped = new Date(parseYmd(normalized.start));
  clamped.setDate(clamped.getDate() + MAX_TRIP_DURATION_DAYS - 1);
  return formatYmd(clamped);
}
