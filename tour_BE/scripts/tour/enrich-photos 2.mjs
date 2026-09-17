/**
 * 레저 시설 사진 보강 — 관광공사 KorService2
 *
 * 이미 연락처를 찾을 때 저장해 둔 contentId(reports/contact-enrich/*.json)로
 * detailCommon2 의 firstimage 를 가져온다. 없으면 detailImage2 에서 추가
 * 이미지를 찾는다. 이미지가 관광공사 CDN(tong.visitkorea.or.kr)이라 출처가
 * 분명하고, 아무 사이트나 긁는 것보다 안전하다.
 *
 * 사진이 이미 있는 시설은 건드리지 않는다.
 *
 * 실행: node scripts/tour/enrich-photos.mjs --dry
 *       node scripts/tour/enrich-photos.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
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
const DRY = process.argv.includes("--dry");

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
  if (text.trim().startsWith("<") || text.includes("cmmMsgHeader")) return null;
  return JSON.parse(text);
}

function items(json) {
  const it = json?.response?.body?.items;
  if (!it || it === "") return [];
  const arr = it.item;
  return Array.isArray(arr) ? arr : arr ? [arr] : [];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 연락처 조사 때 저장해 둔 contentId */
function loadContentIds() {
  const map = new Map();
  for (const cat of ["water", "land", "exp", "heal"]) {
    const p = `${OUT}/${cat}.json`;
    if (!existsSync(p)) continue;
    for (const r of JSON.parse(readFileSync(p, "utf8")).found ?? []) {
      if (r.contentId) map.set(r.id, { contentId: r.contentId, matchedTitle: r.matchedTitle });
    }
  }
  return map;
}

async function main() {
  const ids = loadContentIds();
  const rows = await prisma.leisureSport.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true, categoryId: true },
    orderBy: { id: "asc" },
  });

  const targets = rows.filter((r) => ids.has(r.id));
  console.log(`사진 없는 시설 ${rows.length}곳 · 그중 관광공사 매칭 ${targets.length}곳\n`);

  const found = [];
  const none = [];

  for (const f of targets) {
    const { contentId, matchedTitle } = ids.get(f.id);

    const c = items(await getJson(
      `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${SK}&${COMMON}&contentId=${contentId}`,
    ))[0];
    let image = c?.firstimage || c?.firstimage2 || null;
    let source = "detailCommon2";

    // 대표 이미지가 없으면 추가 이미지 목록에서 첫 장
    if (!image) {
      await sleep(120);
      const extra = items(await getJson(
        `https://apis.data.go.kr/B551011/KorService2/detailImage2?serviceKey=${SK}&${COMMON}` +
          `&contentId=${contentId}&imageYN=Y`,
      ));
      image = extra[0]?.originimgurl || extra[0]?.smallimageurl || null;
      source = "detailImage2";
    }

    if (image) {
      found.push({
        id: f.id,
        name: f.name,
        matchedTitle,
        contentId,
        image,
        source,
        /** 관광공사 저작권 구분 — 표기 의무 확인용 */
        copyright: c?.cpyrhtDivCd ?? null,
      });
      console.log(`  ✓ ${f.name} ← ${source}`);
    } else {
      none.push({ id: f.id, name: f.name });
      console.log(`  ✗ ${f.name}`);
    }
    await sleep(120);
  }

  writeFileSync(`${OUT}/photos.json`, JSON.stringify({ found, none }, null, 2), "utf8");

  console.log(`\n── 결과 ──`);
  console.log(`  사진 찾음 ${found.length}곳 · 못 찾음 ${none.length}곳`);
  console.log(`  📄 ${OUT}/photos.json`);

  if (DRY) {
    console.log(`\n반영하려면 --dry 없이 다시 실행하세요.`);
    return;
  }

  for (const r of found) {
    await prisma.leisureSport.update({ where: { id: r.id }, data: { imageUrl: r.image } });
  }
  const total = await prisma.leisureSport.count();
  const withPhoto = await prisma.leisureSport.count({ where: { imageUrl: { not: null } } });
  console.log(`\n✅ 반영 완료 — 전체 ${total}곳 중 사진 ${withPhoto}곳`);
}

main()
  .catch((err) => {
    console.error("사진 보강 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
