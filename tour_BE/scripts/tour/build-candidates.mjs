/**
 * 3개 API 원본 → 레저스포츠 통합 후보 보고서
 * DB는 건드리지 않는다. reports/leisure-candidates/ 아래 파일만 생성.
 *
 * 실행: node scripts/tour/build-candidates.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { classifyTourSport, ISLANDS } from "../lib/tour-island-mapping.mjs";
import { classifyCategory, CATEGORIES } from "./lib/category.mjs";

const RAW = "reports/leisure-candidates/raw";
const OUT = "reports/leisure-candidates";
const read = (f) => JSON.parse(readFileSync(`${RAW}/${f}`, "utf8"));

const norm = (v = "") =>
  String(v).normalize("NFC").replace(/[\s·•ㆍ∙‧・\-_.(),]/g, "").toLowerCase();

/** 레저 후보로 볼 중분류 */
const LEISURE_MCLS = new Set(["레저스포츠", "체험관광"]);

// ────────────────────────── 1) 소스별 정규화 ──────────────────────────
const candidates = [];

/** ① 국문 관광정보 (contentTypeId=28) — 레포츠 기본 데이터 */
for (const it of read("tour-content.json")) {
  candidates.push({
    sourceType: "TOUR_CONTENT",
    externalId: String(it.contentid),
    name: String(it.title ?? "").trim(),
    address: [it.addr1, it.addr2].filter(Boolean).join(" ").trim(),
    lat: it.mapy ? Number(it.mapy) : null,
    lng: it.mapx ? Number(it.mapx) : null,
    tel: it.tel || null,
    imageUrl: it.firstimage || null,
    rawCategory: [it.lclsSystm1, it.lclsSystm2, it.lclsSystm3].filter(Boolean).join("/"),
    scls: "",
    district: null,
  });
}

/** ② 기초지자체 중심 관광지 — 레저스포츠·체험관광 중분류만 */
for (const it of read("local-hub.json")) {
  if (!LEISURE_MCLS.has(it.hubCtgryMclsNm)) continue;
  candidates.push({
    sourceType: "LOCAL_HUB",
    externalId: String(it.hubTatsCd),
    name: String(it.hubTatsNm ?? "").trim(),
    address: "",
    lat: it.mapY ? Number(it.mapY) : null,
    lng: it.mapX ? Number(it.mapX) : null,
    tel: null,
    imageUrl: null,
    rawCategory: `${it.hubCtgryLclsNm}/${it.hubCtgryMclsNm}`,
    scls: "",
    district: it.signguNm,
  });
}

/** ③ 관광지별 연관 관광지 — 연관 대상 기준 중복 제거 후 레저만 */
const relatedSeen = new Map();
for (const it of read("related-tourism.json")) {
  if (!LEISURE_MCLS.has(it.rlteCtgryMclsNm)) continue;
  const key = String(it.rlteTatsCd);
  if (relatedSeen.has(key)) {
    relatedSeen.get(key).linkedFrom.add(it.tAtsNm);
    continue;
  }
  relatedSeen.set(key, {
    sourceType: "RELATED_TOURISM",
    externalId: key,
    name: String(it.rlteTatsNm ?? "").trim(),
    address: "",
    lat: null,
    lng: null, // 연관관광지 API는 좌표를 제공하지 않음
    tel: null,
    imageUrl: null,
    rawCategory: `${it.rlteCtgryLclsNm}/${it.rlteCtgryMclsNm}/${it.rlteCtgrySclsNm}`,
    scls: it.rlteCtgrySclsNm ?? "",
    district: it.rlteSignguNm,
    linkedFrom: new Set([it.tAtsNm]),
  });
}
for (const v of relatedSeen.values()) {
  candidates.push({ ...v, linkedFrom: [...v.linkedFrom] });
}

// ────────────────────────── 2) 카테고리 + 섬 매핑 ──────────────────────────
for (const c of candidates) {
  const cat = classifyCategory(c.name, `${c.address} ${c.rawCategory}`, c.scls);
  c.category = cat.category;
  c.categoryLabel = CATEGORIES[cat.category];
  c.categoryMethod = cat.method;
  c.categoryMatched = cat.matched;
  c.nonLeisure = cat.nonLeisure;

  // 섬 매핑: 주소가 없으면 시군구명을 보조 텍스트로 사용
  const mapped = classifyTourSport({
    title: c.name,
    addr1: c.address || c.district || "",
    addr2: "",
  });
  c.islandStatus = mapped.status;
  c.islandId = mapped.islandId ?? null;
  c.islandName = mapped.islandId ? ISLANDS[mapped.islandId].name : null;
  c.islandReason = mapped.reason;
  c.islandCandidates = mapped.candidates ?? [];
}

// ────────────────────────── 3) 중복 제거 (시설 단위 통합) ──────────────────────────
const facilities = [];
const byName = new Map();

const distM = (a, b) =>
  a.lat && a.lng && b.lat && b.lng
    ? Math.hypot(a.lat - b.lat, (a.lng - b.lng) * Math.cos((a.lat * Math.PI) / 180)) * 111000
    : Infinity;

for (const c of candidates) {
  const nkey = norm(c.name);
  let target = byName.get(nkey);

  // 이름이 같아도 좌표가 1km 넘게 떨어지면 다른 시설로 본다.
  // 단 한쪽이라도 좌표가 없으면(연관관광지 API는 좌표 미제공) 거리를 알 수 없으므로
  // 이름 일치를 신뢰해 같은 시설로 묶는다.
  if (target) {
    const d = distM(target, c);
    if (Number.isFinite(d) && d > 1000) target = null;
  }

  if (!target) {
    target = {
      name: c.name,
      category: c.category,
      categoryLabel: c.categoryLabel,
      categoryMethod: c.categoryMethod,
      categoryMatched: c.categoryMatched,
      nonLeisure: c.nonLeisure,
      islandId: c.islandId,
      islandName: c.islandName,
      islandStatus: c.islandStatus,
      islandReason: c.islandReason,
      islandCandidates: c.islandCandidates,
      address: c.address,
      lat: c.lat,
      lng: c.lng,
      tel: c.tel,
      imageUrl: c.imageUrl,
      sources: [],
      linkedFrom: [],
    };
    facilities.push(target);
    byName.set(nkey, target);
  }

  // 더 정보가 풍부한 값으로 보강
  if (!target.address && c.address) target.address = c.address;
  if (target.lat == null && c.lat != null) {
    target.lat = c.lat;
    target.lng = c.lng;
  }
  if (!target.tel && c.tel) target.tel = c.tel;
  if (!target.imageUrl && c.imageUrl) target.imageUrl = c.imageUrl;

  // 주소가 생기면 섬 매핑을 다시 시도 (정확도 상승)
  if (c.address && target.islandStatus !== "MATCHED") {
    const re = classifyTourSport({ title: target.name, addr1: c.address, addr2: "" });
    if (re.status === "MATCHED") {
      target.islandId = re.islandId;
      target.islandName = ISLANDS[re.islandId].name;
      target.islandStatus = re.status;
      target.islandReason = re.reason;
    }
  }

  target.sources.push({
    sourceType: c.sourceType,
    externalId: c.externalId,
    rawCategory: c.rawCategory,
    district: c.district,
  });
  if (c.linkedFrom) target.linkedFrom.push(...c.linkedFrom);
}

// ────────────────────────── 4) 판정 ──────────────────────────
for (const f of facilities) {
  f.sourceTypes = [...new Set(f.sources.map((s) => s.sourceType))];
  f.isDuplicate = f.sources.length > 1;
  f.linkedFrom = [...new Set(f.linkedFrom)];

  if (f.islandStatus === "MAINLAND") {
    f.verdict = "EXCLUDED";
    f.verdictReason = "인천 본토 — 섬 서비스 대상 아님";
    f.verificationStatus = "EXCLUDED";
  } else if (f.islandStatus === "OUT_OF_SCOPE") {
    f.verdict = "EXCLUDED";
    f.verdictReason = f.islandReason;
    f.verificationStatus = "EXCLUDED";
  } else if (f.nonLeisure) {
    f.verdict = "REVIEW";
    f.verdictReason = `레저 시설 여부 불명확(${f.categoryMatched ?? "숙박·체육시설 계열"}) — 수동 검수 필요`;
    f.verificationStatus = "UNVERIFIED";
  } else if (f.islandStatus === "MATCHED") {
    f.verdict = f.sourceTypes.includes("TOUR_CONTENT") ? "REGISTER" : "REVIEW";
    f.verdictReason = f.sourceTypes.includes("TOUR_CONTENT")
      ? "국문관광정보 기반 — 등록 후보"
      : "보조 출처에서만 발견 — 실운영 확인 필요";
    f.verificationStatus = "UNVERIFIED";
  } else {
    f.verdict = "REVIEW";
    f.verdictReason = f.islandReason;
    f.verificationStatus = "UNVERIFIED";
  }
}

// ── 4-b) 통합(MERGE) 후보 탐지: 같은 주소 또는 150m 이내 근접 시설 ──
// 둘레길·나들길처럼 출발점 주소를 공유하는 "코스"는 서로 다른 상품이므로 통합 대상에서 뺀다.
const isCourse = (f) => /코스|나들길|둘레길|누리길|탐방로|산책로/.test(f.name);
const addrKey = (f) => (f.address && !isCourse(f) ? norm(f.address) : null);
const addrGroups = new Map();
for (const f of facilities) {
  const k = addrKey(f);
  if (!k) continue;
  if (!addrGroups.has(k)) addrGroups.set(k, []);
  addrGroups.get(k).push(f);
}
for (const group of addrGroups.values()) {
  if (group.length < 2) continue;
  for (const f of group) {
    f.mergeWith = group.filter((g) => g !== f).map((g) => g.name);
    f.mergeReason = "동일 주소";
  }
}
// 주소가 없거나 다르지만 좌표가 매우 가까운 경우
for (let i = 0; i < facilities.length; i++) {
  for (let j = i + 1; j < facilities.length; j++) {
    const a = facilities[i];
    const b = facilities[j];
    if (a.mergeWith?.includes(b.name)) continue;
    if (isCourse(a) || isCourse(b)) continue;
    if (distM(a, b) <= 150) {
      (a.mergeWith ??= []).push(b.name);
      (b.mergeWith ??= []).push(a.name);
      a.mergeReason ??= "좌표 150m 이내";
      b.mergeReason ??= "좌표 150m 이내";
    }
  }
}
for (const f of facilities) {
  f.mergeWith = [...new Set(f.mergeWith ?? [])];
  if (f.mergeWith.length && f.verdict === "REGISTER") {
    f.verdict = "MERGE";
    f.verdictReason = `${f.mergeReason} — ${f.mergeWith.join(", ")} 와 통합 검토`;
  }
}

// ────────────────────────── 5) 산출물 ──────────────────────────
const bySource = (t) => facilities.filter((f) => f.sourceTypes.includes(t)).length;
const count = (arr, key) =>
  arr.reduce((acc, f) => {
    const k = f[key] ?? "(없음)";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

const summary = {
  baseYm: process.env.TOUR_BASE_YM ?? "202607",
  generatedAt: new Date().toISOString(),
  rawCounts: {
    tourContent: read("tour-content.json").length,
    localHub: read("local-hub.json").length,
    relatedRelations: read("related-tourism.json").length,
  },
  leisureCandidatesBeforeDedup: candidates.length,
  facilitiesAfterDedup: facilities.length,
  bySourceType: {
    TOUR_CONTENT: bySource("TOUR_CONTENT"),
    LOCAL_HUB: bySource("LOCAL_HUB"),
    RELATED_TOURISM: bySource("RELATED_TOURISM"),
  },
  multiSourceFacilities: facilities.filter((f) => f.isDuplicate).length,
  mergeCandidates: facilities.filter((f) => f.mergeWith.length).length,
  byCategory: count(facilities, "categoryLabel"),
  byIslandStatus: count(facilities, "islandStatus"),
  byVerdict: count(facilities, "verdict"),
  byIsland: count(facilities.filter((f) => f.islandName), "islandName"),
};

writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2), "utf8");
writeFileSync(`${OUT}/all-candidates.json`, JSON.stringify(facilities, null, 2), "utf8");

/** CSV (엑셀 한글 깨짐 방지 BOM) */
const csvEsc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const header = [
  "시설명", "카테고리", "섬", "섬매핑상태", "주소", "위도", "경도",
  "출처", "출처수", "중복여부", "통합후보", "검증상태", "판정", "판정사유", "연관관광지",
];
const rows = facilities
  .slice()
  .sort(
    (a, b) =>
      String(a.islandName ?? "힣").localeCompare(String(b.islandName ?? "힣")) ||
      a.name.localeCompare(b.name),
  )
  .map((f) =>
    [
      f.name, f.categoryLabel, f.islandName ?? "", f.islandStatus, f.address,
      f.lat ?? "", f.lng ?? "", f.sourceTypes.join("+"), f.sources.length,
      f.isDuplicate ? "중복통합" : "단일", f.mergeWith.join(" / "), f.verificationStatus, f.verdict,
      f.verdictReason, f.linkedFrom.slice(0, 3).join(" / "),
    ]
      .map(csvEsc)
      .join(","),
  );
writeFileSync(
  `${OUT}/candidates.csv`,
  "﻿" + [header.map(csvEsc).join(","), ...rows].join("\n"),
  "utf8",
);


/** 마크다운 요약 보고서 */
const tbl = (obj) =>
  ["| 항목 | 건수 |", "| --- | ---: |", ...Object.entries(obj).map(([k, v]) => `| ${k} | ${v} |`)].join("\n");

const listOf = (pred, limit = 100) =>
  facilities
    .filter(pred)
    .sort((a, b) => String(a.islandName ?? "").localeCompare(String(b.islandName ?? "")) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((f) => `| ${f.name} | ${f.categoryLabel} | ${f.islandName ?? "-"} | ${f.sourceTypes.join("+")} | ${f.verdictReason} |`)
    .join("\n");

const listHead = "| 시설명 | 카테고리 | 섬 | 출처 | 사유 |\n| --- | --- | --- | --- | --- |";

const md = `# 인천 섬 레저스포츠 통합 후보 보고서

- 기준연월: **${summary.baseYm}** (지자체·연관 API)
- 생성: ${summary.generatedAt}
- 원본: 국문관광정보 ${summary.rawCounts.tourContent}건 / 지자체 중심관광지 ${summary.rawCounts.localHub}건 / 연관관광지 관계 ${summary.rawCounts.relatedRelations}건
- **DB는 수정하지 않았습니다. 이 보고서는 검수용 파일 산출물입니다.**

## 1. 수집·정제 결과
${tbl({
  "레저 후보 (중복제거 전)": summary.leisureCandidatesBeforeDedup,
  "시설 (중복제거 후)": summary.facilitiesAfterDedup,
  "다중 출처에서 발견": summary.multiSourceFacilities,
  "통합 검토 대상": summary.mergeCandidates,
})}

## 2. 출처별 기여
${tbl(summary.bySourceType)}

## 3. 카테고리 분포 (HYland 5분류)
${tbl(summary.byCategory)}

## 4. 섬 매핑 결과
${tbl(summary.byIslandStatus)}

### 섬별 시설 수
${tbl(summary.byIsland)}

## 5. 판정 요약
${tbl(summary.byVerdict)}

- **REGISTER**: 섬 매핑 완료 + 국문관광정보 기반 → 등록 후보
- **MERGE**: 동일 주소·근접 좌표 → 하나의 시설로 통합 검토
- **REVIEW**: 보조 출처에서만 발견했거나 레저 여부·섬 판정이 불확실 → 수동 검수
- **EXCLUDED**: 인천 본토 또는 18개 서비스 섬 대상 외

## 6. 등록 후보 (REGISTER)
${listHead}
${listOf((f) => f.verdict === "REGISTER")}

## 7. 통합 검토 (MERGE)
${listHead}
${listOf((f) => f.verdict === "MERGE")}

## 8. 수동 검수 필요 (REVIEW)
${listHead}
${listOf((f) => f.verdict === "REVIEW")}

## 9. 제외 (EXCLUDED)
${listHead}
${listOf((f) => f.verdict === "EXCLUDED")}
`;
writeFileSync(`${OUT}/report.md`, md, "utf8");

console.log("후보 보고서 생성 완료");
console.table(summary.bySourceType);
console.table(summary.byCategory);
console.table(summary.byVerdict);
console.log(`총 후보(중복제거 전): ${summary.leisureCandidatesBeforeDedup}`);
console.log(`시설(중복제거 후):   ${summary.facilitiesAfterDedup}`);
console.log(`다중출처 시설:       ${summary.multiSourceFacilities}`);
