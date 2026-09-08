/**
 * 사진 보강 2차 — 이름이 달라 1차에서 못 찾은 시설
 *
 * 1차(enrich-photos.mjs)는 연락처 조사 때 확보한 contentId 만 썼다. 여기서는
 * 이름을 여러 형태로 바꿔가며 다시 검색한다.
 *   "정족산 삼랑성 트레킹" → "정족산 삼랑성" → "삼랑성"
 *   "서풍받이 트레킹 코스"  → "서풍받이"
 *
 * 다른 섬 사진이 붙는 것이 가장 나쁘므로, 검색 결과의 주소가 그 섬·시군구와
 * 맞는지 확인한 것만 받는다. 판단 근거(matchedTitle·addr)를 파일에 남겨
 * 사람이 눈으로 걸러낼 수 있게 한다.
 *
 * 실행: node scripts/tour/enrich-photos2.mjs --dry
 */
import { writeFileSync, mkdirSync } from "node:fs";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const KEY = process.env.TOUR_API_KEY;
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
  const t = await (await fetch(u)).text();
  if (t.trim().startsWith("<") || t.includes("cmmMsgHeader")) return null;
  return JSON.parse(t);
}
function items(json) {
  const it = json?.response?.body?.items;
  if (!it || it === "") return [];
  const a = it.item;
  return Array.isArray(a) ? a : a ? [a] : [];
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? "").replace(/[\s()·・\-_]/g, "");

/** 활동을 가리키는 꼬리말을 떼어 낸다 */
const TAIL = /\s*(트레킹\s*코스|트레킹|등산\s*코스|웰니스\s*코스|관측지|관찰지|체험장|체험|코스|야영장|캠핑장|포인트|자전거길|임도|해수욕장\s*야영장)\s*$/;

function variants(name, islandName) {
  const v = new Set([name]);
  let s = name;
  for (let i = 0; i < 3; i += 1) {
    const next = s.replace(TAIL, "").trim();
    if (next && next !== s) { v.add(next); s = next; } else break;
  }
  /**
   * 앞 단어만 남긴 형태도 시도한다.
   * "정족산 삼랑성 트레킹" 은 꼬리말을 떼도 "정족산 삼랑성" 이라 검색이 안 되는데,
   * 관광공사에는 "정족산" 으로 등록돼 있다.
   */
  const words = s.split(/\s+/).filter(Boolean);
  for (let n = words.length - 1; n >= 1; n -= 1) v.add(words.slice(0, n).join(" "));
  if (islandName) {
    v.add(`${islandName} ${s}`);
    v.add(islandName);
  }
  return [...v].filter((x) => x.length >= 2);
}

async function search(q) {
  return items(await getJson(
    `https://apis.data.go.kr/B551011/KorService2/searchKeyword2?serviceKey=${SK}&${COMMON}` +
      `&areaCode=2&numOfRows=20&pageNo=1&arrange=A&keyword=${encodeURIComponent(q)}`,
  ));
}

async function main() {
  const rows = await prisma.leisureSport.findMany({
    where: { imageUrl: null },
    select: { id: true, name: true, address: true, island: { select: { name: true } } },
    orderBy: { id: "asc" },
  });
  console.log(`사진 없는 ${rows.length}곳 재검색\n`);

  const found = [];
  const none = [];

  for (const f of rows) {
    const island = f.island?.name ?? "";
    /** 섬 이름만으로 검색한 결과는 그 섬 대표 사진이라 시설 사진으로 쓰기 어렵다 */
    let hit = null;
    let usedQuery = null;

    for (const q of variants(f.name, island)) {
      if (q === island) continue; // 섬 이름 단독 검색은 쓰지 않는다
      const hits = await search(q);
      const ok = hits.find((h) => {
        if (!h.firstimage) return false;
        /**
         * 이름이 "단어 단위"로 맞을 때만 받는다.
         * 그냥 포함 관계로 보면 "교동" 이 "교동아일랜드"(캠핑장), "을왕리" 가
         * "을왕리빵판다카페" 에 걸려 엉뚱한 사진이 붙는다.
         * "옹진 백령도 두무진" 처럼 지역명이 앞에 붙은 것은 단어로 맞으므로 통과한다.
         */
        const titleWords = String(h.title).split(/\s+/);
        const sameName =
          norm(h.title) === norm(q) ||
          titleWords.some((w) => norm(w) === norm(q)) ||
          norm(q).includes(norm(h.title));
        if (!sameName) return false;
        // 다른 섬 사진이 붙지 않도록 주소를 확인한다
        const addr = `${h.addr1 ?? ""}`;
        if (island && addr && !addr.includes(island.replace(/도$/, ""))) {
          const mine = (f.address ?? "").match(/(강화군|옹진군|영종구|중구)/)?.[1];
          if (mine && !addr.includes(mine)) return false;
        }
        return true;
      });
      if (ok) { hit = ok; usedQuery = q; break; }
      await sleep(120);
    }

    if (hit) {
      found.push({
        id: f.id,
        name: f.name,
        query: usedQuery,
        matchedTitle: hit.title,
        addr: hit.addr1 ?? null,
        image: hit.firstimage,
      });
      console.log(`  ✓ ${f.name} → ${hit.title}`);
    } else {
      none.push({ id: f.id, name: f.name });
    }
    await sleep(120);
  }

  writeFileSync(`${OUT}/photos2.json`, JSON.stringify({ found, none }, null, 2), "utf8");
  console.log(`\n찾음 ${found.length}곳 · 못 찾음 ${none.length}곳`);
  console.log(`📄 ${OUT}/photos2.json`);

  if (DRY) {
    console.log(`\n반영하려면 --dry 없이 실행하세요.`);
    return;
  }
  for (const r of found) {
    await prisma.leisureSport.update({ where: { id: r.id }, data: { imageUrl: r.image } });
  }
  const withPhoto = await prisma.leisureSport.count({ where: { imageUrl: { not: null } } });
  console.log(`\n✅ 반영 완료 — 141곳 중 사진 ${withPhoto}곳`);
}

main()
  .catch((err) => { console.error("실패:", err); process.exit(1); })
  .finally(() => prisma.$disconnect());
