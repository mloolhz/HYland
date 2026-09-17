/**
 * Rebuilds the mainland side of the island explorer map art.
 *
 * The generated base art drew 인천 본토 as a blob with invented rivers and left a
 * green island where the 매립지 is, so everything east of the islands is redrawn
 * from the real OSM shoreline (see `trace-incheon-coast.mjs`):
 *
 *  1. Everything east of `REBUILD_MIN_X` is wiped back to sea, except the islands
 *     and their region accent strokes.
 *  2. The traced 인천 shoreline is filled with the mainland color, anti-aliased.
 *  3. The 영종구·서해구권역 pill and the 인천항 label are lifted from the base art
 *     and stamped back at fitting spots — pixel for pixel, so their type matches
 *     the rest of the baked labels exactly.
 *
 * Run: node scripts/trace-incheon-coast.mjs && node scripts/patch-map-mainland.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "../public/island-explorer-map.png");
const COAST_PATH = path.join(__dirname, "incheon-mainland-path.json");
const OUT = path.join(__dirname, "../public/island-explorer-map.patched.png");

/** Sampled from the Incheon mainland fill in the base art. */
const MAINLAND = [191, 207, 232];
const ACCENT_FILL = [221, 218, 46];
/** Everything from here east is redrawn; the islands themselves are masked out. */
const REBUILD_MIN_X = 750;
/** The art drew the 매립지 east of 영종도 as an island — this is that blob. */
const FAKE_ISLAND = { minX: 810, minSize: 2000 };
/** Smaller green patches out here are dither and label rims, not islets. */
const MIN_ISLAND_BLOB = 150;
/**
 * Supersampling for the coast fill, plus the morphology radius used to drop
 * pier-thin spikes and basin-thin channels that would read as glitches at this
 * map scale (2·radius/SS ≈ 3px of shoreline detail).
 */
const COAST_SS = 4;
const COAST_MORPH_R = 8;
/** Sea kept clear between an island's accent and the new coastline. */
const COAST_CLEARANCE = 5;
/** The 권역 label pill is the only wide horizontal band of accent yellow. */
const PILL_RUN_MIN = 50;
/** Where the pill should sit: the water between 영종도 and 무의도 (traced bboxes). */
const PILL_ANCHOR = { x: 685, y: 390 };
const PILL_SEARCH = { xMin: 520, xMax: 900, yMin: 330, yMax: 540 };
/** The 인천항 label in the base art, and the real port it should point at. */
const PORT_LABEL_SOURCE = { minX: 962, maxX: 1023, minY: 300, maxY: 344 };
const PORT_LOCATION = { lon: 126.605, lat: 37.463 };
const PORT_SEARCH_RADIUS = 90;

const isGreen = (r, g, b) => g > 95 && g > r + 18 && g > b + 10 && r < 190;
const isSea = (r, g, b) => b > 150 && r < 60 && g < 135;
const isAccent = (r, g, b) => r > 150 && g > 140 && b < 140 && r > b + 40;
const isMainland = (r, g, b) =>
  Math.abs(r - MAINLAND[0]) < 10 && Math.abs(g - MAINLAND[1]) < 10 && Math.abs(b - MAINLAND[2]) < 10;

const NEIGHBORS_4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const NEIGHBORS_8 = [
  ...NEIGHBORS_4,
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

async function main() {
  const coast = JSON.parse((await fs.readFile(COAST_PATH, "utf8")).replace(/^\uFEFF/, ""));
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const at = (x, y) => (y * width + x) * channels;
  const rgbAt = (x, y) => {
    const i = at(x, y);
    return [data[i], data[i + 1], data[i + 2]];
  };
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
  const write = (x, y, rgb) => {
    const i = at(x, y);
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    if (channels === 4) data[i + 3] = 255;
  };

  // ── 1. Lift the 권역 label pill ─────────────────────────────────────────
  const body = { minX: Infinity, maxX: -1, minY: Infinity, maxY: -1 };
  for (let y = 340; y <= 405; y++) {
    let runStart = -1;
    for (let x = 700; x <= 961; x++) {
      const yellow = x <= 960 && isAccent(...rgbAt(x, y));
      if (yellow) {
        if (runStart < 0) runStart = x;
        continue;
      }
      if (runStart >= 0 && x - runStart >= PILL_RUN_MIN) {
        body.minX = Math.min(body.minX, runStart);
        body.maxX = Math.max(body.maxX, x - 1);
        body.minY = Math.min(body.minY, y);
        body.maxY = Math.max(body.maxY, y);
      }
      runStart = -1;
    }
  }
  if (body.maxX < 0) throw new Error("label pill not found");

  /**
   * The label text breaks the accent band into short runs, so build the mask by
   * walking outwards from the middle of each row until the pixels turn back into
   * sea or island green.
   */
  const pillMask = new Uint8Array(width * height);
  const SLACK = 6;
  const centerX = Math.round((body.minX + body.maxX) / 2);
  const isPillBackground = (x, y) => {
    const rgb = rgbAt(x, y);
    return isSea(...rgb) || isGreen(...rgb);
  };
  const pill = { minX: Infinity, maxX: -1, minY: Infinity, maxY: -1 };
  for (let y = body.minY; y <= body.maxY; y++) {
    if (isPillBackground(centerX, y)) continue;
    let first = centerX;
    let last = centerX;
    while (first - 1 >= body.minX - SLACK && !isPillBackground(first - 1, y)) first--;
    while (last + 1 <= body.maxX + SLACK && !isPillBackground(last + 1, y)) last++;
    for (let x = first; x <= last; x++) pillMask[y * width + x] = 1;
    pill.minX = Math.min(pill.minX, first);
    pill.maxX = Math.max(pill.maxX, last);
    pill.minY = Math.min(pill.minY, y);
    pill.maxY = Math.max(pill.maxY, y);
  }
  const inPill = (x, y) => pillMask[y * width + x] === 1;

  const pillSprite = [];
  for (let y = pill.minY; y <= pill.maxY; y++) {
    for (let x = pill.minX; x <= pill.maxX; x++) {
      if (!inPill(x, y)) continue;
      /** Rim pixels are blended with whatever was behind them; remember it. */
      const outside = [];
      for (const [dx, dy] of NEIGHBORS_8) {
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny) || inPill(nx, ny)) continue;
        const rgb = rgbAt(nx, ny);
        if (isSea(...rgb) || isGreen(...rgb)) outside.push(rgb);
      }
      const oldBg = outside.length
        ? [0, 1, 2].map((c) => Math.round(outside.reduce((sum, rgb) => sum + rgb[c], 0) / outside.length))
        : null;
      pillSprite.push({ x, y, rgb: rgbAt(x, y), oldBg });
    }
  }
  const pillW = pill.maxX - pill.minX + 1;
  const pillH = pill.maxY - pill.minY + 1;
  console.log(`권역 pill x${pill.minX}-${pill.maxX} y${pill.minY}-${pill.maxY} · ${pillSprite.length}px lifted`);

  // ── 2. Lift the 인천항 label — it sits on flat mainland, so copy it whole ──
  const portLabel = { minX: Infinity, maxX: -1, minY: Infinity, maxY: -1 };
  for (let y = PORT_LABEL_SOURCE.minY; y <= PORT_LABEL_SOURCE.maxY; y++) {
    for (let x = PORT_LABEL_SOURCE.minX; x <= PORT_LABEL_SOURCE.maxX; x++) {
      if (isMainland(...rgbAt(x, y))) continue;
      portLabel.minX = Math.min(portLabel.minX, x);
      portLabel.maxX = Math.max(portLabel.maxX, x);
      portLabel.minY = Math.min(portLabel.minY, y);
      portLabel.maxY = Math.max(portLabel.maxY, y);
    }
  }
  if (portLabel.maxX < 0) throw new Error("인천항 label not found");
  const PAD = 2;
  const portBox = {
    minX: portLabel.minX - PAD,
    maxX: portLabel.maxX + PAD,
    minY: portLabel.minY - PAD,
    maxY: portLabel.maxY + PAD,
  };
  const portW = portBox.maxX - portBox.minX + 1;
  const portH = portBox.maxY - portBox.minY + 1;
  /** Only the glyphs travel — the flat fill around them is identical anyway, and
   * copying it would leave a faint box where the art's vignette differs. */
  const portSprite = [];
  for (let y = portBox.minY; y <= portBox.maxY; y++) {
    for (let x = portBox.minX; x <= portBox.maxX; x++) {
      const rgb = rgbAt(x, y);
      if (!isMainland(...rgb)) portSprite.push({ x, y, rgb });
    }
  }
  console.log(`인천항 label x${portBox.minX}-${portBox.maxX} y${portBox.minY}-${portBox.maxY} · ${portW}×${portH}`);

  // ── 3. Islands (and their accent strokes) are the only thing we preserve ──
  const seen = new Uint8Array(width * height);
  const islandMask = new Uint8Array(width * height);
  let islandCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = y * width + x;
      if (seen[key] || !isGreen(...rgbAt(x, y))) continue;

      const pixels = [];
      const stack = [[x, y]];
      seen[key] = 1;
      let minX = x;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        pixels.push(cy * width + cx);
        minX = Math.min(minX, cx);
        for (const [dx, dy] of NEIGHBORS_4) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (!inBounds(nx, ny)) continue;
          const nKey = ny * width + nx;
          if (seen[nKey] || !isGreen(...rgbAt(nx, ny))) continue;
          seen[nKey] = 1;
          stack.push([nx, ny]);
        }
      }

      const isFake = minX >= FAKE_ISLAND.minX && pixels.length >= FAKE_ISLAND.minSize;
      if (isFake || pixels.length < MIN_ISLAND_BLOB) continue;
      for (const p of pixels) islandMask[p] = 1;
      islandCount++;
    }
  }
  console.log(`${islandCount} islands kept`);

  /** Region accent hugging an island belongs to it; grab it by flood fill. */
  const guard = Uint8Array.from(islandMask);
  const accentStack = [];
  const considerAccent = (x, y) => {
    const key = y * width + x;
    if (guard[key] || inPill(x, y) || !isAccent(...rgbAt(x, y))) return;
    guard[key] = 1;
    accentStack.push([x, y]);
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!islandMask[y * width + x]) continue;
      for (const [dx, dy] of NEIGHBORS_8) {
        if (inBounds(x + dx, y + dy)) considerAccent(x + dx, y + dy);
      }
    }
  }
  while (accentStack.length) {
    const [x, y] = accentStack.pop();
    for (const [dx, dy] of NEIGHBORS_8) {
      if (inBounds(x + dx, y + dy)) considerAccent(x + dx, y + dy);
    }
  }
  /** Islands must not be touched, and the new coast keeps its distance too. */
  const dilate = (mask, radius) => {
    const out = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!mask[y * width + x]) continue;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (inBounds(nx, ny)) out[ny * width + nx] = 1;
          }
        }
      }
    }
    return out;
  };
  const keepMask = dilate(guard, 1);
  const coastKeepOut = dilate(keepMask, COAST_CLEARANCE);

  // ── 4. Wipe the mainland side back to sea ───────────────────────────────
  const seaDonorForRow = (y) => {
    for (const dy of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6]) {
      const row = y + dy;
      if (row < 0 || row >= height) continue;
      let best = null;
      let runStart = -1;
      const donorMaxX = REBUILD_MIN_X - 8;
      for (let x = 20; x <= donorMaxX; x++) {
        if (isSea(...rgbAt(x, row))) {
          if (runStart < 0) runStart = x;
          if (x < donorMaxX) continue;
        }
        const len = runStart < 0 ? 0 : x - runStart;
        if (len > (best?.len ?? 0)) best = { start: runStart, len, row };
        runStart = -1;
      }
      if (best && best.len >= 60) return best;
    }
    return null;
  };

  let wiped = 0;
  for (let y = 0; y < height; y++) {
    const donor = seaDonorForRow(y);
    if (!donor) throw new Error(`no clean sea donor for row ${y}`);
    for (let x = REBUILD_MIN_X; x < width; x++) {
      if (keepMask[y * width + x]) continue;
      const offset = (((x - donor.start) % donor.len) + donor.len) % donor.len;
      write(x, y, rgbAt(donor.start + offset, donor.row));
      wiped++;
    }
  }
  console.log(`wiped ${wiped}px back to sea`);

  // ── 5. Fill the traced shoreline, cleaned up and anti-aliased ───────────
  const polygon = coast.polygon;
  const W = width * COAST_SS;
  const H = height * COAST_SS;
  let land = new Uint8Array(W * H);
  const crossings = [];
  for (let sy = 0; sy < H; sy++) {
    const sampleY = (sy + 0.5) / COAST_SS;
    crossings.length = 0;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [x1, y1] = polygon[j];
      const [x2, y2] = polygon[i];
      if (y1 === y2 || sampleY < Math.min(y1, y2) || sampleY >= Math.max(y1, y2)) continue;
      crossings.push(x1 + ((sampleY - y1) / (y2 - y1)) * (x2 - x1));
    }
    if (crossings.length < 2) continue;
    crossings.sort((a, b) => a - b);

    for (let k = 0; k + 1 < crossings.length; k += 2) {
      const from = clamp(Math.round(crossings[k] * COAST_SS), 0, W);
      const to = clamp(Math.round(crossings[k + 1] * COAST_SS), 0, W);
      for (let sx = from; sx < to; sx++) land[sy * W + sx] = 1;
    }
  }

  /**
   * Box morphology, separable and O(1) per pixel. Off-canvas counts as land when
   * eroding so the shoreline running off the edges never gets shaved back.
   */
  const morph = (mask, radius, mode) => {
    const outside = mode === "erode" ? 1 : 0;
    const win = radius * 2 + 1;
    const hit = mode === "erode" ? (sum) => (sum === win ? 1 : 0) : (sum) => (sum > 0 ? 1 : 0);
    const mid = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      const row = y * W;
      const get = (x) => (x >= 0 && x < W ? mask[row + x] : outside);
      let sum = 0;
      for (let x = -radius; x <= radius; x++) sum += get(x);
      for (let x = 0; x < W; x++) {
        mid[row + x] = hit(sum);
        sum -= get(x - radius);
        sum += get(x + radius + 1);
      }
    }
    const out = new Uint8Array(W * H);
    for (let x = 0; x < W; x++) {
      const get = (y) => (y >= 0 && y < H ? mid[y * W + x] : outside);
      let sum = 0;
      for (let y = -radius; y <= radius; y++) sum += get(y);
      for (let y = 0; y < H; y++) {
        out[y * W + x] = hit(sum);
        sum -= get(y - radius);
        sum += get(y + radius + 1);
      }
    }
    return out;
  };

  // Close fills basin-thin channels, open trims pier-thin spikes.
  land = morph(morph(land, COAST_MORPH_R, "dilate"), COAST_MORPH_R, "erode");
  land = morph(morph(land, COAST_MORPH_R, "erode"), COAST_MORPH_R, "dilate");

  const coverage = new Float32Array(width * height);
  const subPixels = COAST_SS * COAST_SS;
  for (let sy = 0; sy < H; sy++) {
    const y = (sy / COAST_SS) | 0;
    for (let sx = 0; sx < W; sx++) {
      if (land[sy * W + sx]) coverage[y * width + ((sx / COAST_SS) | 0)] += 1 / subPixels;
    }
  }

  /**
   * Closing a channel can leave its far end stranded as an inland lake, so flood
   * the open water in from the canvas edges and fill whatever it cannot reach.
   */
  const openWater = new Uint8Array(width * height);
  const floodStack = [];
  const considerWater = (x, y) => {
    const key = y * width + x;
    if (openWater[key] || coverage[key] >= 0.5) return;
    openWater[key] = 1;
    floodStack.push(key);
  };
  for (let y = 0; y < height; y++) {
    considerWater(0, y);
    considerWater(width - 1, y);
  }
  for (let x = 0; x < width; x++) {
    considerWater(x, 0);
    considerWater(x, height - 1);
  }
  while (floodStack.length) {
    const key = floodStack.pop();
    const x = key % width;
    const y = (key - x) / width;
    for (const [dx, dy] of NEIGHBORS_4) {
      if (inBounds(x + dx, y + dy)) considerWater(x + dx, y + dy);
    }
  }

  const lakes = [];
  for (let key = 0; key < coverage.length; key++) {
    if (openWater[key] || coverage[key] >= 0.5 || key % width < REBUILD_MIN_X) continue;
    lakes.push(key);
  }
  for (const key of lakes) coverage[key] = 1;
  for (const key of lakes) {
    const x = key % width;
    const y = (key - x) / width;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (!inBounds(x + dx, y + dy)) continue;
        const nKey = (y + dy) * width + x + dx;
        // The lake's anti-aliased rim, which would otherwise outline the fill.
        if (!openWater[nKey] && coverage[nKey] > 0) coverage[nKey] = 1;
      }
    }
  }
  if (lakes.length) console.log(`filled ${lakes.length}px of stranded inland water`);

  let landPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = y * width + x;
      const alpha = clamp(coverage[key], 0, 1);
      if (alpha <= 0 || coastKeepOut[key]) continue;
      const bg = rgbAt(x, y);
      write(
        x,
        y,
        MAINLAND.map((v, c) => Math.round(v * alpha + bg[c] * (1 - alpha))),
      );
      if (alpha > 0.5) landPixels++;
    }
  }
  console.log(`filled ${landPixels}px of mainland`);

  // ── 6. Put the two labels back ─────────────────────────────────────────
  const findSlot = ({ w, h, pad, anchor, window: win, fits }) => {
    const boxW = w + pad * 2;
    const boxH = h + pad * 2;
    const winW = win.xMax - win.xMin + 1;
    const winH = win.yMax - win.yMin + 1;
    const integral = new Int32Array((winW + 1) * (winH + 1));
    for (let j = 0; j < winH; j++) {
      for (let i = 0; i < winW; i++) {
        const ok = fits(win.xMin + i, win.yMin + j) ? 1 : 0;
        integral[(j + 1) * (winW + 1) + i + 1] =
          ok +
          integral[j * (winW + 1) + i + 1] +
          integral[(j + 1) * (winW + 1) + i] -
          integral[j * (winW + 1) + i];
      }
    }
    const count = (i, j) =>
      integral[(j + boxH) * (winW + 1) + i + boxW] -
      integral[j * (winW + 1) + i + boxW] -
      integral[(j + boxH) * (winW + 1) + i] +
      integral[j * (winW + 1) + i];

    let best = null;
    for (let j = 0; j + boxH <= winH; j++) {
      for (let i = 0; i + boxW <= winW; i++) {
        if (count(i, j) !== boxW * boxH) continue;
        const cx = win.xMin + i + boxW / 2;
        const cy = win.yMin + j + boxH / 2;
        const dist = Math.hypot(cx - anchor.x, cy - anchor.y);
        if (!best || dist < best.dist) best = { dist, x: win.xMin + i + pad, y: win.yMin + j + pad };
      }
    }
    return best;
  };

  const pillSlot = findSlot({
    w: pillW,
    h: pillH,
    pad: 3,
    anchor: PILL_ANCHOR,
    window: PILL_SEARCH,
    fits: (x, y) => isSea(...rgbAt(x, y)),
  });
  if (!pillSlot) throw new Error("no open sea slot for the label pill");

  const pillShift = { x: pillSlot.x - pill.minX, y: pillSlot.y - pill.minY };
  for (const { x, y, rgb, oldBg } of pillSprite) {
    const nx = x + pillShift.x;
    const ny = y + pillShift.y;
    if (!inBounds(nx, ny)) continue;
    const newBg = rgbAt(nx, ny);
    if (!oldBg) {
      write(nx, ny, rgb);
      continue;
    }

    // rgb = alpha·accent + (1-alpha)·oldBg, so re-mix it against the new backdrop.
    let alpha = 1;
    for (const c of [0, 1, 2]) {
      const span = ACCENT_FILL[c] - oldBg[c];
      if (Math.abs(span) < 40) continue;
      alpha = clamp((rgb[c] - oldBg[c]) / span, 0, 1);
      break;
    }
    write(
      nx,
      ny,
      rgb.map((v, c) => clamp(Math.round(v + (1 - alpha) * (newBg[c] - oldBg[c])), 0, 255)),
    );
  }
  console.log(
    `권역 pill → x${pillSlot.x}-${pillSlot.x + pillW - 1} y${pillSlot.y}-${pillSlot.y + pillH - 1}`,
  );

  const { LAT_TOP, PX_PER_LAT, LON_LEFT, X_AT_LON, PX_PER_LON } = coast.projection;
  const portAnchor = {
    x: X_AT_LON + (PORT_LOCATION.lon - LON_LEFT) * PX_PER_LON,
    y: (LAT_TOP - PORT_LOCATION.lat) * PX_PER_LAT,
  };
  const portSlot = findSlot({
    w: portW,
    h: portH,
    pad: 2,
    anchor: portAnchor,
    window: {
      xMin: Math.round(portAnchor.x - PORT_SEARCH_RADIUS),
      xMax: width - 1,
      yMin: Math.round(portAnchor.y - PORT_SEARCH_RADIUS),
      yMax: Math.round(portAnchor.y + PORT_SEARCH_RADIUS),
    },
    fits: (x, y) => isMainland(...rgbAt(x, y)),
  });
  if (!portSlot) throw new Error("no mainland slot for the 인천항 label");

  const portShift = { x: portSlot.x - portBox.minX, y: portSlot.y - portBox.minY };
  for (const { x, y, rgb } of portSprite) {
    const nx = x + portShift.x;
    const ny = y + portShift.y;
    if (inBounds(nx, ny)) write(nx, ny, rgb);
  }
  console.log(
    `인천항 → x${portSlot.x}-${portSlot.x + portW - 1} y${portSlot.y}-${portSlot.y + portH - 1} (port at ${portAnchor.x.toFixed(0)}, ${portAnchor.y.toFixed(0)})`,
  );

  await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT);
  console.log(`wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
