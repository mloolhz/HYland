/**
 * 관광공사 3개 API 원본 수집 → reports/leisure-candidates/raw/*.json
 * DB는 건드리지 않는다. 파일로만 저장.
 *
 * 실행: node scripts/tour/collect.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import "dotenv/config";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ .env 의 TOUR_API_KEY 가 비어있어요.");
  process.exit(1);
}
const SK = KEY.includes("%") ? KEY : encodeURIComponent(KEY);

const RAW = "reports/leisure-candidates/raw";
mkdirSync(RAW, { recursive: true });

/** 기준 연월 (지자체/연관 API 전용) */
export const BASE_YM = process.env.TOUR_BASE_YM ?? "202607";

/** 인천 섬이 속한 시군구 (2026 행정구역 개편 반영) */
const ISLAND_DISTRICTS = [
  { cd: "28155", nm: "영종구" }, // 영종도, 무의도
  { cd: "28710", nm: "강화군" }, // 강화도, 교동도, 석모도
  { cd: "28720", nm: "옹진군" }, // 백령/대청/연평/북도/자월/덕적/영흥
];

const common = "MobileOS=ETC&MobileApp=HYland&_type=json";

async function getJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  if (text.trim().startsWith("<")) throw new Error(`XML 오류 응답: ${text.slice(0, 200)}`);
  return JSON.parse(text);
}

/** items.item 을 항상 배열로 */
function toArray(json) {
  const items = json?.response?.body?.items;
  if (!items || items === "") return [];
  const item = items.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/** 페이지 전체 순회 수집 */
async function collectAll(baseUrl, label, perPage = 100) {
  const first = await getJson(`${baseUrl}&numOfRows=1&pageNo=1`);
  const total = first?.response?.body?.totalCount ?? 0;
  if (!total) {
    console.log(`  ${label}: 0건`);
    return [];
  }
  const pages = Math.ceil(total / perPage);
  const all = [];
  for (let p = 1; p <= pages; p++) {
    const json = await getJson(`${baseUrl}&numOfRows=${perPage}&pageNo=${p}`);
    all.push(...toArray(json));
  }
  console.log(`  ${label}: ${all.length}건 (전체 ${total})`);
  return all;
}

async function main() {
  console.log(`🗂  관광공사 3개 API 수집 시작 (기준연월 ${BASE_YM})\n`);

  // ── ① 국문 관광정보: 인천(2) 레포츠(28) ──
  console.log("① 국문 관광정보 (contentTypeId=28)");
  const tourContent = await collectAll(
    `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${SK}&${common}&areaCode=2&contentTypeId=28&arrange=A`,
    "인천 레포츠",
  );
  writeFileSync(`${RAW}/tour-content.json`, JSON.stringify(tourContent, null, 2), "utf8");

  // ── ② 기초지자체 중심 관광지 ──
  console.log("\n② 기초지자체 중심 관광지");
  const localHub = [];
  for (const d of ISLAND_DISTRICTS) {
    const rows = await collectAll(
      `https://apis.data.go.kr/B551011/LocgoHubTarService1/areaBasedList1?serviceKey=${SK}&${common}&baseYm=${BASE_YM}&areaCd=28&signguCd=${d.cd}`,
      d.nm,
    );
    localHub.push(...rows.map((r) => ({ ...r, _districtCd: d.cd, _districtNm: d.nm })));
  }
  writeFileSync(`${RAW}/local-hub.json`, JSON.stringify(localHub, null, 2), "utf8");

  // ── ③ 관광지별 연관 관광지 ──
  console.log("\n③ 관광지별 연관 관광지");
  const related = [];
  for (const d of ISLAND_DISTRICTS) {
    const rows = await collectAll(
      `https://apis.data.go.kr/B551011/TarRlteTarService1/areaBasedList1?serviceKey=${SK}&${common}&baseYm=${BASE_YM}&areaCd=28&signguCd=${d.cd}`,
      d.nm,
    );
    related.push(...rows.map((r) => ({ ...r, _districtCd: d.cd, _districtNm: d.nm })));
  }
  writeFileSync(`${RAW}/related-tourism.json`, JSON.stringify(related, null, 2), "utf8");

  console.log("\n✅ 수집 완료");
  console.table({
    "국문관광정보(28)": tourContent.length,
    "지자체 중심관광지": localHub.length,
    "연관 관광지(관계)": related.length,
  });
}

main().catch((e) => {
  console.error("❌ 수집 실패:", e.message);
  process.exit(1);
});
