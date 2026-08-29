/**
 * 웹 조사 데이터 → 구역별 CSV + 활동 커버리지 리포트
 * DB는 건드리지 않는다.
 *
 * 커버리지는 세 출처를 모두 본다.
 *   ① candidates (관광공사 API, 18개 섬 전체)
 *   ② web-research1 (1구역: 백령·대청 / 연평 / 강화·교동·석모 / 북도)
 *   ③ web-research2 (2구역: 영종·무의 / 영흥 / 자월·승봉·대이작 / 덕적·소야·문갑·굴업)
 *
 * 실행: node scripts/tour/build-web-csv.mjs
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { WEB_FACILITIES, REQUIRED_ACTIVITIES } from "./web-research-data.mjs";
import { WEB_FACILITIES_G1 } from "./web-research1-data.mjs";
import { resolveActivity } from "./lib/activity.mjs";

const OUT = "reports/leisure-candidates";
const CAT_LABEL = {
  SEA: "해상레저",
  LAND: "육상레저",
  EXPERIENCE: "체험",
  HEALING: "힐링",
};

/** 구역별 섬 */
const REGION1 = ["백령도", "대청도", "연평도", "강화도", "교동도", "석모도", "장봉도", "신도·시도·모도"];
const REGION2 = ["영종도", "무의도", "영흥도", "자월도", "승봉도", "대이작도", "덕적도", "소야도", "문갑도", "굴업도"];

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// ── 1) 웹 조사 CSV (구역별) ──
const header = ["시설명", "카테고리", "활동", "섬", "주소", "주소정확도", "출처", "비고"];

function writeCsv(file, list) {
  const rows = list
    .slice()
    .sort((a, b) => a.islandName.localeCompare(b.islandName) || a.name.localeCompare(b.name))
    .map((f) =>
      [f.name, CAT_LABEL[f.category], f.activity, f.islandName, f.address, f.addrLevel, f.source, f.note]
        .map(esc)
        .join(","),
    );
  writeFileSync(`${OUT}/${file}`, "﻿" + [header.map(esc).join(","), ...rows].join("\n"), "utf8");
}

writeCsv("web-research1.csv", WEB_FACILITIES_G1);
writeCsv("web-research2.csv", WEB_FACILITIES);

// ── 2) 세 출처를 합쳐 활동 커버리지 점검 ──
/** {activity: {G1:[], G2:[], API:[]}} */
const byActivity = new Map();
const add = (src, activity, label) => {
  if (!byActivity.has(activity)) byActivity.set(activity, { G1: [], G2: [], API: [] });
  byActivity.get(activity)[src].push(label);
};

for (const f of WEB_FACILITIES_G1) add("G1", f.activity, `${f.name}(${f.islandName})`);
for (const f of WEB_FACILITIES) add("G2", f.activity, `${f.name}(${f.islandName})`);

// candidates — 섬 매핑이 확정된 것만, 활동은 같은 분류기로 다시 판정
const apiPath = `${OUT}/all-candidates.json`;
let apiTotal = 0;
if (existsSync(apiPath)) {
  for (const f of JSON.parse(readFileSync(apiPath, "utf8"))) {
    if (f.islandStatus !== "MATCHED" || !f.islandName) continue;
    apiTotal += 1;
    const act = f.activity ?? resolveActivity(f.name, f.address ?? "").activity;
    add("API", act, `${f.name}(${f.islandName})`);
  }
}

/** 섬별 시설 수 (세 출처 합산) */
const islandCount = new Map();
const bump = (nm) => islandCount.set(nm, (islandCount.get(nm) ?? 0) + 1);
for (const f of WEB_FACILITIES_G1) bump(f.islandName);
for (const f of WEB_FACILITIES) bump(f.islandName);
if (existsSync(apiPath)) {
  for (const f of JSON.parse(readFileSync(apiPath, "utf8"))) {
    if (f.islandStatus === "MATCHED" && f.islandName) bump(f.islandName);
  }
}

const lines = [];
lines.push("# 레저스포츠 활동 커버리지 (인천 18개 섬 전체)\n");
lines.push(`- 관광공사 API(candidates): **${apiTotal}곳** (섬 매핑 확정분)`);
lines.push(`- 웹 조사 1구역: **${WEB_FACILITIES_G1.length}곳** — ${REGION1.join(", ")}`);
lines.push(`- 웹 조사 2구역: **${WEB_FACILITIES.length}곳** — ${REGION2.join(", ")}`);
lines.push(`- 합계: **${apiTotal + WEB_FACILITIES_G1.length + WEB_FACILITIES.length}곳**\n`);

const missing = [];
for (const [cat, acts] of Object.entries(REQUIRED_ACTIVITIES)) {
  lines.push(`\n## ${CAT_LABEL[cat]}`);
  lines.push("| 활동 | 상태 | 1구역 | 2구역 | API | 예시 |");
  lines.push("| --- | --- | ---: | ---: | ---: | --- |");
  for (const act of acts) {
    const e = byActivity.get(act) ?? { G1: [], G2: [], API: [] };
    const total = e.G1.length + e.G2.length + e.API.length;
    if (total === 0) {
      missing.push(`${CAT_LABEL[cat]}/${act}`);
      lines.push(`| ${act} | 없음 | 0 | 0 | 0 | — |`);
    } else {
      const mark = total >= 2 ? "충분" : "1곳";
      const sample = [...e.G1, ...e.G2, ...e.API].slice(0, 3).join(", ");
      lines.push(`| ${act} | ${mark} | ${e.G1.length} | ${e.G2.length} | ${e.API.length} | ${sample} |`);
    }
  }
}

// 분류 목록에 없는 활동(기타 등)도 참고로 표시
const known = new Set(Object.values(REQUIRED_ACTIVITIES).flat());
const extra = [...byActivity.entries()].filter(([a]) => !known.has(a));
if (extra.length) {
  lines.push("\n## 활동 목록 밖 (검수 대상)");
  lines.push("| 활동 | 곳 | 예시 |");
  lines.push("| --- | ---: | --- |");
  for (const [a, e] of extra) {
    const all = [...e.G1, ...e.G2, ...e.API];
    lines.push(`| ${a} | ${all.length} | ${all.slice(0, 3).join(", ")} |`);
  }
}

lines.push("\n## 섬별 시설 수 (세 출처 합산)");
lines.push("| 구역 | 섬 | 시설 수 |");
lines.push("| --- | --- | ---: |");
for (const nm of REGION1) lines.push(`| 1구역 | ${nm} | ${islandCount.get(nm) ?? 0} |`);
for (const nm of REGION2) lines.push(`| 2구역 | ${nm} | ${islandCount.get(nm) ?? 0} |`);

if (missing.length) {
  lines.push("\n## 확보하지 못한 활동");
  for (const m of missing) lines.push(`- ${m}`);
}

writeFileSync(`${OUT}/web-coverage.md`, lines.join("\n"), "utf8");

console.log(`1구역: ${OUT}/web-research1.csv (${WEB_FACILITIES_G1.length}곳)`);
console.log(`2구역: ${OUT}/web-research2.csv (${WEB_FACILITIES.length}곳)`);
console.log(`커버리지(3개 출처 합산): ${OUT}/web-coverage.md`);
console.log(missing.length ? `미확보 활동 ${missing.length}개: ${missing.join(", ")}` : "미확보 활동 없음");
