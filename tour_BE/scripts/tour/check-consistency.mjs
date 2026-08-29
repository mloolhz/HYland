/**
 * 레저스포츠 데이터 정합성 점검
 *
 * 카테고리·활동을 추가하거나 시설을 더 넣었을 때, "조용히 사라지는" 데이터를
 * 잡아내기 위한 검사. 문제가 있으면 exit code 1 로 끝난다.
 *
 * 점검 항목
 *   1. 분류 기준 두 벌(ACTIVITY_TAXONOMY / REQUIRED_ACTIVITIES)이 어긋나지 않았는지
 *   2. 카테고리 코드(SEA/LAND/EXPERIENCE/HEALING)가 전부 프론트 키로 매핑되는지
 *   3. 프론트 CategoryKey 와 BE 카테고리가 1:1 인지
 *   4. 수집한 활동이 전부 프론트 종목과 이어지는지 (고아 활동 = 화면에 안 나옴)
 *   5. 프론트 종목 중 시설이 하나도 없는 것
 *   6. 활동 ↔ Prisma LeisureActivity enum 이 1:1 인지 (시드가 깨지지 않도록)
 *   7. 시설의 섬 이름이 프론트 섬 목록에 있는지 (없으면 색/권역이 회색 폴백)
 *
 * 실행: node scripts/tour/check-consistency.mjs
 */
import { readFileSync } from "node:fs";
import { ACTIVITY_TAXONOMY, ACTIVITY_ENUM } from "./lib/activity.mjs";
import { REQUIRED_ACTIVITIES, WEB_FACILITIES } from "./web-research-data.mjs";
import { WEB_FACILITIES_G1 } from "./web-research1-data.mjs";

const FE_SPORTS = "../tour_FE/src/data/sports.ts";
const FE_ISLANDS = "../tour_FE/src/constants/island.ts";
const CANDIDATES = "reports/leisure-candidates/all-candidates.json";
const PRISMA_SCHEMA = "prisma/schema.prisma";

/** 활동명 대조 시 무시할 구분 문자 */
const NOISE = [" ", "·", "・", "-", "–", "—"];
const key = (s) => NOISE.reduce((acc, ch) => acc.split(ch).join(""), String(s ?? ""));

const CATEGORY_KEY = { SEA: "water", LAND: "land", EXPERIENCE: "exp", HEALING: "heal" };

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);

// ── 프론트 sports.ts 파싱 ──
const sportsSrc = readFileSync(FE_SPORTS, "utf8");

const feCategoryKeys = (sportsSrc.match(/export type CategoryKey =([^;]+);/)?.[1] ?? "")
  .split("|")
  .map((s) => s.trim().replace(/"/g, ""))
  .filter(Boolean);

/** 종목명 → 프론트 카테고리 키 */
const feSports = new Map();
{
  const body = sportsSrc.slice(sportsSrc.indexOf("const RAW_SPORTS_DATA"));
  let current = null;
  for (const line of body.split("\n")) {
    const cat = line.match(/^ {2}(\w+): \[/);
    if (cat && feCategoryKeys.includes(cat[1])) current = cat[1];
    const name = line.match(/name: "([^"]+)"/);
    if (name && current) feSports.set(name[1], current);
  }
}

/** 프론트가 아는 섬 이름 — constants/island.ts 의 ISLAND_REGION 키 */
const islandSrc = readFileSync(FE_ISLANDS, "utf8");
const islandBlock =
  islandSrc.match(/ISLAND_REGION: Record<string, IslandColors> = \{([^]*?)^\};/m)?.[1] ?? "";
const feIslands = new Set([...islandBlock.matchAll(/^ {2}([^\s:]+):/gm)].map((m) => m[1]));

// ── 1. 분류 기준 두 벌 비교 ──
for (const cat of new Set([...Object.keys(ACTIVITY_TAXONOMY), ...Object.keys(REQUIRED_ACTIVITIES)])) {
  const a = JSON.stringify(ACTIVITY_TAXONOMY[cat] ?? []);
  const b = JSON.stringify(REQUIRED_ACTIVITIES[cat] ?? []);
  if (a !== b) {
    fail(`[분류 기준 불일치] ${cat}\n    activity.mjs        = ${a}\n    web-research-data   = ${b}`);
  }
}

// ── 2·3. 카테고리 매핑 ──
for (const cat of Object.keys(ACTIVITY_TAXONOMY)) {
  if (!CATEGORY_KEY[cat]) {
    fail(`[카테고리 매핑 없음] ${cat} → export-to-frontend.mjs 의 CATEGORY_KEY 에 추가 필요`);
  }
}
for (const [cat, feKey] of Object.entries(CATEGORY_KEY)) {
  if (!feCategoryKeys.includes(feKey)) {
    fail(`[프론트에 없는 카테고리] ${cat} → "${feKey}" 가 sports.ts 의 CategoryKey 에 없음`);
  }
  if (!ACTIVITY_TAXONOMY[cat]) {
    fail(`[BE 분류에 없는 카테고리] ${cat} 이 ACTIVITY_TAXONOMY 에 없음`);
  }
}
for (const feKey of feCategoryKeys) {
  if (!Object.values(CATEGORY_KEY).includes(feKey)) {
    fail(`[매핑되지 않는 프론트 카테고리] "${feKey}" 로 갈 BE 카테고리가 없음`);
  }
}

// ── 시설 모으기 (export-to-frontend.mjs 와 동일 규칙) ──
const facilities = [];
for (const f of JSON.parse(readFileSync(CANDIDATES, "utf8"))) {
  if (f.islandStatus !== "MATCHED" || f.activity === "기타") continue;
  facilities.push({ ...f, origin: "관광공사" });
}
for (const f of WEB_FACILITIES_G1) facilities.push({ ...f, origin: "웹1구역" });
for (const f of WEB_FACILITIES) facilities.push({ ...f, origin: "웹2구역" });

// ── 4. 고아 활동 (수집했지만 화면에 안 붙는 것) ──
const feSportKeys = new Map([...feSports.keys()].map((n) => [key(n), n]));
const orphan = new Map();
for (const f of facilities) {
  if (feSportKeys.has(key(f.activity))) continue;
  if (!orphan.has(f.activity)) orphan.set(f.activity, []);
  orphan.get(f.activity).push(`${f.name}(${f.islandName})`);
}
for (const [act, list] of orphan) {
  fail(
    `[화면에 안 나오는 활동] "${act}" ${list.length}곳 — sports.ts 에 같은 이름의 종목이 없음\n` +
      `    예: ${list.slice(0, 3).join(", ")}`,
  );
}

// ── 5. 시설이 없는 종목 ──
const countBySport = new Map([...feSports.keys()].map((n) => [n, 0]));
for (const f of facilities) {
  const name = feSportKeys.get(key(f.activity));
  if (name) countBySport.set(name, countBySport.get(name) + 1);
}
const empty = [...countBySport].filter(([, n]) => n === 0).map(([n]) => n);
if (empty.length) notes.push(`시설 0곳인 종목 ${empty.length}개: ${empty.join(", ")}`);

// ── 6. 카테고리 교차 확인 (활동이 속한 카테고리 ≠ 프론트 종목의 카테고리) ──
const activityCategory = new Map();
for (const [cat, acts] of Object.entries(ACTIVITY_TAXONOMY)) {
  for (const a of acts) activityCategory.set(key(a), CATEGORY_KEY[cat]);
}
for (const [name, feCat] of feSports) {
  const beCat = activityCategory.get(key(name));
  if (!beCat) {
    notes.push(`종목 "${name}" 은 BE 분류 목록(ACTIVITY_TAXONOMY)에 없음 — 자동 분류가 안 됨`);
  } else if (beCat !== feCat) {
    fail(`[카테고리 어긋남] "${name}" — 프론트 ${feCat} / BE ${beCat}`);
  }
}

// ── 7. Prisma enum 과의 정합성 (시드가 깨지지 않도록) ──
{
  const schema = readFileSync(PRISMA_SCHEMA, "utf8");
  const block = schema.match(/enum LeisureActivity \{([^]*?)^\}/m)?.[1] ?? "";
  const dbEnum = new Set(
    [...block.matchAll(/^ {2}([A-Z_]+)/gm)].map((m) => m[1]),
  );

  const taxonomy = [...Object.values(ACTIVITY_TAXONOMY).flat(), "기타"];
  for (const act of taxonomy) {
    const value = ACTIVITY_ENUM[act];
    if (!value) {
      fail(`[enum 매핑 없음] 활동 "${act}" → activity.mjs 의 ACTIVITY_ENUM 에 추가 필요`);
    } else if (!dbEnum.has(value)) {
      fail(`[스키마에 없는 enum] "${act}" → ${value} 가 schema.prisma 의 LeisureActivity 에 없음`);
    }
  }

  const used = new Set(taxonomy.map((a) => ACTIVITY_ENUM[a]).filter(Boolean));
  for (const value of dbEnum) {
    if (!used.has(value)) {
      fail(`[쓰이지 않는 enum] LeisureActivity.${value} 에 대응하는 활동이 없음`);
    }
  }
}

// ── 8. 모르는 섬 이름 ──
// 프론트 sports-region.ts 의 resolveSportIslandBaseName 과 같은 규칙으로 본다
const ISLAND_ALIASES = { 신시모도: "신도", 볼음도: "강화도" };
const knownByLength = [...feIslands].sort((a, b) => b.length - a.length);
const resolvesToKnownIsland = (label) => {
  const base = ISLAND_ALIASES[label] ?? label;
  if (feIslands.has(base)) return true;
  return knownByLength.some((nm) => label.includes(nm) || base.startsWith(nm));
};

const unknownIslands = new Map();
for (const f of facilities) {
  if (resolvesToKnownIsland(f.islandName)) continue;
  if (!unknownIslands.has(f.islandName)) unknownIslands.set(f.islandName, 0);
  unknownIslands.set(f.islandName, unknownIslands.get(f.islandName) + 1);
}
for (const [nm, n] of unknownIslands) {
  notes.push(`섬 "${nm}" (${n}곳) 이 어떤 섬으로도 해석되지 않음 — 색/권역이 회색 폴백`);
}

// ── 결과 ──
const out = [];
out.push(`시설 ${facilities.length}곳 · 프론트 종목 ${feSports.size}개 · 카테고리 ${feCategoryKeys.length}개`);
out.push("");
if (problems.length) {
  out.push(`문제 ${problems.length}건`);
  for (const p of problems) out.push(`  - ${p}`);
} else {
  out.push("문제 없음");
}
if (notes.length) {
  out.push("");
  out.push("참고");
  for (const n of notes) out.push(`  - ${n}`);
}
console.log(out.join("\n"));
process.exit(problems.length ? 1 : 0);
