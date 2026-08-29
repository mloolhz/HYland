/**
 * 레저스포츠 3개 출처 → 프론트엔드 정적 데이터(tour_FE/src/data/leisure-facilities.ts)
 *
 *   ① 관광공사 API (reports/leisure-candidates/all-candidates.json) — 섬 매핑 확정분만
 *   ② 웹 조사 1구역 (web-research1-data.mjs)
 *   ③ 웹 조사 2구역 (web-research-data.mjs)
 *
 * 프론트의 종목(sports.ts `name`)과 활동(activity)을 이어붙이기 위해
 * 활동명을 정규화한 키로 묶어서 내보낸다. (예: "수련·단체 활동" ↔ "수련단체활동")
 *
 * DB는 사용하지 않는다.
 * 실행: node scripts/tour/export-to-frontend.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { WEB_FACILITIES } from "./web-research-data.mjs";
import { WEB_FACILITIES_G1 } from "./web-research1-data.mjs";

const SRC = "reports/leisure-candidates/all-candidates.json";
const DEST = "../tour_FE/src/data/leisure-facilities.ts";

/** HYland 카테고리 → 프론트 CategoryKey */
const CATEGORY_KEY = { SEA: "water", LAND: "land", EXPERIENCE: "exp", HEALING: "heal" };

/** 활동명 대조용 키 — 공백/가운뎃점/하이픈 차이를 흡수한다 */
const ACTIVITY_NOISE = [" ", "·", "・", "-", "–", "—"];
export const activityKey = (s) =>
  ACTIVITY_NOISE.reduce((acc, ch) => acc.split(ch).join(""), String(s ?? ""));

/** 배포 시 mixed content 로 차단되지 않도록 이미지 주소를 https 로 올린다 */
const https = (url) => (url ? url.replace(/^http:\/\//, "https://") : null);

const facilities = [];

// ── ① 관광공사 API ──
for (const f of JSON.parse(readFileSync(SRC, "utf8"))) {
  if (f.islandStatus !== "MATCHED") continue;
  if (f.activity === "기타") continue; // 종목에 붙일 수 없는 미분류
  facilities.push({
    id: `tour-${f.sources[0].externalId}`,
    name: f.name,
    activity: f.activity,
    category: CATEGORY_KEY[f.category],
    islandId: f.islandId,
    islandName: f.islandName,
    address: f.address || "",
    tel: f.tel || null,
    photo: https(f.imageUrl),
    origin: "관광공사",
  });
}

// ── ②③ 웹 조사 ──
const web = (list, prefix, origin) =>
  list.forEach((f, i) =>
    facilities.push({
      id: `${prefix}-${i}`,
      name: f.name,
      activity: f.activity,
      category: CATEGORY_KEY[f.category],
      islandId: f.islandId,
      islandName: f.islandName,
      address: f.address || "",
      tel: null,
      photo: null,
      origin,
    }),
  );

web(WEB_FACILITIES_G1, "web1", "웹 조사");
web(WEB_FACILITIES, "web2", "웹 조사");

facilities.sort(
  (a, b) => a.islandName.localeCompare(b.islandName) || a.name.localeCompare(b.name),
);

// ── 활동별 묶음 ──
const byActivity = {};
for (const f of facilities) (byActivity[activityKey(f.activity)] ??= []).push(f.id);

const banner = `/**
 * 인천 섬 레저스포츠 시설 목록 (자동 생성 — 직접 수정하지 마세요)
 *
 * 생성: tour_BE/scripts/tour/export-to-frontend.mjs
 * 출처: 한국관광공사 3개 API + 웹 조사 1·2구역
 * 총 ${facilities.length}곳
 */
import type { CategoryKey } from "./sports";

export type LeisureFacility = {
  id: string;
  name: string;
  /** 레저 활동명 (프론트 종목명과 대응) */
  activity: string;
  category: CategoryKey;
  /** IslandExplorer \`ISLANDS[].id\` */
  islandId: string;
  islandName: string;
  address: string;
  tel: string | null;
  /** 대표 이미지 (없으면 null — 화면에서 placeholder 처리) */
  photo: string | null;
  /** 관광공사 | 웹 조사 */
  origin: string;
};

export const LEISURE_FACILITIES: LeisureFacility[] = ${JSON.stringify(facilities, null, 2)};

/** 활동명 대조 시 무시할 구분 문자 (공백·가운뎃점·각종 하이픈) */
const ACTIVITY_NOISE = [" ", "·", "・", "-", "–", "—"];

/** 종목명·활동명 대조용 키 */
export function activityKey(name: string): string {
  return ACTIVITY_NOISE.reduce((acc, ch) => acc.split(ch).join(""), name);
}

const BY_ACTIVITY: Record<string, LeisureFacility[]> = LEISURE_FACILITIES.reduce(
  (acc, f) => {
    (acc[activityKey(f.activity)] ??= []).push(f);
    return acc;
  },
  {} as Record<string, LeisureFacility[]>,
);

/** 종목명(sports.ts \`name\`)으로 해당 활동의 시설 목록을 가져온다 */
export function getFacilitiesByActivity(sportName: string): LeisureFacility[] {
  return BY_ACTIVITY[activityKey(sportName)] ?? [];
}

/**
 * 해당 종목의 시설이 실제로 있는 섬 목록.
 * id 는 IslandExplorer \`ISLANDS[].id\` 와 같아 그대로 이동에 쓸 수 있다.
 */
export function getIslandsByActivity(sportName: string): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const f of getFacilitiesByActivity(sportName)) {
    if (!seen.has(f.islandId)) seen.set(f.islandId, f.islandName);
  }
  return [...seen]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
`;

writeFileSync(DEST, banner, "utf8");

const lines = [`프론트 데이터 생성: ${DEST}`, `총 ${facilities.length}곳`, "", "활동별:"];
for (const [k, v] of Object.entries(byActivity).sort((a, b) => b[1].length - a[1].length)) {
  lines.push(`  ${k.padEnd(10)} ${v.length}`);
}
writeFileSync("_export.txt", lines.join("\n"), "utf8");
