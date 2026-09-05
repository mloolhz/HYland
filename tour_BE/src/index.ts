import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma";
import authRouter from "./auth";
import btiRouter from "./bti";
import missionsRouter from "./missions";
import visitsRouter from "./visits";
import profileRouter from "./profile";
import leaderboardRouter from "./leaderboard";
import weatherRouter from "./weather";
import leisureRouter from "./leisure";
import communityRouter from "./community";
import submissionsRouter from "./submissions";
import uploadsRouter from "./uploads";
import notificationsRouter from "./notifications";
import recommendRouter from "./routes/recommend";

const app = express();
app.use(cors()); // 프론트(다른 포트)에서 호출 허용
app.use(express.json({ limit: "8mb" })); // 인증샷 업로드가 base64 로 온다
app.use(express.static("public")); // 테스트 콘솔 (http://localhost:4000)

// 상태 확인용
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tour_BE" });
});

// 인증 (회원가입/로그인/내정보/휴대폰인증)
app.use("/auth", authRouter);

// 섬BTI (문항/결과/제출/이력)
app.use("/bti", btiRouter);

// 미션 (목록/상세/진행도)
app.use("/missions", missionsRouter);

// 섬 방문/스탬프
app.use("/visits", visitsRouter);

// 프로필 (조회/수정 + 활동 요약)
app.use("/profile", profileRouter);

// 리더보드 (랭킹)
app.use("/leaderboard", leaderboardRouter);

// 해양 날씨 (기상청 해양관측 → 섬별 파고·수온·바람)
app.use("/weather", weatherRouter);

// 레저스포츠 시설 (관광공사 API + 웹 조사 145곳)
app.use("/leisure-sports", leisureRouter);

// 커뮤니티 (글·댓글·좋아요)
app.use("/community", communityRouter);

// 미션 인증 검수 (인증샷 → 관리자 승인 → 진행도·배지)
app.use("/submissions", submissionsRouter);

// 인증샷 이미지 업로드 (public/uploads 에 저장 → express.static 이 서빙)
app.use("/uploads", uploadsRouter);

// 알림 (댓글·좋아요·검수·배지)
app.use("/notifications", notificationsRouter);

// AI 추천 (추천·스트리밍·날씨·인기질문·섬BTI 선호도·예상 질문)
app.use("/api", recommendRouter);

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
