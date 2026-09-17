/**
 * 레저 시설 연락처 검수 CSV 내보내기
 *
 * DB 의 시설 목록에 관광공사에서 찾은 값(reports/contact-enrich/*.json)을 얹어
 * 엑셀로 열 수 있는 CSV 를 만든다. 사람이 빈칸을 채운 뒤 apply-contacts.mjs 로
 * 되돌려 넣는다.
 *
 * 채울 칸은 "전화번호"·"홈페이지" 두 개뿐이다. 나머지는 참고용이라 건드려도
 * 반영되지 않는다 (id 로만 맞춘다).
 *
 * 실행: node scripts/tour/export-contacts.mjs           (전체)
 *       node scripts/tour/export-contacts.mjs water land (일부만)
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const OUT = "reports/contact-enrich";
mkdirSync(OUT, { recursive: true });

const ARGS = process.argv.slice(2);
const outIdx = ARGS.indexOf("--out");
/** 엑셀이 파일을 잡고 있으면 다른 이름으로 낼 수 있게 */
const OUT_NAME = outIdx >= 0 ? ARGS[outIdx + 1] : "contacts.csv";
const CATEGORIES = ARGS.filter((a, i) => a !== "--out" && i !== outIdx + 1);
const CATEGORY_LABEL = { water: "해상", land: "육상", exp: "체험", heal: "힐링" };

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

/** 관광공사 조회 결과를 id → {tel, homepage} 로 */
function loadEnriched() {
  const map = new Map();
  for (const cat of Object.keys(CATEGORY_LABEL)) {
    const p = `${OUT}/${cat}.json`;
    if (!existsSync(p)) continue;
    const d = JSON.parse(readFileSync(p, "utf8"));
    for (const r of d.found ?? []) {
      map.set(r.id, { tel: r.tel, homepage: r.homepage, matchedTitle: r.matchedTitle });
    }
  }
  return map;
}

/** 쉼표·따옴표·줄바꿈이 있으면 감싼다 */
function cell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const where = CATEGORIES.length > 0 ? { categoryId: { in: CATEGORIES } } : {};
  const rows = await prisma.leisureSport.findMany({
    where,
    include: { activityType: { select: { label: true } }, island: { select: { name: true } } },
    orderBy: [{ categoryId: "asc" }, { id: "asc" }],
  });
  const enriched = loadEnriched();

  const header = [
    "id",
    "카테고리",
    "활동",
    "시설명",
    "섬",
    "주소",
    "전화번호", // ← 채우는 칸
    "홈페이지", // ← 채우는 칸
    "출처",
    "검색링크",
  ];

  const lines = [header.join(",")];
  let filled = 0;
  let empty = 0;

  for (const f of rows) {
    const e = enriched.get(f.id);
    // DB 값이 우선, 없으면 관광공사에서 찾은 값을 미리 채워 둔다
    const tel = f.phone ?? e?.tel ?? "";
    const homepage = f.reservationUrl ?? e?.homepage ?? "";
    if (tel || homepage) filled += 1;
    else empty += 1;

    const source = f.phone || f.reservationUrl ? "DB" : e ? `관광공사(${e.matchedTitle})` : "";
    const query = encodeURIComponent(`${f.island?.name ?? "인천"} ${f.name} 전화번호`);

    lines.push(
      [
        f.id,
        CATEGORY_LABEL[f.categoryId] ?? f.categoryId,
        f.activityType.label,
        f.name,
        f.island?.name ?? "",
        f.address ?? "",
        tel,
        homepage,
        source,
        `https://search.naver.com/search.naver?query=${query}`,
      ]
        .map(cell)
        .join(","),
    );
  }

  const path = `${OUT}/${OUT_NAME}`;
  // 엑셀이 한글을 깨뜨리지 않도록 BOM 을 붙인다
  writeFileSync(path, "﻿" + lines.join("\r\n"), "utf8");

  console.log(`시설 ${rows.length}곳`);
  console.log(`  이미 값 있음 ${filled}곳 (DB + 관광공사)`);
  console.log(`  아직 빈 곳   ${empty}곳  ← 직접 채우실 부분`);
  console.log(`\n📄 ${path}`);
  console.log(`   엑셀로 열어 "전화번호" · "홈페이지" 칸만 채우면 됩니다.`);
}

main()
  .catch((err) => {
    console.error("내보내기 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
