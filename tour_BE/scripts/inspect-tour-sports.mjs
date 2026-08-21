import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyTourSport, ISLANDS } from "./lib/tour-island-mapping.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outputDir = path.join(projectRoot, "reports", "tour-sports");

function parseEnv(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

async function getApiKey() {
  if (process.env.TOUR_API_KEY) return process.env.TOUR_API_KEY;
  const env = parseEnv(await readFile(path.join(projectRoot, ".env"), "utf8"));
  if (!env.TOUR_API_KEY) throw new Error(".env에 TOUR_API_KEY를 설정해주세요.");
  return env.TOUR_API_KEY;
}

async function fetchAllTourSports(serviceKey) {
  const endpoint = "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";
  const params = new URLSearchParams({
    serviceKey,
    MobileOS: "ETC",
    MobileApp: "HYland",
    _type: "json",
    pageNo: "1",
    numOfRows: "500",
    areaCode: "2",
    contentTypeId: "28",
    arrange: "A",
  });
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) throw new Error(`TourAPI HTTP ${response.status}`);
  const payload = await response.json();
  const header = payload?.response?.header;
  if (!header || !["00", "0000"].includes(String(header.resultCode))) {
    throw new Error(`TourAPI ${header?.resultCode ?? "UNKNOWN"}: ${header?.resultMsg ?? "응답 형식 오류"}`);
  }
  const body = payload.response.body;
  const items = body?.items?.item;
  return {
    totalCount: Number(body?.totalCount ?? 0),
    items: Array.isArray(items) ? items : items ? [items] : [],
  };
}

const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

function toCsv(rows) {
  const columns = [
    "contentid", "title", "addr1", "addr2", "mapy", "mapx", "status",
    "region", "islandId", "islandName", "method", "confidence", "reason", "candidates",
  ];
  return "\uFEFF" + [columns.join(","), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))].join("\n") + "\n";
}

function toMarkdown(summary) {
  const islandRows = Object.entries(summary.byIsland)
    .map(([id, island]) => `| ${island.region} | ${island.name} | \`${id}\` | ${island.count} |`)
    .join("\n");
  return `# 인천 레포츠 섬별 분류 보고서

- 생성 시각: ${summary.generatedAt}
- 출처: ${summary.source}
- 조회 조건: 인천(\`areaCode=2\`), 레포츠(\`contentTypeId=28\`)
- API 전체/수집: ${summary.apiTotalCount}/${summary.fetchedCount}건

## 분류 결과

| 구분 | 건수 |
|---|---:|
| 18개 서비스 섬 자동 매칭 | ${summary.counts.matched} |
| 수동 검수 필요 | ${summary.counts.reviewRequired} |
| 인천 본토 | ${summary.counts.mainland} |
| 서비스 대상 외 섬 | ${summary.counts.outOfScope} |

## 서비스 섬별 건수

| 권역 | 섬 | ID | 건수 |
|---|---|---|---:|
${islandRows}

## 검수 파일

- \`matched.csv\`: 18개 섬에 자동 매칭된 항목
- \`review-required.csv\`: 자동 확정하지 않은 항목
- \`mainland.csv\`: 인천 본토 항목
- \`out-of-scope.csv\`: 동검도·선재도 등 현재 18개 섬 범위 밖 항목
- \`all-classified.json\`: API 원본 필드와 분류 결과를 합친 전체 데이터
`;
}

async function main() {
  const serviceKey = await getApiKey();
  const { totalCount, items } = await fetchAllTourSports(serviceKey);
  const classified = items.map((item) => ({ ...item, ...classifyTourSport(item) }));
  const groups = {
    matched: classified.filter((item) => item.status === "MATCHED"),
    reviewRequired: classified.filter((item) => item.status === "REVIEW_REQUIRED"),
    mainland: classified.filter((item) => item.status === "MAINLAND"),
    outOfScope: classified.filter((item) => item.status === "OUT_OF_SCOPE"),
  };
  const byIsland = Object.fromEntries(
    Object.entries(ISLANDS).map(([id, island]) => [
      id,
      { name: island.name, region: island.region, count: groups.matched.filter((item) => item.islandId === id).length },
    ]),
  );
  const summary = {
    generatedAt: new Date().toISOString(),
    source: "한국관광공사 국문 관광정보 서비스_GW / areaBasedList2",
    filters: { areaCode: 2, contentTypeId: 28 },
    apiTotalCount: totalCount,
    fetchedCount: items.length,
    counts: {
      matched: groups.matched.length,
      reviewRequired: groups.reviewRequired.length,
      mainland: groups.mainland.length,
      outOfScope: groups.outOfScope.length,
    },
    byIsland,
  };

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n"),
    writeFile(path.join(outputDir, "matched.csv"), toCsv(groups.matched)),
    writeFile(path.join(outputDir, "review-required.csv"), toCsv(groups.reviewRequired)),
    writeFile(path.join(outputDir, "mainland.csv"), toCsv(groups.mainland)),
    writeFile(path.join(outputDir, "out-of-scope.csv"), toCsv(groups.outOfScope)),
    writeFile(path.join(outputDir, "all-classified.json"), JSON.stringify(classified, null, 2) + "\n"),
    writeFile(path.join(outputDir, "report.md"), toMarkdown(summary)),
  ]);

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\n보고서 생성: ${outputDir}`);
}

main().catch((error) => {
  console.error(`조사 실패: ${error.message}`);
  process.exitCode = 1;
});
