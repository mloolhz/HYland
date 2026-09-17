/**
 * 레저시설의 홈페이지 URL을 TourAPI에서 가져온다.
 *
 * 수집 때는 areaBasedList2만 불렀는데 이 응답에는 homepage가 없다.
 * 그래서 AI 추천·레저스포츠 탭이 보여주는 링크가 전부 수작업으로 모은
 * 포털 주소(인천 섬포털 등)였다. detailCommon2를 contentid로 부르면
 * 시설 자체의 홈페이지가 나온다 — 훨씬 구체적이고 출처도 API다.
 *
 * 사용: node scripts/tour/fetch-homepages.mjs
 * 결과: tour_FE/src/data/leisure-facility-links.ts
 */
import fs from "node:fs";
import path from "node:path";

const ENV = fs.readFileSync(".env", "utf8");
const KEY = ENV.match(/^TOUR_API_KEY\s*=\s*"?([^"\r\n]+)"?/m)?.[1];
if (!KEY) throw new Error("TOUR_API_KEY를 .env에서 찾지 못했습니다.");

const FE_DATA = path.resolve("../tour_FE/src/data");

/** homepage 값은 <a href="...">...</a> 형태로 오기도 하고 맨 URL이기도 하다. */
function extractUrl(homepage) {
  if (!homepage) return null;
  const href = homepage.match(/href=["']([^"']+)["']/i)?.[1];
  const bare = homepage.match(/https?:\/\/[^\s"'<>]+/)?.[1] ?? homepage.match(/https?:\/\/[^\s"'<>]+/)?.[0];
  const url = href ?? bare;
  return url && /^https?:\/\//.test(url) ? url : null;
}

async function fetchHomepage(contentId) {
  const url =
    `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${KEY}` +
    `&MobileOS=ETC&MobileApp=hyland&_type=json&contentId=${contentId}`;
  try {
    const res = await fetch(url);
    const json = JSON.parse(await res.text());
    const raw = json?.response?.body?.items?.item;
    const item = Array.isArray(raw) ? raw[0] : raw;
    return extractUrl(item?.homepage);
  } catch {
    return null;
  }
}

const source = fs.readFileSync(path.join(FE_DATA, "leisure-facilities.ts"), "utf8");
const ids = [...source.matchAll(/"id":\s*"tour-(\d+)"/g)].map((m) => m[1]);
console.log(`관광공사 시설 ${ids.length}곳 조회 시작...`);

/**
 * 관광공사에 등록된 홈페이지 주소가 이미 죽어 있는 경우가 있다(폐업·도메인 만료).
 * 실제로 43건 중 4건이 응답하지 않았다. 죽은 링크를 카드에 띄우면
 * 수작업 안내처보다 못하므로, 생성 단계에서 걸러낸다.
 */
async function isAlive(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(12000) });
    return res.status < 400 || res.status === 403; // 403은 봇 차단 — 사람은 열린다
  } catch {
    return false;
  }
}

const links = {};
let dropped = 0;
for (let i = 0; i < ids.length; i += 1) {
  const homepage = await fetchHomepage(ids[i]);
  if (homepage) {
    if (await isAlive(homepage)) links[`tour-${ids[i]}`] = homepage;
    else dropped += 1;
  }
  if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${ids.length} ... 링크 ${Object.keys(links).length}건`);
  await new Promise((r) => setTimeout(r, 120)); // 호출 간격
}

const out = `/**
 * 레저시설 홈페이지 링크 (자동 생성 — 직접 수정하지 마세요)
 *
 * 생성: tour_BE/scripts/tour/fetch-homepages.mjs
 * 출처: 한국관광공사 TourAPI detailCommon2 (homepage 필드)
 * 총 ${Object.keys(links).length}곳
 */
export const LEISURE_FACILITY_LINKS: Record<string, string> = ${JSON.stringify(links, null, 2)};
`;
fs.writeFileSync(path.join(FE_DATA, "leisure-facility-links.ts"), out, "utf8");
console.log(`\n완료: ${Object.keys(links).length} / ${ids.length}곳에 홈페이지 링크`);
