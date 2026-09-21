import { isIslandBtiResultCode } from "@/data/island-bti/results";
import { isMemberSession } from "@/lib/member-session";
import type { IslandBtiAxisScores, IslandBtiResultRecord } from "@/types/island-bti";

export const ISLAND_BTI_HISTORY_STORAGE_KEY = "hyland:island-bti:history";

/** @deprecated 비회원은 더 이상 저장하지 않음 — legacy 키 정리용 */
export const ISLAND_BTI_GUEST_HISTORY_STORAGE_KEY = "hyland:island-bti:history:guest";

export const ISLAND_BTI_HISTORY_MAX = 50;

const AXIS_KEYS: (keyof IslandBtiAxisScores)[] = ["A", "B", "W", "L", "C", "I", "P", "F"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") return false;
  const time = Date.parse(value);
  return Number.isFinite(time);
}

function isValidAxisScores(value: unknown): value is IslandBtiAxisScores {
  if (!isRecord(value)) return false;
  return AXIS_KEYS.every((key) => typeof value[key] === "number" && Number.isFinite(value[key] as number));
}

function isValidResultRecord(value: unknown): value is IslandBtiResultRecord {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || value.id.trim() === "") return false;
  if (typeof value.code !== "string" || !isIslandBtiResultCode(value.code)) return false;
  if (!isValidAxisScores(value.scores)) return false;
  if (!isValidIsoDate(value.testedAt)) return false;
  return true;
}

export function parseIslandBtiHistory(raw: unknown): IslandBtiResultRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidResultRecord);
}

export function loadIslandBtiHistory(): IslandBtiResultRecord[] {
  if (typeof window === "undefined") return [];
  // 비회원은 디스크에 저장하지 않음 — 새로고침·탭 재진입 시 초기화
  if (!isMemberSession()) return [];

  try {
    const raw = localStorage.getItem(ISLAND_BTI_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return sortHistoryByTestedAt(parseIslandBtiHistory(parsed));
  } catch {
    return [];
  }
}

export function saveIslandBtiHistory(history: IslandBtiResultRecord[]): boolean {
  if (typeof window === "undefined") return false;
  if (!isMemberSession()) return true;

  try {
    const key = ISLAND_BTI_HISTORY_STORAGE_KEY;
    if (history.length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(history));
    return true;
  } catch (error) {
    console.warn("Failed to save Island BTI history:", error);
    return false;
  }
}

/** 비회원 세션·화면 이탈 시 — 회원 localStorage 기록은 건드리지 않음 */
export function clearGuestIslandBtiHistory(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ISLAND_BTI_GUEST_HISTORY_STORAGE_KEY);
}

export function sortHistoryByTestedAt(history: IslandBtiResultRecord[]): IslandBtiResultRecord[] {
  return [...history].sort(
    (a, b) => Date.parse(a.testedAt) - Date.parse(b.testedAt) || a.id.localeCompare(b.id),
  );
}

export function getLatestIslandBtiResult(
  history: IslandBtiResultRecord[],
): IslandBtiResultRecord | null {
  const sorted = sortHistoryByTestedAt(history);
  return sorted.length > 0 ? sorted[sorted.length - 1] : null;
}

export function trimIslandBtiHistory(history: IslandBtiResultRecord[]): IslandBtiResultRecord[] {
  const sorted = sortHistoryByTestedAt(history);
  if (sorted.length <= ISLAND_BTI_HISTORY_MAX) return sorted;
  return sorted.slice(sorted.length - ISLAND_BTI_HISTORY_MAX);
}

export function createIslandBtiResultId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ibti-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function appendIslandBtiResult(
  history: IslandBtiResultRecord[],
  record: IslandBtiResultRecord,
): IslandBtiResultRecord[] {
  return trimIslandBtiHistory([...history, record]);
}

export function removeLatestIslandBtiResult(
  history: IslandBtiResultRecord[],
): IslandBtiResultRecord[] {
  const sorted = sortHistoryByTestedAt(history);
  if (sorted.length === 0) return [];
  return sorted.slice(0, -1);
}

/** 검사 기록 존재 여부 — 프로모션 등에서 재사용 */
export function hasStoredIslandBtiResult(): boolean {
  return getLatestIslandBtiResult(loadIslandBtiHistory()) !== null;
}
