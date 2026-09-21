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
  yeongj: { stnId: "22185", stnName: "인천" }, // 인천 앞바다 대표 부이 (파고·바람·수온 완비)
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

const MIN_PARSED_STATIONS = 20;

/** sea_obs 응답(콤마구분 텍스트, EUC-KR)을 지점ID→관측값 맵으로 파싱 */
function parseSeaObs(text: string): Record<string, Obs> {
  const out: Record<string, Obs> = {};
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const p = line.split(",").map((c) => c.trim());
    if (p.length < 12) continue;

    let tm: string | undefined;
    let sid: string | undefined;
    let wh: string | undefined;
    let ws: string | undefined;
    let tw: string | undefined;
    let ta: string | undefined;

    const rowType = p[0];
    // 2024~ 기상청 typ01: "B, TM, STN_ID, …" (help=1 샘플과 동일)
    if (rowType === "B" || rowType === "A") {
      if (p.length < 14) continue;
      tm = p[1];
      sid = p[2];
      wh = p[6];
      ws = p[8];
      tw = p[10];
      ta = p[11];
    } else if (/^\d{10,12}$/.test(rowType)) {
      // 구형: TM이 첫 필드 (행 구분자 없음)
      tm = p[0];
      sid = p[1];
      wh = p[5];
      ws = p[7];
      tw = p[9];
      ta = p[10];
    } else {
      continue;
    }

    if (!sid || !/^\d+$/.test(sid)) continue;
    out[sid] = { wh: num(wh), ws: num(ws), tw: num(tw), ta: num(ta), tm: tm ?? "" };
  }
  return out;
}

function decodeSeaObsBody(buf: ArrayBuffer): Record<string, Obs> {
  const eucKr = parseSeaObs(new TextDecoder("euc-kr").decode(buf));
  if (Object.keys(eucKr).length >= MIN_PARSED_STATIONS) return eucKr;
  const utf8 = parseSeaObs(new TextDecoder("utf-8").decode(buf));
  return Object.keys(utf8).length > Object.keys(eucKr).length ? utf8 : eucKr;
}

// ── 1시간 캐시 ──
let cache: { data: Record<string, Obs>; at: number } | null = null;
const TTL = 60 * 60 * 1000; // 1시간

async function getSeaObs(): Promise<Record<string, Obs>> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const key = process.env.KMA_API_KEY?.trim();
  if (!key) throw new Error("KMA_API_KEY가 .env에 없어요");
  const res = await fetch(`${KMA_URL}?stn=0&help=1&authKey=${key}`);
  if (!res.ok) throw new Error(`기상청 HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const data = decodeSeaObsBody(buf);
  if (Object.keys(data).length < MIN_PARSED_STATIONS) {
    throw new Error(
      `해양 관측 파싱 결과가 비어 있어요 (지점 ${Object.keys(data).length}개). KMA 키·응답 형식을 확인하세요`,
    );
  }
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

/**
 * AI 추천용 날씨 요약 (옵션 C — 기상청 해양기상 API 재사용).
 * OpenAI는 웹검색이 없어, 실시간 날씨는 여기서 받아 프롬프트에 넣는다.
 * islandId가 있으면 그 섬 기준, 없으면 인천(영종) 대표 관측소 기준.
 * 반환값은 recommend가 쓰는 { date, summary, recommendation } 형태.
 */
export async function getSeaWeatherSummary(
  islandId?: string,
): Promise<{ date: string; summary: string; recommendation: string } | null> {
  try {
    const key = islandId && ISLAND_BUOY[islandId] ? islandId : "yeongj";
    const meta = ISLAND_BUOY[key];
    const obs = await getSeaObs();
    const s = shape(key, obs[meta.stnId], meta);

    const parts: string[] = [];
    if (s.airTemp != null) parts.push(`기온 ${s.airTemp}℃`);
    if (s.waveHeight != null) parts.push(`파고 ${s.waveHeight}m`);
    if (s.windSpeed != null) parts.push(`바람 ${s.windSpeed}m/s`);
    if (s.waterTemp != null) parts.push(`수온 ${s.waterTemp}℃`);
    if (parts.length === 0) return null;

    // 기상청 관측시각(YYYYMMDDHHMM) → "YYYY-MM-DD HH:mm"
    const tm = s.observedAt || "";
    const date = /^\d{12}$/.test(tm)
      ? `${tm.slice(0, 4)}-${tm.slice(4, 6)}-${tm.slice(6, 8)} ${tm.slice(8, 10)}:${tm.slice(10, 12)}`
      : new Date().toISOString().slice(0, 10);

    return {
      date,
      summary: `${meta.stnName} 앞바다 현재 관측 — ${parts.join(", ")}`,
      recommendation: s.activity.label, // 예: "해양 레저 하기 좋아요" / "비추천"
    };
  } catch {
    return null;
  }
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

// ── 특정 섬 해양 날씨 ──
router.get("/:islandId", async (req: Request, res: Response) => {
  const islandId = String(req.params.islandId);
  const meta = ISLAND_BUOY[islandId];
  if (!meta) return res.status(404).json({ error: "지원하지 않는 섬이에요" });
  try {
    const obs = await getSeaObs();
    res.json(shape(islandId, obs[meta.stnId], meta));
  } catch (e: any) {
    res.status(502).json({ error: "해양 관측 데이터를 불러오지 못했어요", detail: e.message });
  }
});

export default router;
