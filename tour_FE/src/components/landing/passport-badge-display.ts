import type { PassportBadge } from "./passport-book-data";
import { isBadgeAcquired } from "./passport-book-data";

export type BadgeStampVariant = "ink" | "locked";

/** 획득 여부는 badge.acquired 데이터 기준 */
export function getBadgeStampVariant(badge: PassportBadge): BadgeStampVariant {
  return isBadgeAcquired(badge) ? "ink" : "locked";
}
