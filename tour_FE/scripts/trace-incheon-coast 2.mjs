/**
 * Projects the fetched 인천 본토 해안선 into map-art pixel space and writes the
 * filled land polygon used by `patch-yeongj-mainland.mjs`.
 *
 * The island art is stylised (islands are drawn oversized), so the mainland is
 * placed to fill the right edge the way the original art did rather than sharing
 * the islands' scale. Only the shoreline matters: the inland 김포·부천·시흥
 * borders fall outside the canvas, so the land simply runs off the right edge.
 *
 * Run: node scripts/trace-incheon-coast.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN = path.join(__dirname, "incheon-mainland-raw.json");
const OUT = path.join(__dirname, "incheon-mainland-path.json");

/** Latitude pinned to the top edge, and pixels per degree of latitude. */
const LAT_TOP = 37.68;
const PX_PER_LAT = 1690;
/** Longitude pinned to `X_AT_LON`, with the aspect kept true at this latitude. */
const LON_LEFT = 126.55;
/** Nudged east of the (oversized) 강화도 art so the 염하 channel stays open. */
const X_AT_LON = 845;
const PX_PER_LON = PX_PER_LAT * Math.cos((37.47 * Math.PI) / 180);
/** Keep a little of the shoreline beyond the canvas so the fill has no seams. */
const Y_MARGIN = 60;
/** The land is closed off far to the east, well past the 1024px canvas. */
const CLOSE_X = 1400;
const SIMPLIFY_TOLERANCE = 0.5;

const toPixel = ([lon, lat]) => [
  X_AT_LON + (lon - LON_LEFT) * PX_PER_LON,
  (LAT_TOP - lat) * PX_PER_LAT,
];

/** Ramer–Douglas–Peucker. */
function simplify(points, tolerance) {
  if (points.length < 3) return points;

  const [ax, ay] = points[0];
  const [bx, by] = points.at(-1);
  const dx = bx - ax;
  const dy = by - ay;
  const norm = Math.hypot(dx, dy);

  let worst = 0;
  let worstIndex = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist =
      norm === 0
        ? Math.hypot(px - ax, py - ay)
        : Math.abs(dy * (px - ax) - dx * (py - ay)) / norm;
    if (dist > worst) {
      worst = dist;
      worstIndex = i;
    }
  }
  if (worst <= tolerance) return [points[0], points.at(-1)];

  return [
    ...simplify(points.slice(0, worstIndex + 1), tolerance),
    ...simplify(points.slice(worstIndex), tolerance).slice(1),
  ];
}

const { mainland } = JSON.parse((await fs.readFile(IN, "utf8")).replace(/^\uFEFF/, ""));
if (!mainland?.length) throw new Error("no mainland shoreline in the fetched data");

// OSM coastlines keep land on the left, so a west coast runs north to south.
const ordered = mainland[0][1] >= mainland.at(-1)[1] ? mainland : [...mainland].reverse();

const projected = ordered.map(toPixel);
const firstIndex = projected.findIndex(([, y]) => y >= -Y_MARGIN);
let lastIndex = -1;
for (let i = projected.length - 1; i >= 0; i--) {
  if (projected[i][1] <= 642 + Y_MARGIN) {
    lastIndex = i;
    break;
  }
}
if (firstIndex < 0 || lastIndex <= firstIndex) throw new Error("coastline misses the canvas");

const visible = projected.slice(Math.max(0, firstIndex - 1), lastIndex + 2);
const simplified = simplify(visible, SIMPLIFY_TOLERANCE);
const polygon = [
  ...simplified,
  [CLOSE_X, simplified.at(-1)[1]],
  [CLOSE_X, simplified[0][1]],
];

const xs = simplified.map(([x]) => x);
const ys = simplified.map(([, y]) => y);
console.log(
  `shoreline ${ordered.length} → ${simplified.length} pts · x ${Math.min(...xs).toFixed(0)}–${Math.max(...xs).toFixed(0)} · y ${Math.min(...ys).toFixed(0)}–${Math.max(...ys).toFixed(0)}`,
);
for (const y of [0, 80, 160, 240, 320, 400, 480, 560, 640]) {
  const near = simplified.filter(([, py]) => Math.abs(py - y) < 6).map(([px]) => px);
  const label = near.length ? `${Math.min(...near).toFixed(0)}–${Math.max(...near).toFixed(0)}` : "—";
  console.log(`  y${String(y).padStart(3)} · coast x ${label}`);
}

const round = (v) => Math.round(v * 10) / 10;
await fs.writeFile(
  OUT,
  JSON.stringify({
    projection: { LAT_TOP, PX_PER_LAT, LON_LEFT, X_AT_LON, PX_PER_LON: round(PX_PER_LON) },
    polygon: polygon.map(([x, y]) => [round(x), round(y)]),
  }),
  "utf8",
);
console.log(`wrote ${OUT} · ${polygon.length} pts`);
