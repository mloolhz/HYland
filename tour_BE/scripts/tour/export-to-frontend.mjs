/**
 * 후보 보고서 → 프론트엔드 정적 데이터(tour_FE/src/data/leisure-facilities.ts)
 * 섬 매핑이 확정된 시설만 내보낸다. DB는 사용하지 않는다.
 *
 * 실행: node scripts/tour/export-to-frontend.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "reports/leisure-candidates/all-candidates.json";
const DEST = "../tour_FE/src/data/leisure-facilities.ts";

/** HYland 카테고리 → 프론트 CategoryKey */
const CATEGORY_KEY = {
  SEA: "water",
  LAND: "land",
  EXPERIENCE: "exp",
  HEALING: "heal",
};

const SOURCE_LABEL = {
  TOUR_CONTENT: "국문관광정보",
  LOCAL_HUB: "지자체 중심관광지",
  RELATED_TOURISM: "연관 관광지",
};

const facilities = JSON.parse(readFileSync(SRC, "utf8"))
  .filter((f) => f.islandStatus === "MATCHED")
  .map((f) => ({
    id: f.sources[0].externalId,
    name: f.name,
    category: CATEGORY_KEY[f.category],
    islandId: f.islandId,
    islandName: f.islandName,
    address: f.address || "",
    tel: f.tel || null,
    lat: f.lat ?? null,
    lng: f.lng ?? null,
    photo: f.imageUrl || null,
    sources: f.sourceTypes.map((s) => SOURCE_LABEL[s] ?? s),
    verified: f.verdict === "REGISTER",
  }))
  .sort(
    (a, b) =>
      a.islandName.localeCompare(b.islandName) || a.name.localeCompare(b.name),
  );

const byCategory = { water: [], land: [], exp: [], heal: [], unique: [] };
for (const f of facilities) byCategory[f.category].push(f.name);

const banner = `/**
 * 관광공사 API 기반 인천 섬 레저 시설 목록 (자동 생성 — 직접 수정하지 마세요)
 *
 * 생성: tour_BE/scripts/tour/export-to-frontend.mjs
 * 출처: 국문 관광정보(contentTypeId=28) · 기초지자체 중심관광지 · 관광지별 연관관광지
 * 총 ${facilities.length}곳 (18개 서비스 섬으로 매핑 확정된 시설만)
 */
import type { CategoryKey } from "./sports";

export type LeisureFacility = {
  /** 출처 API의 고유 id */
  id: string;
  name: string;
  category: CategoryKey;
  /** IslandExplorer \`ISLANDS[].id\` */
  islandId: string;
  islandName: string;
  address: string;
  tel: string | null;
  lat: number | null;
  lng: number | null;
  /** 대표 이미지 (없으면 null — 화면에서 placeholder 처리) */
  photo: string | null;
  /** 어떤 API에서 발견했는지 */
  sources: string[];
  /** 국문관광정보 기반으로 확인된 시설이면 true */
  verified: boolean;
};

export const LEISURE_FACILITIES: LeisureFacility[] = ${JSON.stringify(facilities, null, 2)};

/** 카테고리별 시설 목록 */
export const FACILITIES_BY_CATEGORY: Record<CategoryKey, LeisureFacility[]> =
  LEISURE_FACILITIES.reduce(
    (acc, f) => {
      acc[f.category].push(f);
      return acc;
    },
    { water: [], land: [], exp: [], heal: [], unique: [] } as Record<
      CategoryKey,
      LeisureFacility[]
    >,
  );

/** 특정 섬의 시설 목록 */
export function getFacilitiesByIsland(islandId: string): LeisureFacility[] {
  return LEISURE_FACILITIES.filter((f) => f.islandId === islandId);
}
`;

writeFileSync(DEST, banner, "utf8");

console.log(`프론트 데이터 생성: ${DEST}`);
console.log(`총 ${facilities.length}곳`);
console.table(
  Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, v.length])),
);
