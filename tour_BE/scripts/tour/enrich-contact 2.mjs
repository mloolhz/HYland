/**
 * 레저 시설 연락처 보강 — 관광공사 KorService2
 *
 * 시설 이름으로 searchKeyword2 → contentId → detailCommon2 에서 전화번호·홈페이지를
 * 가져온다. 크롤링보다 먼저 이걸 쓰는 이유는, 공식 API 라 이용 조건이 명확하고
 * 결과가 구조화돼 있어서다. 여기서 안 나오는 곳만 따로 찾으면 된다.
 *
 * DB 는 건드리지 않는다. reports/contact-enrich/<category>.json 으로만 남긴다.
 * 사람이 확인한 뒤 apply 스크립트로 반영한다.
 *
 * 실행: node scripts/tour/enrich-contact.mjs water
 */
import { writeFileSync, mkdirSync } from "node:fs";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const KEY = process.env.TOUR_API_KEY;
if (!KEY) {
  console.error("❌ .env 의 TOUR_API_KEY 가 비어있어요.");
  process.exit(1);
}
const SK = KEY.includes("%") ? KEY : encodeURIComponent(KEY);
const COMMON = "MobileOS=ETC&MobileApp=HYland&_type=json";

const CATEGORY = process.argv[2] ?? "water";
const OUT = "reports/contact-enrich";
mkdirSync(OUT, { recursive: true });

const url = new URL(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
  }),
});

async function getJson(u) {
  const res = await fetch(u);
  const text = await res.text();
  if (text.trim().startsWith("<")) throw new Error(`XML 오류: ${text.slice(0, 160)}`);
  return JSON.parse(text);
}

function items(json) {
  const it = json?.response?.body?.items;
  if (!it || it === "") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

/** 이름 비교용 — 공백·괄호·가운뎃점 무시 */
const norm = (s) => (s ?? "").replace(/[\s()·・\-_]/g, "");

/** 이름으로 인천(areaCode=2) 안에서 찾는다 */
async function search(name) {
  const u =
    `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${SK}&${COMMON}` +
    `&areaCode=2&numOfRows=20&pageNo=1&arrange=A&keyword=${encodeURIComponent(name)}`;
  try {
    return items(await getJson(u));
  } catch (err) {
    console.error(`  검색 실패 (${name}):`, err.message);
    return [];
  }
}

/** 공통 상세 — 홈페이지·주소 */
async function detail(contentId) {
  const u =
    `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${SK}&${COMMON}` +
    `&contentId=${contentId}`;
  try {
    return items(await getJson(u))[0] ?? null;
  } catch (err) {
    console.error(`  상세 실패 (${contentId}):`, err.message);
    return null;
  }
}

/**
 * 소개 상세 — 전화번호는 여기 있다.
 * detailCommon2 의 tel 은 해변·선착장 같은 공공 시설에서 거의 비어 있고,
 * 실제 연락처는 detailIntro2 의 infocenter(문의 및 안내)에 들어온다.
 */
async function intro(contentId, contentTypeId) {
  const u =
    `https://apis.data.go.kr/B551011/KorService2/detailIntro2?serviceKey=${SK}&${COMMON}` +
    `&contentId=${contentId}&contentTypeId=${contentTypeId}`;
  try {
    return items(await getJson(u))[0] ?? null;
  } catch (err) {
    console.error(`  소개 실패 (${contentId}):`, err.message);
    return null;
  }
}

const PHONE_RE = /0\d{1,2}-\d{3,4}-\d{4}/;

/**
 * 전화번호 뽑기.
 *
 * 필드 이름이 콘텐츠 유형마다 다르다 — 관광지는 infocenter, 레포츠는
 * infocenterleports, 캠핑장·숙박은 infocenterlodging … 그래서 이름을 하나씩
 * 나열하지 않고 "안내" 성격의 필드를 통째로 훑는다.
 */
function pickPhone(direct, intro) {
  if (direct && PHONE_RE.test(String(direct))) return String(direct).match(PHONE_RE)[0];
  if (!intro) return null;
  for (const [k, v] of Object.entries(intro)) {
    if (!/infocenter|tel|phone|reserv/i.test(k)) continue;
    const m = String(v ?? "").match(PHONE_RE);
    if (m) return m[0];
  }
  return null;
}

/** homepage 필드는 <a href="..."> 형태로 오는 경우가 많다 */
function pickUrl(homepage) {
  if (!homepage) return null;
  const m = String(homepage).match(/https?:\/\/[^\s"'<>]+/);
  return m ? m[0] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const rows = await prisma.leisureSport.findMany({
    where: { categoryId: CATEGORY },
    include: { activityType: { select: { label: true } }, island: { select: { name: true } } },
    orderBy: { id: "asc" },
  });
  console.log(`🔎 ${CATEGORY} 시설 ${rows.length}곳 조회 시작\n`);

  const found = [];
  const notFound = [];

  for (const f of rows) {
    /**
     * 이름이 관광공사 표기와 다른 경우가 많다.
     *   "동막해변 갯벌체험" → 관광공사에는 "동막해변"
     *   "두무진 유람선"     → "두무진"
     * 활동 이름을 떼고, 그래도 없으면 섬 이름을 붙여 다시 찾는다.
     */
    const trimmed = f.name
      .replace(/\s*(갯벌체험|유람선|수상레저|해상관광탐방로|체험장|선착장)\s*$/, "")
      .trim();
    const candidates = [f.name];
    if (trimmed && trimmed !== f.name) candidates.push(trimmed);
    if (f.island?.name) candidates.push(`${f.island.name} ${trimmed || f.name}`);

    /**
     * 후보마다 "이름이 맞는 결과"까지 확인하고 넘어간다.
     * 검색 결과가 있다는 것만으로 멈추면, 엉뚱한 것만 걸린 후보에서
     * 끝나 버려 뒤 후보를 못 써 본다.
     */
    let hit = null;
    let exact = null;
    for (const c of candidates) {
      const hits = await search(c);
      exact = hits.find((h) => norm(h.title) === norm(f.name)) ?? null;
      const partial = hits.find(
        (h) => norm(h.title).includes(norm(f.name)) || norm(f.name).includes(norm(h.title)),
      );
      // 검색어를 줄여서 찾은 경우도 인정 (동막해변 갯벌체험 → 동막해변)
      const trimmedHit =
        c !== f.name ? hits.find((h) => norm(h.title) === norm(c) || norm(h.title).includes(norm(c))) : null;
      hit = exact ?? partial ?? trimmedHit ?? null;
      if (hit) break;
      await sleep(120);
    }

    if (!hit) {
      notFound.push({ id: f.id, name: f.name, activity: f.activityType.label, address: f.address });
      console.log(`  ✗ ${f.name}`);
      await sleep(120);
      continue;
    }

    const d = await detail(hit.contentid);
    const i = d?.contenttypeid ? await intro(hit.contentid, d.contenttypeid) : null;
    const tel = pickPhone(d?.tel || hit.tel, i);
    const homepage = pickUrl(d?.homepage);

    const rec = {
      id: f.id,
      name: f.name,
      activity: f.activityType.label,
      island: f.island?.name ?? null,
      matchedTitle: hit.title,
      /** 이름이 완전히 같지 않으면 사람이 확인해야 한다 */
      exactMatch: Boolean(exact),
      contentId: hit.contentid,
      tel,
      homepage,
      addr: d?.addr1 ?? hit.addr1 ?? null,
      /** 참고용 — 운영시간·휴무 (나중에 이용정보로 쓸 수 있다) */
      usetime: i?.usetime ?? null,
      restdate: i?.restdate ?? null,
    };
    /**
     * 이름이 정확히 같지 않은데 전화·홈페이지도 없으면 남길 이유가 없다.
     * ("을왕리 수상레저" 가 "을왕리꾸덕집" 에 걸리는 식의 오매칭)
     */
    if (!exact && !tel && !homepage) {
      notFound.push({ id: f.id, name: f.name, activity: f.activityType.label, address: f.address });
      console.log(`  ✗ ${f.name} (오매칭: ${hit.title})`);
      await sleep(120);
      continue;
    }

    found.push(rec);
    console.log(
      `  ${exact ? "✓" : "△"} ${f.name} → ${hit.title} | 전화 ${tel ?? "-"} | 홈 ${homepage ? "있음" : "-"}`,
    );
    await sleep(120);
  }

  const withTel = found.filter((r) => r.tel).length;
  const withHome = found.filter((r) => r.homepage).length;
  const path = `${OUT}/${CATEGORY}.json`;
  writeFileSync(path, JSON.stringify({ category: CATEGORY, found, notFound }, null, 2), "utf8");

  console.log(`\n── 결과 ──`);
  console.log(`  매칭 ${found.length}곳 (정확 ${found.filter((r) => r.exactMatch).length} / 유사 ${found.filter((r) => !r.exactMatch).length})`);
  console.log(`  전화번호 ${withTel}곳 · 홈페이지 ${withHome}곳`);
  console.log(`  못 찾음 ${notFound.length}곳`);
  console.log(`\n📄 ${path}`);
}

main()
  .catch((err) => {
    console.error("보강 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
