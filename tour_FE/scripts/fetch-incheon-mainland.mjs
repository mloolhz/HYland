/**
 * Fetches the OSM coastline around the 인천 mainland and assembles it into
 * chains, so the map art can trace the real shoreline (인천항·송도 매립지 포함).
 *
 * Admin boundaries are useless here: 인천광역시 includes its maritime extent,
 * which reaches 백령도. natural=coastline is the actual land/sea edge.
 *
 * Run: node scripts/fetch-incheon-mainland.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "incheon-mainland-raw.json");

const BBOX = { south: 37.22, west: 126.44, north: 37.72, east: 126.9 };
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const QUERY = `[out:json][timeout:120];
way["natural"="coastline"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
out geom;`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function overpass() {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "hyland-map-art/1.0 (local dev script)",
          },
          body: new URLSearchParams({ data: QUERY }),
        });
        if (!res.ok) throw new Error(`${endpoint} → ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn(`  ${err.message}`);
        lastError = err;
      }
    }
    await sleep(5000 * (attempt + 1));
  }
  throw lastError;
}

const key = ([lon, lat]) => `${lon.toFixed(7)},${lat.toFixed(7)}`;

const data = await overpass();
const ways = data.elements
  .filter((el) => el.type === "way" && el.geometry?.length > 1)
  .map((el) => el.geometry.map((p) => [p.lon, p.lat]));
console.log(`${ways.length} coastline ways`);

/** OSM coastline ways are directed (land on the left); join them end to start. */
const chains = ways.map((pts) => [...pts]);
let merged = true;
while (merged) {
  merged = false;
  const byStart = new Map();
  chains.forEach((chain, i) => {
    if (chain) byStart.set(key(chain[0]), i);
  });

  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    if (!chain) continue;
    if (key(chain[0]) === key(chain.at(-1))) continue;
    const nextIndex = byStart.get(key(chain.at(-1)));
    if (nextIndex === undefined || nextIndex === i || !chains[nextIndex]) continue;
    chain.push(...chains[nextIndex].slice(1));
    chains[nextIndex] = null;
    merged = true;
    break;
  }
}

const assembled = chains
  .filter(Boolean)
  .map((pts) => {
    const lons = pts.map((p) => p[0]);
    const lats = pts.map((p) => p[1]);
    return {
      points: pts,
      closed: key(pts[0]) === key(pts.at(-1)),
      bbox: {
        west: Math.min(...lons),
        east: Math.max(...lons),
        south: Math.min(...lats),
        north: Math.max(...lats),
      },
    };
  })
  .sort((a, b) => b.points.length - a.points.length);

for (const chain of assembled.slice(0, 12)) {
  const { west, east, south, north } = chain.bbox;
  console.log(
    `${chain.closed ? "ring " : "chain"} ${String(chain.points.length).padStart(6)} pts · lon ${west.toFixed(3)}–${east.toFixed(3)} · lat ${south.toFixed(3)}–${north.toFixed(3)}`,
  );
}

/** Only the mainland shoreline is traced; islands come from the base art. */
const mainland = assembled.find((chain) => !chain.closed);
if (!mainland) throw new Error("no open coastline chain found");

await fs.writeFile(OUT, JSON.stringify({ bbox: BBOX, mainland: mainland.points }), "utf8");
console.log(`wrote ${OUT} · mainland chain ${mainland.points.length} pts`);
