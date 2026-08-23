// FE 정적 데이터(tour_FE)를 DB에 시드.
// 하드코딩 복붙이 아니라 FE 원본을 그대로 import → 항상 동기화 유지.
import { PrismaClient } from "@prisma/client";
import { ISLANDS } from "@/lib/island-data";
import { SPORTS_CATEGORIES, SPORTS_DATA } from "@/data/sports";
import { BOOKING_BY_SPORT_ID } from "@/data/sport-booking";
import { CATEGORY_META, MISSION_CATEGORIES, MISSION_QUESTS } from "@/mocks/missions";
import { ISLAND_BTI_QUESTIONS } from "@/data/island-bti/questions";
import { ISLAND_BTI_RESULTS } from "@/data/island-bti/results";

const prisma = new PrismaClient();

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
        reservationType: RES[s.reservationType] ?? "INFO",
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
  const bookingRows = Object.entries(BOOKING_BY_SPORT_ID)
    .filter(([sportId]) => seenSport.has(sportId))
    .flatMap(([sportId, methods]) =>
      (methods as any[]).map((m) => ({
        sportId,
        type: BK[m.type] ?? "INFO",
        label: m.label,
        url: m.url ?? null,
        tel: m.tel ?? null,
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

  // FE MISSION_QUESTS는 생성 로직상 id 40·41·42가 중복(서로 다른 미션 6개) →
  // 중복분에 새 id를 부여해 51개 모두 보존
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
