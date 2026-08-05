import type { StampVariant } from "@/components/landing/PassportInkStampArt";
import { getStampShape, type StampShape } from "@/lib/passport/stamp-shapes";

export type StampTheme = {
  ink: string;
};

export const STAMP_THEMES: Record<StampVariant, StampTheme> = {
  "baengnyeong-cliff": { ink: "#2F6FD4" },
  "jawol-mountain": { ink: "#3D8B5A" },
  "deokjeok-camp": { ink: "#7A6BA8" },
  "yeongjong-cycle": { ink: "#C86A32" },
  "mui-kayak": { ink: "#3A9AA8" },
  "island-bti": { ink: "#9AA3AD" },
  "eco-wetland": { ink: "#4A8F62" },
  "leisure-kayak": { ink: "#B8894A" },
  lighthouse: { ink: "#2A5C93" },
  footprints: { ink: "#5B7FA5" },
  "surf-wave": { ink: "#2E8B9A" },
  "crab-mudflat": { ink: "#B0503A" },
  sunset: { ink: "#C97A45" },
  "review-pen": { ink: "#6B5B95" },
  "chat-heart": { ink: "#B85C7A" },
  shell: { ink: "#8B6B5A" },
  anchor: { ink: "#9AA3AD" },
  generic: { ink: "#2F6FD4" },
};

export const QUEST_STAMP_VARIANT: Record<number, StampVariant> = {
  1: "baengnyeong-cliff",
  2: "jawol-mountain",
  3: "footprints",
  4: "lighthouse",
  5: "generic",
  6: "island-bti",
  7: "leisure-kayak",
  8: "mui-kayak",
  9: "yeongjong-cycle",
  10: "surf-wave",
  11: "deokjeok-camp",
  12: "leisure-kayak",
  13: "eco-wetland",
  14: "crab-mudflat",
  16: "sunset",
  17: "shell",
  18: "review-pen",
  19: "chat-heart",
  20: "island-bti",
  21: "chat-heart",
  22: "review-pen",
};

export function getQuestStampVariant(questId: number, category: string): StampVariant {
  return QUEST_STAMP_VARIANT[questId] ?? CATEGORY_STAMP_VARIANT[category] ?? "generic";
}

export const CATEGORY_STAMP_VARIANT: Record<string, StampVariant> = {
  탐험: "footprints",
  레저: "surf-wave",
  생태: "eco-wetland",
  기타: "review-pen",
};

export function getStampTheme(variant: StampVariant): StampTheme {
  return STAMP_THEMES[variant] ?? STAMP_THEMES.generic;
}

export type StampLayout = {
  rotate: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  shape: StampShape;
};

const LAYOUTS: Omit<StampLayout, "shape">[] = [
  { rotate: -2, scale: 1, offsetX: 0, offsetY: 0 },
  { rotate: 1.5, scale: 0.97, offsetX: 1, offsetY: -1 },
  { rotate: -1, scale: 1.02, offsetX: -1, offsetY: 1 },
  { rotate: 2, scale: 0.96, offsetX: 0, offsetY: 2 },
  { rotate: -1.5, scale: 1, offsetX: -2, offsetY: 0 },
  { rotate: 1, scale: 0.98, offsetX: 1, offsetY: 1 },
];

export function getStampLayout(questId: number): StampLayout {
  const base = LAYOUTS[questId % LAYOUTS.length];
  return { ...base, shape: getStampShape(questId) };
}

export const STAMP_GRID_SLOTS = 16;
