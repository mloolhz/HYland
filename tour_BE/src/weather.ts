import { Router, type Request, type Response } from "express";

/**
 * 기상청 해양기상종합관측(sea_obs.php) → 섬별 해양 날씨.
 * 파고(WH)·풍속(WS)·수온(TW)·기온(TA)을 받아 "오늘 이 섬 앞바다" 카드에 사용.
 * 1시간 캐시 (기상청이 시간별로 갱신하므로 매 요청마다 부를 필요 없음).
 */

const KMA_URL = "https://apihub.kma.go.kr/api/typ01/url/sea_obs.php";

// 섬 → 가장 가까운 파고 관측지점 (좌표 기준 계산, 자기이름 지점 우선)
export const ISLAND_BUOY: Record<string, { stnId: string; stnName: string }> = {
  baek: { stnId: "22193", stnName: "서해143" },
  daech: { stnId: "22193", stnName: "서해143" },
  yeonp: { stnId: "22522", stnName: "연평도" },
  gangh: { stnId: "22496", stnName: "장봉도" },
  gyo: { stnId: "22525", stnName: "볼음도" },
  seok: { stnId: "22525", stnName: "볼음도" },
  jang: { stnId: "22496", stnName: "장봉도" },
  sinsi: { stnId: "22496", stnName: "장봉도" },
  yeongj: { stnId: "22496", stnName: "장봉도" },
  muui: { stnId: "22496", stnName: "장봉도" },
  yheung: { stnId: "22303", stnName: "풍도" },
  jawol: { stnId: "22472", stnName: "자월도" },
  seungb: { stnId: "22461", stnName: "이작도" },
  ijak: { stnId: "22461", stnName: "이작도" },
  deokj: { stnId: "22101", stnName: "덕적도" },
  soya: { stnId: "22461", stnName: "이작도" },
  mungap: { stnId: "22461", stnName: "이작도" },
  gureop: { stnId: "22101", stnName: "덕적도" },
};

type Obs = { wh: number | null; ws: number | null; tw: number | null; ta: number | null; tm: string };

const MISSING = -99; // 기상청 결측값

function num(v: string): number | null {
  const n = parseFloat(v);
  return Number.isNaN(n) || n <= MISSING ? null : n;
}

/** sea_obs 응답(콤마구분 텍스트, EUC-KR)을 지점ID→관측값 맵으로 파싱 */
function parseSeaObs(text: string): Record<string, Obs> {
  const out: Record<string, Obs> = {};
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const p = line.split(",").map((c) => c.trim());
    if (p.length < 14) continue;
    // TP,TM,STN_ID,STN_KO,LON,LAT,WH,WD,WS,WS_GST,TW,TA,PA,HM
    const [, tm, sid, , , , wh, , ws, , tw, ta] = p;
    if (!sid) continue;
    out[sid] = { wh: num(wh), ws: num(ws), tw: num(tw), ta: num(ta), tm };
  }
  return out;
}

// ── 1시간 캐시 ──
let cache: { data: Record<string, Obs>; at: number } | null = null;
const TTL = 60 * 60 * 1000; // 1시간

async function getSeaObs(): Promise<Record<string, Obs>> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const key = process.env.KMA_API_KEY;
  if (!key) throw new Error("KMA_API_KEY가 .env에 없어요");
  const res = await fetch(`${KMA_URL}?stn=0&help=1&authKey=${key}`);
  const buf = await res.arrayBuffer();
  const text = new TextDecoder("euc-kr").decode(buf); // 기상청은 EUC-KR
  const data = parseSeaObs(text);
  cache = { data, at: Date.now() };
  return data;
}

/** 파고·풍속으로 해양활동 가능성 판정 */
function verdict(wh: number | null, ws: number | null): { level: string; label: string; emoji: string } {
  if (wh == null && ws == null) return { level: "unknown", label: "관측 정보 없음", emoji: "⚪" };
  const highWave = wh != null && wh >= 2;
  const midWave = wh != null && wh >= 1;
  const strongWind = ws != null && ws >= 9;
  const midWind = ws != null && ws >= 5;
  if (highWave || strongWind) return { level: "bad", label: "오늘은 해양 레저 비추천", emoji: "🔴" };
  if (midWave || midWind) return { level: "caution", label: "가능하지만 주의하세요", emoji: "🟡" };
  return { level: "good", label: "해양 레저 하기 좋아요", emoji: "🟢" };
}

function shape(islandId: string, obs: Obs | undefined, meta: { stnId: string; stnName: string }) {
  const o = obs ?? { wh: null, ws: null, tw: null, ta: null, tm: "" };
  return {
    islandId,
    station: { id: meta.stnId, name: meta.stnName },
    observedAt: o.tm || null,
    waveHeight: o.wh, // 유의파고 m
    windSpeed: o.ws, // m/s
    waterTemp: o.tw, // ℃
    airTemp: o.ta, // ℃
    activity: verdict(o.wh, o.ws),
  };
}

const router = Router();

// ── 전체 섬 해양 날씨 ──
router.get("/", async (_req: Request, res: Response) => {
  try {
    const obs = await getSeaObs();
    const list = Object.entries(ISLAND_BUOY).map(([islandId, meta]) => shape(islandId, obs[meta.stnId], meta));
    res.json({ updatedAt: cache?.at ? new Date(cache.at).toISOString() : null, islands: list });
  } catch (e: any) {
    res.status(502).json({ error: "해양 관측 데이터를 불러오지 못했어요", detail: e.message });
  }
});

// ── 인천 전체 요약 (모든 관측지점 평균 + 종합 판정) ──
router.get("/summary", async (_req: Request, res: Response) => {
  try {
    const obs = await getSeaObs();
    // 지점 중복 제거 (여러 섬이 같은 지점을 공유하므로)
    const seen = new Set<string>();
    const rows: Obs[] = [];
    for (const meta of Object.values(ISLAND_BUOY)) {
      if (seen.has(meta.stnId)) continue;
      seen.add(meta.stnId);
      const o = obs[meta.stnId];
      if (o) rows.push(o);
    }
    const avg = (pick: (o: Obs) => number | null): number | null => {
      const vals = rows.map(pick).filter((v): v is number => v != null);
      if (!vals.length) return null;
      return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    };
    const wh = avg((o) => o.wh);
    const ws = avg((o) => o.ws);
    res.json({
      updatedAt: cache?.at ? new Date(cache.at).toISOString() : null,
      observedAt: rows.find((o) => o.tm)?.tm ?? null,
      waveHeight: wh,
      windSpeed: ws,
      waterTemp: avg((o) => o.tw),
      airTemp: avg((o) => o.ta),
      activity: verdict(wh, ws),
      stationCount: rows.length,
    });
  } catch (e: any) {
    res.status(502).json({ error: "해양 관측 데이터를 불러오지 못했어요", detail: e.message });
  }
});

// ── 특정 섬 해양 날씨 ──
router.get("/:islandId", async (req: Request, res: Response) => {
  const meta = ISLAND_BUOY[req.params.islandId];
  if (!meta) return res.status(404).json({ error: "지원하지 않는 섬이에요" });
  try {
    const obs = await getSeaObs();
    res.json(shape(req.params.islandId, obs[meta.stnId], meta));
  } catch (e: any) {
    res.status(502).json({ error: "해양 관측 데이터를 불러오지 못했어요", detail: e.message });
  }
});

export default router;
