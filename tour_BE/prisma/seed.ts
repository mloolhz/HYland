// FE 정적 데이터(tour_FE)를 DB에 시드.
// 하드코딩 복붙이 아니라 FE 원본을 그대로 import → 항상 동기화 유지.
// Prisma 7은 driver adapter가 필수라 앱 공용 클라이언트(src/prisma.ts)를 그대로 쓴다.
import { prisma } from "../src/prisma";
import { ISLANDS } from "@/lib/island-data";
import { SPORTS_CATEGORIES, SPORTS_DATA } from "@/data/sports";
// 예약/안내처 정보는 예전 data/sport-booking.ts에서 data/sport-info.ts로 옮겨졌다.
// 종목의 reservationType도 SPORTS_DATA가 아니라 이쪽에 있다(Omit으로 빠져 있음).
import { SPORT_INFO_BY_ID, getSportInfo, type InfoSource, type ReservationType } from "@/data/sport-info";
import { CATEGORY_META, MISSION_CATEGORIES, MISSION_QUESTS } from "@/mocks/missions";
import { ISLAND_BTI_QUESTIONS } from "@/data/island-bti/questions";
import { ISLAND_BTI_RESULTS } from "@/data/island-bti/results";

const RES: Record<string, string> = {
  reservable: "RESERVABLE",
  free: "FREE",
  community: "COMMUNITY",
  info: "INFO",
  mixed: "MIXED",
};
const BK: Record<string, string> = {
  official: "OFFICIAL",
  facility: "FACILITY",
  phone: "PHONE",
  info: "INFO",
};
const TIER: Record<string, string> = { 일반: "COMMON", 희귀: "RARE", 전설: "LEGEND" };

async function main() {
  console.log("🌱 시드 시작...");

  // dev 리셋: 유저 활동 데이터 먼저 정리 (마스터 재시드를 위한 FK 해제)
  // ⚠️ 개발용 — 마스터 카탈로그를 다시 심기 위해 테스트 유저 진행데이터를 비움
  await prisma.userMissionProgress.deleteMany();
  await prisma.userIslandVisit.deleteMany();
  await prisma.userIslandBtiResult.deleteMany();

  // 재실행 가능하도록 기존 마스터 데이터 삭제 (FK 역순)
  await prisma.sportBookingMethod.deleteMany();
  await prisma.sportIsland.deleteMany();
  await prisma.islandLeisureCourse.deleteMany();
  await prisma.missionQuest.deleteMany();
  await prisma.sport.deleteMany();
  await prisma.island.deleteMany();
  await prisma.missionCategory.deleteMany();
  await prisma.sportCategory.deleteMany();
  await prisma.islandRegion.deleteMany();
  await prisma.islandBtiQuestion.deleteMany();
  await prisma.islandBtiResult.deleteMany();

  // ── 섬 권역 + 섬 + 레저코스 ──
  const regions = [...new Set(ISLANDS.map((i) => i.region))];
  await prisma.islandRegion.createMany({ data: regions.map((r) => ({ id: r, name: r })) });

  await prisma.island.createMany({
    data: ISLANDS.map((i) => ({
      id: i.id,
      name: i.name,
      regionId: i.region,
      intro: i.intro,
      ferryRoute: i.ferryRoute,
      travelTime: i.travelTime,
      bookingLabel: i.bookingLabel ?? null,
    })),
  });
  const islandIds = new Set(ISLANDS.map((i) => i.id));

  await prisma.islandLeisureCourse.createMany({
    data: ISLANDS.flatMap((i) =>
      i.leisureCourses.map((name, idx) => ({ islandId: i.id, name, sortOrder: idx })),
    ),
  });

  // ── 레저 카테고리 + 종목 + 종목-섬 ──
  await prisma.sportCategory.createMany({
    data: SPORTS_CATEGORIES.map((c) => ({ id: c.key, label: c.label })),
  });

  const seenSport = new Set<string>();
  const sportRows: any[] = [];
  const sportIslandRows: any[] = [];
  for (const cat of SPORTS_CATEGORIES) {
    for (const s of SPORTS_DATA[cat.key]) {
      if (seenSport.has(s.id)) continue;
      seenSport.add(s.id);
      sportRows.push({
        id: s.id,
        categoryId: cat.key,
        name: s.name,
        description: s.desc,
        pay: s.pay,
        photo: s.photo ?? null,
        difficulty: s.diff,
        price: s.price,
        season: s.season,
        reservationType: RES[getSportInfo(s.id).reservationType] ?? "INFO",
      });
      for (const isl of s.islands) {
        sportIslandRows.push({
          sportId: s.id,
          islandId: isl.id && islandIds.has(isl.id) ? isl.id : null,
          displayName: isl.n,
          color: isl.c,
        });
      }
    }
  }
  await prisma.sport.createMany({ data: sportRows });
  await prisma.sportIsland.createMany({ data: sportIslandRows });

  // ── 예약/안내처 링크 ──
  // sport-info의 sources[]를 DB의 BookingType(OFFICIAL/PHONE/INFO)으로 환산한다.
  // reservationType이 mixed면 출처별 linkType이 예약/정보를 가른다.
  const bookingTypeOf = (reservationType: ReservationType, source: InfoSource) => {
    const kind = source.linkType ?? (reservationType === "mixed" ? "info" : reservationType);
    if (kind === "reservable") return BK.official;
    if (source.tel && !source.url) return BK.phone;
    return BK.info;
  };

  const bookingRows = Object.entries(SPORT_INFO_BY_ID)
    .filter(([sportId]) => seenSport.has(sportId))
    .flatMap(([sportId, info]) =>
      info.sources.map((source) => ({
        sportId,
        type: bookingTypeOf(info.reservationType, source),
        label: source.provider,
        url: source.url || null,
        tel: source.tel ?? null,
      })),
    );
  await prisma.sportBookingMethod.createMany({ data: bookingRows });

  // ── 미션 카테고리 + 퀘스트 ──
  await prisma.missionCategory.createMany({
    data: MISSION_CATEGORIES.map((c) => ({
      id: c,
      emoji: CATEGORY_META[c].emoji,
      color: CATEGORY_META[c].color,
      colorName: CATEGORY_META[c].colorName,
    })),
  });

  // 안전장치: FE에서 id가 중복되면 새 id를 부여해 미션을 잃지 않도록 함
  // (현재 FE는 중복 없음 — 기타 미션이 60~62를 쓰도록 정리됨)
  const nextIdStart = Math.max(...MISSION_QUESTS.map((q) => q.id)) + 1;
  let nextQuestId = nextIdStart;
  const seenQuest = new Set<number>();
  const questRows = MISSION_QUESTS.map((q) => {
    let id = q.id;
    if (seenQuest.has(id)) id = nextQuestId++;
    seenQuest.add(id);
    const anyQ = q as any;
    return {
      id,
      categoryId: q.category,
      icon: q.icon,
      title: q.title,
      description: q.desc,
      target: q.target,
      unit: q.unit,
      reward: q.reward,
      tier: TIER[q.tier] ?? "COMMON",
      islandId: anyQ.islandId && islandIds.has(anyQ.islandId) ? anyQ.islandId : null,
      sportId: anyQ.sportId && seenSport.has(anyQ.sportId) ? anyQ.sportId : null,
    };
  });
  await prisma.missionQuest.createMany({ data: questRows });

  // ── 섬BTI 문항 + 결과 ──
  await prisma.islandBtiQuestion.createMany({
    data: ISLAND_BTI_QUESTIONS.map((q: any) => ({
      id: q.id,
      dimension: q.dimension,
      text: q.question,
      optionA: q.options[0].text,
      optionB: q.options[1].text,
      axisA: q.options[0].value,
      axisB: q.options[1].value,
    })),
  });

  await prisma.islandBtiResult.createMany({
    data: Object.values(ISLAND_BTI_RESULTS).map((r: any) => ({
      code: r.code,
      name: r.name,
      description: Array.isArray(r.description) ? r.description.join("\n") : String(r.description),
      themeColor: r.themeColor,
      recommendedIslands: r.recommendedIslands,
      recommendedActivities: r.recommendedActivities,
    })),
  });

  // 결과 카운트
  const [islands, courses, sports, sportIslands, bookings2, quests, cats, btiQ, btiR] =
    await Promise.all([
      prisma.island.count(),
      prisma.islandLeisureCourse.count(),
      prisma.sport.count(),
      prisma.sportIsland.count(),
      prisma.sportBookingMethod.count(),
      prisma.missionQuest.count(),
      prisma.missionCategory.count(),
      prisma.islandBtiQuestion.count(),
      prisma.islandBtiResult.count(),
    ]);
  console.log("✅ 시드 완료");
  console.table({
    섬: islands,
    레저코스: courses,
    종목: sports,
    "종목-섬": sportIslands,
    예약안내: bookings2,
    미션카테고리: cats,
    미션퀘스트: quests,
    BTI문항: btiQ,
    BTI유형: btiR,
  });
}

main()
  .catch((e) => {
    console.error("❌ 시드 실패:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
