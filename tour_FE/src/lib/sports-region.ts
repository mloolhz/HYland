import { getIslandColors, getIslandRegion, ISLAND_REGION } from "@/constants/island";

const ALIASES: Record<string, string> = {
  신시모도: "신도",
  볼음도: "강화도",
};

/** 라벨(예: "시도 (수기해변)") → 카탈로그 기준 섬 이름 */
export function resolveSportIslandBaseName(label: string): string {
  let base = label
    .replace(/\s*[（(].*$/u, "")
    .replace(/\s*\+.*$/u, "")
    .trim();

  if (ALIASES[base]) base = ALIASES[base];

  if (ISLAND_REGION[base]) return base;

  const known = Object.keys(ISLAND_REGION).sort((a, b) => b.length - a.length);
  for (const name of known) {
    if (label.includes(name) || base.startsWith(name)) return name;
  }

  return base;
}

/** 지도·커뮤니티와 공유하는 지역색 accent */
export function resolveSportIslandAccent(label: string): string {
  return getIslandColors(resolveSportIslandBaseName(label)).accent;
}

export function resolveSportIslandRegion(label: string): string {
  return getIslandRegion(resolveSportIslandBaseName(label));
}
