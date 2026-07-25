import type { PassportBadge } from "./passport-book-data";

export const BADGES_PER_SIDE = 6;

export type PassportBookSpread = {
  index: number;
  left: { type: "profile" } | { type: "badges"; badges: PassportBadge[] };
  right: { badges: PassportBadge[] };
};

/** 여권 펼침 단위 — 1페이지: 프로필+배지6, 이후: 배지6+배지6 */
export function buildBookSpreads(badges: PassportBadge[]): PassportBookSpread[] {
  if (badges.length === 0) {
    return [{ index: 0, left: { type: "profile" }, right: { badges: [] } }];
  }

  const spreads: PassportBookSpread[] = [
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

export type BookNavState = {
  spread: number;
  totalSpreads: number;
  canPrev: boolean;
  canNext: boolean;
  flipping: boolean;
};
