/**
 * 레저스포츠 시설 조회 API
 *
 *   GET /leisure-sports                  목록 (activity·category·island·verification 필터)
 *   GET /leisure-sports/activities       활동 종류 목록 (카테고리별)
 *   GET /leisure-sports/:id              시설 상세 (출처 포함)
 *
 * 응답은 프론트의 정적 데이터(tour_FE/src/data/leisure-facilities.ts)와 같은
 * 모양으로 맞춰, 정적 파일 → API 교체 시 화면 코드가 그대로 동작하게 한다.
 */
import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";

const router = Router();

/** 활동명 대조 시 무시할 구분 문자 — 프론트 activityKey 와 같은 규칙 */
const NOISE = [" ", "·", "・", "-", "–", "—"];
const activityKey = (s: string) => NOISE.reduce((acc, ch) => acc.split(ch).join(""), s);

/** 쿼리 파라미터는 배열로 올 수 있다 (?a=1&a=2) — 첫 값만 쓴다 */
function one(v: unknown): string | undefined {
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
  return typeof v === "string" ? v : undefined;
}

/** 출처가 웹 조사면 "웹 조사", 아니면 "관광공사" */
function originOf(sources: { sourceType: string }[]): string {
  return sources.some((s) => s.sourceType === "WEB_RESEARCH") ? "웹 조사" : "관광공사";
}

type SportRow = {
  id: number;
  name: string;
  categoryId: string;
  address: string | null;
  phone: string | null;
  reservationUrl: string | null;
  imageUrl: string | null;
  verification: string;
  islandId: string | null;
  island: { id: string; name: string } | null;
  activityType: { id: string; label: string };
  sources: { sourceType: string }[];
};

/** 프론트 LeisureFacility 와 같은 모양 */
function shape(s: SportRow) {
  return {
    id: String(s.id),
    name: s.name,
    activity: s.activityType.label,
    activityId: s.activityType.id,
    category: s.categoryId,
    islandId: s.islandId ?? "",
    islandName: s.island?.name ?? "",
    address: s.address ?? "",
    tel: s.phone,
    homepage: s.reservationUrl,
    photo: s.imageUrl,
    origin: originOf(s.sources),
    verification: s.verification,
  };
}

const listSelect = {
  id: true,
  name: true,
  categoryId: true,
  address: true,
  phone: true,
  reservationUrl: true,
  imageUrl: true,
  verification: true,
  islandId: true,
  island: { select: { id: true, name: true } },
  activityType: { select: { id: true, label: true } },
  sources: { select: { sourceType: true } },
} as const;

// ── 활동 종류 (":id" 보다 먼저 선언해야 경로가 겹치지 않는다) ──
router.get("/activities", async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.leisureActivityType.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        label: true,
        categoryId: true,
        _count: { select: { sports: true } },
      },
    });
    res.json(
      rows.map((r) => ({
        id: r.id,
        label: r.label,
        category: r.categoryId,
        facilityCount: r._count.sports,
      })),
    );
  } catch (err) {
    console.error("활동 종류 조회 실패:", err);
    res.status(500).json({ error: "활동 종류를 불러오지 못했어요." });
  }
});

// ── 목록 ──
router.get("/", async (req: Request, res: Response) => {
  try {
    const activity = one(req.query.activity);
    const category = one(req.query.category);
    const island = one(req.query.island);
    const verification = one(req.query.verification);

    /**
     * activity 는 활동 id("YACHT")로도, 종목명("요트")으로도 올 수 있다.
     * 표기 차이(수련단체활동 ↔ 수련·단체 활동)를 흡수하려고 JS 에서 맞춘다.
     */
    let activityId: string | undefined;
    if (activity) {
      const types = await prisma.leisureActivityType.findMany({
        select: { id: true, label: true },
      });
      const key = activityKey(activity);
      const hit =
        types.find((t) => t.id === activity) ??
        types.find((t) => activityKey(t.label) === key);
      if (!hit) {
        // 없는 활동을 물어본 것 — 빈 목록이 맞는 답이다
        res.json([]);
        return;
      }
      activityId = hit.id;
    }

    const rows = await prisma.leisureSport.findMany({
      where: {
        active: true,
        ...(activityId ? { activityId } : {}),
        ...(category ? { categoryId: category } : {}),
        ...(island ? { islandId: island } : {}),
        ...(verification ? { verification: verification as never } : {}),
      },
      orderBy: [{ island: { name: "asc" } }, { name: "asc" }],
      select: listSelect,
    });

    res.json(rows.map(shape));
  } catch (err) {
    console.error("레저 시설 목록 조회 실패:", err);
    res.status(500).json({ error: "레저 시설을 불러오지 못했어요." });
  }
});

// ── 상세 ──
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: "잘못된 시설 id 입니다." });
      return;
    }

    const row = await prisma.leisureSport.findUnique({
      where: { id },
      select: {
        ...listSelect,
        addressLevel: true,
        latitude: true,
        longitude: true,
        description: true,
        sources: {
          select: {
            sourceType: true,
            externalId: true,
            sourceName: true,
            rawCategory: true,
          },
        },
      },
    });

    if (!row) {
      res.status(404).json({ error: "시설을 찾을 수 없어요." });
      return;
    }

    res.json({
      ...shape(row),
      addressLevel: row.addressLevel,
      lat: row.latitude,
      lng: row.longitude,
      description: row.description,
      sources: row.sources,
    });
  } catch (err) {
    console.error("레저 시설 상세 조회 실패:", err);
    res.status(500).json({ error: "시설 정보를 불러오지 못했어요." });
  }
});

export default router;
