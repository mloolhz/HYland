/**
 * 웹 조사 데이터 → CSV + 커버리지 리포트
 * DB는 건드리지 않는다.
 *
 * 실행: node scripts/tour/build-web-csv.mjs
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { WEB_FACILITIES, REQUIRED_ACTIVITIES, TARGET_ISLANDS } from "./web-research-data.mjs";

const OUT = "reports/leisure-candidates";
const CAT_LABEL = {
  SEA: "해상레저",
  LAND: "육상레저",
  EXPERIENCE: "체험",
  HEALING: "힐링",
  UNIQUE: "이색",
};

const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// ── 1) 웹 조사 CSV ──
const header = ["시설명", "카테고리", "활동", "섬", "주소", "주소정확도", "출처", "비고"];
const rows = WEB_FACILITIES.sort(
  (a, b) => a.islandName.localeCompare(b.islandName) || a.name.localeCompare(b.name),
).map((f) =>
  [
    f.name,
    CAT_LABEL[f.category],
    f.activity,
    f.islandName,
    f.address,
    f.addrLevel,
    f.source,
    f.note,
  ]
    .map(esc)
    .join(","),
);
writeFileSync(
  `${OUT}/web-research2.csv`,
  "﻿" + [header.map(esc).join(","), ...rows].join("\n"),
  "utf8",
);

// ── 2) 활동 커버리지 점검 ──
const covered = new Set(WEB_FACILITIES.map((f) => f.activity));

// 기존 API 후보(candidates)에서 대상 섬에 이미 있는 활동도 반영
let apiActivities = new Map(); // activity → [시설명]
const apiPath = `${OUT}/all-candidates.json`;
if (existsSync(apiPath)) {
  const api = JSON.parse(readFileSync(apiPath, "utf8"));
  const targetNames = new Set(Object.values(TARGET_ISLANDS));
  for (const f of api) {
    if (!targetNames.has(f.islandName)) continue;
    const n = f.name;
    const hit = (act, re) => {
      if (re.test(n)) {
        if (!apiActivities.has(act)) apiActivities.set(act, []);
        apiActivities.get(act).push(`${n}(${f.islandName})`);
      }
    };
    hit("낚시", /낚시|좌대/);
    hit("골프", /골프|CC|GC/);
    hit("수련단체활동", /수련원|교육원|학습관/);
    hit("온천-스파", /스파|씨메르|온천/);
    hit("캠핑", /캠핑|카라반|글램/);
    hit("모노레일", /모노레일/);
    hit("루지", /루지/);
    hit("산림욕", /삼림욕|산림욕/);
  }
}

const lines = [];
lines.push("# 레저스포츠 활동 커버리지 (대상 10개 섬)\n");
lines.push(`- 웹 조사 시설: **${WEB_FACILITIES.length}곳**`);
lines.push(`- 대상 섬: ${Object.values(TARGET_ISLANDS).join(", ")}\n`);

const missing = [];
for (const [cat, acts] of Object.entries(REQUIRED_ACTIVITIES)) {
  lines.push(`\n## ${CAT_LABEL[cat]}`);
  lines.push("| 활동 | 상태 | 확보한 곳 |");
  lines.push("| --- | --- | --- |");
  for (const act of acts) {
    const web = WEB_FACILITIES.filter((f) => f.activity === act);
    const api = apiActivities.get(act) ?? [];
    const total = web.length + api.length;
    const names = [
      ...web.map((f) => `${f.name}(${f.islandName})`),
      ...api.slice(0, 3),
    ];
    if (total === 0) {
      missing.push(`${CAT_LABEL[cat]}/${act}`);
      lines.push(`| ${act} | ❌ 없음 | — |`);
    } else {
      const mark = total >= 2 ? "✅" : "⚠️ 1곳";
      lines.push(`| ${act} | ${mark} | ${names.slice(0, 4).join(", ")}${api.length > 3 ? ` 외 ${api.length - 3}곳` : ""} |`);
    }
  }
}

lines.push("\n## 섬별 웹 조사 시설 수");
lines.push("| 섬 | 시설 수 |");
lines.push("| --- | ---: |");
for (const [id, nm] of Object.entries(TARGET_ISLANDS)) {
  lines.push(`| ${nm} | ${WEB_FACILITIES.filter((f) => f.islandId === id).length} |`);
}

if (missing.length) {
  lines.push("\n## ❌ 확보하지 못한 활동");
  for (const m of missing) lines.push(`- ${m}`);
}

writeFileSync(`${OUT}/web-coverage.md`, lines.join("\n"), "utf8");

console.log(`웹 조사 CSV: ${OUT}/web-research2.csv (${WEB_FACILITIES.length}곳)`);
console.log(`커버리지 리포트: ${OUT}/web-coverage.md`);
if (missing.length) console.log(`미확보 활동 ${missing.length}개: ${missing.join(", ")}`);
