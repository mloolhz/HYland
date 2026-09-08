/**
 * 검수한 연락처 CSV 를 DB 에 반영
 *
 * export-contacts.mjs 가 만든 CSV 의 "전화번호"·"홈페이지" 칸을 읽어
 * leisure_sports.phone / reservation_url 에 넣는다. id 로만 맞추므로 행 순서를
 * 바꾸거나 다른 칸을 고쳐도 상관없다.
 *
 * 빈 칸은 건너뛴다 — CSV 를 비워서 기존 값을 지우는 사고를 막기 위해서다.
 * 지우려면 --allow-clear 를 붙인다.
 *
 * 먼저 무엇이 바뀌는지만 보고 싶으면 --dry 를 붙인다.
 *
 * 실행: node scripts/tour/apply-contacts.mjs --dry
 *       node scripts/tour/apply-contacts.mjs
 */
import { readFileSync } from "node:fs";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const CSV = "reports/contact-enrich/contacts.csv";
const DRY = process.argv.includes("--dry");
const ALLOW_CLEAR = process.argv.includes("--allow-clear");

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

/** 따옴표로 감싼 칸과 그 안의 쉼표를 다룬다 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

/** 010-1234-5678 / 0321234567 / (032) 123-4567 → 032-123-4567 */
function normalizePhone(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 11) return v; // 형식이 특이하면 그대로 둔다
  if (digits.startsWith("02")) {
    return digits.length === 9
      ? `02-${digits.slice(2, 5)}-${digits.slice(5)}`
      : `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function normalizeUrl(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

async function main() {
  const text = readFileSync(CSV, "utf8").replace(/^﻿/, "");
  const rows = parseCsv(text).filter((r) => r.length > 1);
  const header = rows.shift();

  const iId = header.indexOf("id");
  const iName = header.indexOf("시설명");
  const iTel = header.indexOf("전화번호");
  const iUrl = header.indexOf("홈페이지");
  if (iId < 0 || iTel < 0 || iUrl < 0) {
    console.error("❌ CSV 머리글에 id / 전화번호 / 홈페이지 가 있어야 해요.");
    process.exit(1);
  }

  const current = new Map(
    (await prisma.leisureSport.findMany({ select: { id: true, phone: true, reservationUrl: true } })).map(
      (f) => [f.id, f],
    ),
  );

  const changes = [];
  const cleared = [];
  let skipped = 0;

  for (const r of rows) {
    const id = Number(r[iId]);
    const cur = current.get(id);
    if (!cur) continue;

    const tel = normalizePhone(r[iTel]);
    const homepage = normalizeUrl(r[iUrl]);

    const data = {};
    if (tel && tel !== cur.phone) data.phone = tel;
    if (homepage && homepage !== cur.reservationUrl) data.reservationUrl = homepage;

    // 값이 있었는데 CSV 가 비었다 — 실수일 수 있으니 기본은 건드리지 않는다
    if (!tel && cur.phone) {
      if (ALLOW_CLEAR) data.phone = null;
      else cleared.push(`${id} ${r[iName]} (전화)`);
    }
    if (!homepage && cur.reservationUrl) {
      if (ALLOW_CLEAR) data.reservationUrl = null;
      else cleared.push(`${id} ${r[iName]} (홈페이지)`);
    }

    if (Object.keys(data).length === 0) {
      skipped += 1;
      continue;
    }
    changes.push({ id, name: r[iName], data });
  }

  console.log(`${DRY ? "[미리보기] " : ""}바뀔 시설 ${changes.length}곳 · 그대로 ${skipped}곳`);
  for (const c of changes.slice(0, 30)) {
    const parts = [];
    if (c.data.phone !== undefined) parts.push(`전화 ${c.data.phone ?? "(지움)"}`);
    if (c.data.reservationUrl !== undefined) parts.push(`홈페이지 ${c.data.reservationUrl ?? "(지움)"}`);
    console.log(`  [${c.id}] ${c.name} — ${parts.join(" · ")}`);
  }
  if (changes.length > 30) console.log(`  … 외 ${changes.length - 30}곳`);

  if (cleared.length > 0) {
    console.log(`\n⚠ CSV 는 비었지만 DB 에 값이 있어 그대로 둔 곳 ${cleared.length}건`);
    console.log(`   정말 지우려면 --allow-clear 를 붙이세요.`);
  }

  if (DRY) {
    console.log(`\n반영하려면 --dry 없이 다시 실행하세요.`);
    return;
  }

  for (const c of changes) {
    await prisma.leisureSport.update({ where: { id: c.id }, data: c.data });
  }
  const after = await prisma.leisureSport.findMany({ select: { phone: true, reservationUrl: true } });
  console.log(
    `\n✅ 반영 완료 — 전화번호 ${after.filter((f) => f.phone).length}곳 · 홈페이지 ${after.filter((f) => f.reservationUrl).length}곳`,
  );
}

main()
  .catch((err) => {
    console.error("반영 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
