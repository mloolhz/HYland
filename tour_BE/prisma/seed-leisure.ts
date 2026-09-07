/**
 * 레저스포츠 시설 시드 (leisure_sports / leisure_sport_sources / leisure_candidates)
 *
 * 입력: reports/leisure-candidates/seed-input.json
 *   ↳ scripts/tour/export-to-frontend.mjs 가 관광공사 API + 웹 조사 1·2구역을
 *     병합해 만든다. 프론트 정적 데이터와 완전히 같은 145곳이다.
 *
 * 적재 방침
 *   - 145곳을 모두 leisure_sports 에 넣는다. 화면에 이미 145곳이 나오고 있어서,
 *     일부만 넣으면 API 로 바꾸는 순간 목록이 줄어든다.
 *   - 대신 verification 으로 신뢰도를 구분한다.
 *       웹 조사 68곳  → VERIFIED   (직접 조사하며 주소까지 확인)
 *       관광공사 77곳 → UNVERIFIED (검수 대기)
 *   - leisure_candidates 에는 출처별 원본을 남긴다 (검수·추적용).
 *
 * 재실행 안전: leisure_sports 는 자연키가 없어 매번 비우고 다시 넣는다.
 * 유저 데이터는 건드리지 않는다 (전체 리셋 시드인 seed.ts 와 다름).
 *
 * 실행: npm run db:seed:leisure
 */
import { readFileSync } from "node:fs";
import { prisma } from "../src/prisma";

type SeedSource = {
  sourceType: "TOUR_CONTENT" | "LOCAL_HUB" | "RELATED_TOURISM" | "WEB_RESEARCH" | "MANUAL";
  externalId: string | null;
  rawCategory: string | null;
  sourceName: string | null;
};

type SeedFacility = {
  id: string;
  name: string;
  activity: string;
  activityId: string;
  category: string;
  islandId: string;
  islandName: string;
  address: string;
  addressLevel: "EXACT" | "VILLAGE" | "UNKNOWN";
  lat: number | null;
  lng: number | null;
  tel: string | null;
  homepage: string | null;
  photo: string | null;
  origin: string;
  verification: "UNVERIFIED" | "VERIFIED";
  sources: SeedSource[];
};

const SRC = "reports/leisure-candidates/seed-input.json";

async function main() {
  const facilities: SeedFacility[] = JSON.parse(readFileSync(SRC, "utf8"));
  console.log(`입력 ${facilities.length}곳`);

  // 참조 무결성 확인 — 없는 활동/카테고리/섬을 가리키면 FK 에서 터지므로 미리 잡는다
  const [activityIds, categoryIds, islandIds] = await Promise.all([
    prisma.leisureActivityType.findMany({ select: { id: true } }),
    prisma.sportCategory.findMany({ select: { id: true } }),
    prisma.island.findMany({ select: { id: true } }),
  ]);
  const known = {
    activity: new Set(activityIds.map((a) => a.id)),
    category: new Set(categoryIds.map((c) => c.id)),
    island: new Set(islandIds.map((i) => i.id)),
  };

  const problems: string[] = [];
  for (const f of facilities) {
    if (!known.activity.has(f.activityId)) problems.push(`${f.name}: 활동 ${f.activityId} 없음`);
    if (!known.category.has(f.category)) problems.push(`${f.name}: 카테고리 ${f.category} 없음`);
    if (!known.island.has(f.islandId)) problems.push(`${f.name}: 섬 ${f.islandId} 없음`);
  }
  if (problems.length) {
    console.error(`참조 오류 ${problems.length}건 — 시드를 중단합니다`);
    for (const p of problems.slice(0, 10)) console.error(`  - ${p}`);
    process.exit(1);
  }

  // ── 기존 적재분 비우기 (sources 는 CASCADE 지만 명시적으로) ──
  await prisma.leisureSportSource.deleteMany();
  await prisma.leisureSport.deleteMany();
  await prisma.leisureCandidate.deleteMany();

  // ── leisure_sports + sources ──
  let sourceRows = 0;
  for (const f of facilities) {
    await prisma.leisureSport.create({
      data: {
        name: f.name,
        categoryId: f.category,
        activityId: f.activityId,
        islandId: f.islandId,
        address: f.address || null,
        addressLevel: f.addressLevel,
        latitude: f.lat,
        longitude: f.lng,
        imageUrl: f.photo,
        phone: f.tel,
        reservationUrl: f.homepage,
        verification: f.verification,
        sources: {
          create: f.sources.map((s) => ({
            sourceType: s.sourceType,
            externalId: s.externalId,
            sourceName: s.sourceName,
            rawCategory: s.rawCategory,
          })),
        },
      },
    });
    sourceRows += f.sources.length;
  }

  // ── leisure_candidates (출처별 원본 — 검수 추적용) ──
  // 한 시설이 여러 출처에서 발견되면 출처 수만큼 행이 생긴다.
  const candidates = facilities.flatMap((f) =>
    f.sources.map((s) => ({
      sourceType: s.sourceType,
      externalId: s.externalId,
      name: f.name,
      address: f.address || null,
      addressLevel: f.addressLevel,
      latitude: f.lat,
      longitude: f.lng,
      suggestedActivityId: f.activityId,
      suggestedIslandId: f.islandId,
      verification: f.verification,
      reviewNote: `${f.origin} 수집 · 활동 ${f.activity} · 섬 ${f.islandName}`,
    })),
  );
  await prisma.leisureCandidate.createMany({ data: candidates, skipDuplicates: true });

  // ── 결과 ──
  const [sports, sources, cands] = await Promise.all([
    prisma.leisureSport.count(),
    prisma.leisureSportSource.count(),
    prisma.leisureCandidate.count(),
  ]);
  const byVerification = await prisma.leisureSport.groupBy({
    by: ["verification"],
    _count: { _all: true },
  });
  const byCategory = await prisma.leisureSport.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });

  console.log(`\nleisure_sports        ${sports}`);
  console.log(`leisure_sport_sources ${sources} (기대 ${sourceRows})`);
  console.log(`leisure_candidates    ${cands}`);
  console.log("\n검증 상태");
  for (const r of byVerification) console.log(`  ${r.verification.padEnd(12)} ${r._count._all}`);
  console.log("\n카테고리");
  for (const r of byCategory) console.log(`  ${r.categoryId.padEnd(8)} ${r._count._all}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
