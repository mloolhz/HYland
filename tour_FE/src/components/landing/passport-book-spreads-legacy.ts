import type { PassportBadge } from "./passport-book-data";

export const BADGES_PER_SIDE = 6;

export type LegacyPassportBookSpread = {
  index: number;
  left: { type: "profile" } | { type: "badges"; badges: PassportBadge[] };
  right: { badges: PassportBadge[] };
};

/** @deprecated — legacy ink-stamp badge spreads */
export function buildBookSpreads(badges: PassportBadge[]): LegacyPassportBookSpread[] {
  if (badges.length === 0) {
    return [{ index: 0, left: { type: "profile" }, right: { badges: [] } }];
  }

  const spreads: LegacyPassportBookSpread[] = [
    {
      index: 0,
      left: { type: "profile" },
      right: { badges: badges.slice(0, BADGES_PER_SIDE) },
    },
  ];

  let cursor = BADGES_PER_SIDE;
  let spreadIndex = 1;

  while (cursor < badges.length) {
    spreads.push({
      index: spreadIndex,
      left: { type: "badges", badges: badges.slice(cursor, cursor + BADGES_PER_SIDE) },
      right: { badges: badges.slice(cursor + BADGES_PER_SIDE, cursor + BADGES_PER_SIDE * 2) },
    });
    cursor += BADGES_PER_SIDE * 2;
    spreadIndex += 1;
  }

  return spreads;
}
