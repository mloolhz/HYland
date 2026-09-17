import { hasStoredIslandBtiResult } from "@/lib/island-bti-storage";

export const ISLAND_BTI_PROMO_HIDDEN_UNTIL_KEY = "island-bti-promo-hidden-until";
export const ISLAND_BTI_PROMO_SESSION_DISMISSED_KEY = "island-bti-promo-session-dismissed";

const HIDE_MS = 24 * 60 * 60 * 1000;

export function dismissIslandBtiPromoSession(): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(ISLAND_BTI_PROMO_SESSION_DISMISSED_KEY, "1");
  } catch (error) {
    console.warn("Failed to save Island BTI promo session dismiss:", error);
  }
}

export function isIslandBtiPromoSessionDismissed(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(ISLAND_BTI_PROMO_SESSION_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function getIslandBtiPromoHiddenUntil(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ISLAND_BTI_PROMO_HIDDEN_UNTIL_KEY);
    if (!raw) return null;
    const timestamp = Number(raw);
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch {
    return null;
  }
}

export function isIslandBtiPromoHiddenForToday(): boolean {
  const hiddenUntil = getIslandBtiPromoHiddenUntil();
  if (hiddenUntil === null) return false;

  if (Date.now() >= hiddenUntil) {
    clearIslandBtiPromoHiddenUntil();
    return false;
  }

  return true;
}

export function hideIslandBtiPromoFor24Hours(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      ISLAND_BTI_PROMO_HIDDEN_UNTIL_KEY,
      String(Date.now() + HIDE_MS),
    );
  } catch (error) {
    console.warn("Failed to save Island BTI promo hide preference:", error);
  }
}

function clearIslandBtiPromoHiddenUntil(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(ISLAND_BTI_PROMO_HIDDEN_UNTIL_KEY);
  } catch {
    // ignore
  }
}

export function hasIslandBtiResult(): boolean {
  return hasStoredIslandBtiResult();
}

export type IslandBtiPromoBlockReason =
  | "has-result"
  | "hidden-until"
  | "session-dismissed"
  | null;

export function getIslandBtiPromoBlockReason(): IslandBtiPromoBlockReason {
  if (typeof window === "undefined") return "session-dismissed";
  if (hasIslandBtiResult()) return "has-result";
  if (isIslandBtiPromoHiddenForToday()) return "hidden-until";
  if (isIslandBtiPromoSessionDismissed()) return "session-dismissed";
  return null;
}

export function shouldShowIslandBtiPromo(): boolean {
  return getIslandBtiPromoBlockReason() === null;
}
