import { getIslandColors, ISLAND_REGION } from "@/constants/island";

/** 라벨(예: "시도 (수기해변)", "영흥도(+선재)") → ISLAND_REGION accent */
export function resolveSportIslandAccent(label: string): string {
  const aliases: Record<string, string> = {
    신시모도: "신도",
    볼음도: "강화도",
  };

  let base = label
    .replace(/\s*[（(].*$/u, "")
    .replace(/\s*\+.*$/u, "")
    .trim();

  if (aliases[base]) base = aliases[base];

  if (ISLAND_REGION[base]) return ISLAND_REGION[base].accent;

  const known = Object.keys(ISLAND_REGION).sort((a, b) => b.length - a.length);
  for (const name of known) {
    if (label.includes(name) || base.startsWith(name)) {
      return ISLAND_REGION[name].accent;
    }
  }

  return getIslandColors(base).accent;
}
