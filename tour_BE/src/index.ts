import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();
app.use(cors()); // 프론트(다른 포트)에서 호출 허용
app.use(express.json());

// 상태 확인용
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tour_BE" });
});

// ── 섬 목록 ──
app.get("/islands", async (_req, res) => {
  const islands = await prisma.island.findMany({
    include: { region: true, leisureCourses: { orderBy: { sortOrder: "asc" } } },
    orderBy: { id: "asc" },
  });
  res.json(
    islands.map((i) => ({
      id: i.id,
      name: i.name,
      region: i.region?.name ?? null,
      intro: i.intro,
      ferryRoute: i.ferryRoute,
      travelTime: i.travelTime,
      bookingLabel: i.bookingLabel,
      leisureCourses: i.leisureCourses.map((c) => c.name),
    })),
  );
});

// ── 섬 상세 ──
app.get("/islands/:id", async (req, res) => {
  const i = await prisma.island.findUnique({
    where: { id: req.params.id },
    include: {
      region: true,
      leisureCourses: { orderBy: { sortOrder: "asc" } },
      sportLinks: { include: { sport: true } },
      tourSpots: true, // 관광공사 데이터 (지금은 비어있음)
    },
  });
  if (!i) return res.status(404).json({ error: "섬을 찾을 수 없어요" });
  res.json({
    id: i.id,
    name: i.name,
    region: i.region?.name ?? null,
    intro: i.intro,
    ferryRoute: i.ferryRoute,
    travelTime: i.travelTime,
    bookingLabel: i.bookingLabel,
    leisureCourses: i.leisureCourses.map((c) => c.name),
    sports: i.sportLinks.map((l) => ({
      id: l.sport.id,
      name: l.sport.name,
      spot: l.displayName,
    })),
    tourSpots: i.tourSpots,
  });
});

// ── 레저 종목 목록 (?category=water|land|exp|heal 필터) ──
app.get("/sports", async (req, res) => {
  const category = req.query.category as string | undefined;
  const sports = await prisma.sport.findMany({
    where: category ? { categoryId: category } : undefined,
    include: { category: true, islands: true, bookingMethods: true },
    orderBy: { id: "asc" },
  });
  res.json(
    sports.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.categoryId,
      categoryLabel: s.category.label,
      description: s.description,
      pay: s.pay,
      photo: s.photo,
      difficulty: s.difficulty,
      price: s.price,
      season: s.season,
      reservationType: s.reservationType,
      islands: s.islands.map((isl) => ({ id: isl.islandId, name: isl.displayName, color: isl.color })),
      bookingMethods: s.bookingMethods.map((b) => ({ type: b.type, label: b.label, url: b.url, tel: b.tel })),
    })),
  );
});

// ── 레저 종목 상세 ──
app.get("/sports/:id", async (req, res) => {
  const s = await prisma.sport.findUnique({
    where: { id: req.params.id },
    include: { category: true, islands: true, bookingMethods: true },
  });
  if (!s) return res.status(404).json({ error: "종목을 찾을 수 없어요" });
  res.json({
    id: s.id,
    name: s.name,
    category: s.categoryId,
    categoryLabel: s.category.label,
    description: s.description,
    pay: s.pay,
    photo: s.photo,
    difficulty: s.difficulty,
    price: s.price,
    season: s.season,
    reservationType: s.reservationType,
    islands: s.islands.map((isl) => ({ id: isl.islandId, name: isl.displayName, color: isl.color })),
    bookingMethods: s.bookingMethods.map((b) => ({ type: b.type, label: b.label, url: b.url, tel: b.tel })),
  });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`✅ tour_BE API 서버 실행 → http://localhost:${PORT}`);
  console.log(`   예: http://localhost:${PORT}/islands`);
});
