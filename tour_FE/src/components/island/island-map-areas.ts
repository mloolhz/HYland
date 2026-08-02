/**
 * Island map hit areas for `public/island-explorer-map.png` (1024×642).
 *
 * Polygon paths are image-traced via `scripts/trace-island-map.py` (not hand-guessed).
 * Re-measure with Figma/Inkscape or dev capture mode: `/islands?mapCapture=1`
 */
import { getIslandColors } from "@/constants/island";
import { ISLANDS } from "@/lib/island-data";
import traced from "./island-map-traced.json";

export const ISLAND_MAP_IMAGE = "/island-explorer-map.png";
export const ISLAND_MAP_VIEWBOX = { width: 1024, height: 642 } as const;

export type IslandMapArea = {
  id: string;
  name: string;
  region: string;
  regionColor: string;
  /** SVG path `d` from image trace — null until measured */
  polygon: string | null;
  boatPosition: { x: number; y: number } | null;
};

const tracedPaths = traced.paths as Record<string, string>;
const tracedBoats = traced.boats as Record<string, { x: number; y: number }>;

export const ISLAND_MAP_AREAS: IslandMapArea[] = ISLANDS.map((island) => ({
  id: island.id,
  name: island.name,
  region: island.region,
  regionColor: getIslandColors(island.name).accent,
  polygon: tracedPaths[island.id] ?? null,
  boatPosition: tracedBoats[island.id] ?? null,
}));

export const ISLAND_MAP_AREA_BY_ID: Record<string, IslandMapArea> = Object.fromEntries(
  ISLAND_MAP_AREAS.map((area) => [area.id, area]),
);
