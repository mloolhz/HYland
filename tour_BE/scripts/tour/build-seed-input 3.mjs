/**
 * 레저스포츠 3개 출처 병합 → 시드 입력(reports/leisure-candidates/seed-input.json)
 *
 *   ① 관광공사 API (reports/leisure-candidates/all-candidates.json) — 섬 매핑 확정분만
 *   ② 웹 조사 1구역 (web-research1-data.mjs)
 *   ③ 웹 조사 2구역 (web-research-data.mjs)
 *
 * 예전에는 프론트 정적 데이터(tour_FE/src/data/leisure-facilities.ts)도 같이
 * 만들었으나, 프론트가 GET /leisure-sports 를 쓰게 되면서 그 출력은 없앴다.
 * 이제 이 파일의 결과는 DB 시드(prisma/seed-leisure.ts)의 입력으로만 쓰인다.
 *
 * 이 스크립트 자체는 DB에 붙지 않는다.
 * 실행: node scripts/tour/build-seed-input.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { WEB_FACILITIES } from "./web-research-data.mjs";
import { WEB_FACILITIES_G1 } from "./web-research1-data.mjs";
import { ACTIVITY_ENUM } from "./lib/activity.mjs";

const SRC = "reports/leisure-candidates/all-candidates.json";
const DEST = "reports/leisure-candidates/seed-input.json";

/** HYland 카테고리 → sport_categories.id */
const CATEGORY_KEY = { SEA: "water", LAND: "land", EXPERIENCE: "exp", HEALING: "heal" };

/** 배포 시 mixed content 로 차단되지 않도록 이미지 주소를 https 로 올린다 */
const https = (url) => (url ? url.replace(/^http:\/\//, "https://") : null);

/** 주소 정확도 추정 — 번지·건물번호가 있으면 EXACT, 리·동까지면 VILLAGE */
const guessAddrLevel = (addr) => {
  if (!addr) return "UNKNOWN";
  return /\d/.test(addr) ? "EXACT" : "VILLAGE";
};

const full = [];

// ── ① 관광공사 API ──
for (const f of JSON.parse(readFileSync(SRC, "utf8"))) {
  if (f.islandStatus !== "MATCHED") continue;
  if (f.activity === "기타") continue; // 종목에 붙일 수 없는 미분류
  full.push({
    id: `tour-${f.sources[0].externalId}`,
    name: f.name,
    activity: f.activity,
    activityId: ACTIVITY_ENUM[f.activity] ?? "ETC",
    category: CATEGORY_KEY[f.category],
    islandId: f.islandId,
    islandName: f.islandName,
    address: f.address || "",
    addressLevel: guessAddrLevel(f.address),
    lat: f.lat ?? null,
    lng: f.lng ?? null,
    tel: f.tel || null,
    homepage: f.homepage || null,
    photo: https(f.imageUrl),
    origin: "관광공사",
    // 관광공사 수집분은 아직 눈으로 확인하지 않았다
    verification: "UNVERIFIED",
    sources: f.sources.map((src) => ({
      sourceType: src.sourceType,
      externalId: src.externalId,
      rawCategory: src.rawCategory ?? null,
      sourceName: null,
    })),
  });
}

// ── ②③ 웹 조사 ──
const web = (list, prefix, origin) =>
  list.forEach((f, i) =>
    full.push({
      id: `${prefix}-${i}`,
      name: f.name,
      activity: f.activity,
      activityId: ACTIVITY_ENUM[f.activity] ?? "ETC",
      category: CATEGORY_KEY[f.category],
      islandId: f.islandId,
      islandName: f.islandName,
      address: f.address || "",
      addressLevel: f.addrLevel ?? "UNKNOWN",
      lat: null,
      lng: null,
      tel: null,
      homepage: null,
      photo: null,
      origin,
      // 직접 조사하며 주소까지 확인한 건들이라 검증 완료로 본다
      verification: "VERIFIED",
      sources: [
        {
          sourceType: "WEB_RESEARCH",
          externalId: `${prefix}-${i}`,
          rawCategory: null,
          sourceName: f.source ?? null,
        },
      ],
    }),
  );

web(WEB_FACILITIES_G1, "web1", "웹 조사");
web(WEB_FACILITIES, "web2", "웹 조사");

full.sort((a, b) => a.islandName.localeCompare(b.islandName) || a.name.localeCompare(b.name));

writeFileSync(DEST, JSON.stringify(full, null, 2), "utf8");

// ── 결과 요약 ──
const count = (key) =>
  full.reduce((acc, f) => ((acc[f[key]] = (acc[f[key]] ?? 0) + 1), acc), {});

const lines = [
  `시드 입력 생성: ${DEST}`,
  `총 ${full.length}곳 · 출처 행 ${full.reduce((n, f) => n + f.sources.length, 0)}건`,
  "",
  `검증 상태: ${JSON.stringify(count("verification"))}`,
  `주소 정확도: ${JSON.stringify(count("addressLevel"))}`,
  `카테고리: ${JSON.stringify(count("category"))}`,
];
writeFileSync("_seed-input.txt", lines.join("\n"), "utf8");
