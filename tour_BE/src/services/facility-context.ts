/**
 * AI 추천에 넘기는 실제 레저 시설 목록.
 *
 * 예전 프롬프트에는 종목 목록·검색 트렌드·현지 인터뷰만 들어가고, 정작
 * 한국관광공사 OpenAPI 로 모아 검증한 시설(leisure_sports)은 빠져 있었다.
 * 그래서 AI 가 "어디서 하면 되는지"는 말하지 못하고 "직접 검색해 보세요"로 끝났다.
 *
 * - 프롬프트에는 id·섬·활동·시설명·출처만 짧게 넣는다 (시설 140여 곳 ≈ 수천 토큰)
 * - 모델은 답변에 쓴 시설의 id 만 facilityIds 로 돌려준다
 * - 서버가 그 id 를 DB 목록과 대조해 사진·연락처가 붙은 카드 데이터로 바꾼다
 *   (모델이 지어낸 id 는 버려진다)
 */
import { prisma } from "../prisma";
import { listSelect, shape } from "../leisure";

export type FacilityCard = ReturnType<typeof shape>;

const CACHE_MS = 10 * 60_000;
/** 답변 하나에 붙이는 시설 카드 수 */
const MAX_CARDS = 3;

let cache: { at: number; rows: FacilityCard[] } | null = null;

export async function loadFacilities(): Promise<FacilityCard[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rows;
  try {
    const rows = await prisma.leisureSport.findMany({
      where: { active: true },
      orderBy: [{ island: { name: "asc" } }, { name: "asc" }],
      select: listSelect,
    });
    const shaped = rows.map(shape).filter((f) => f.islandName);
    cache = { at: Date.now(), rows: shaped };
    return shaped;
  } catch (err) {
    // 시설 목록이 없어도 추천 자체는 된다 — 카드만 빠진다
    console.error("[facility-context] 시설 목록 조회 실패:", err);
    return cache?.rows ?? [];
  }
}

/** 프롬프트용 시설 목록 — 한 줄에 한 곳 */
export function buildFacilityPromptSection(rows: FacilityCard[]): string {
  if (rows.length === 0) return "";
  const tourCount = rows.filter((f) => f.origin === "관광공사").length;
  const lines = rows.map((f) => `${f.id} | ${f.islandName} | ${f.activity} | ${f.name} | ${f.origin}`);
  // 출처를 밝히라고 시키면 모델이 "웹 조사" 시설에도 관광공사를 붙이는 일이 있었다.
  // 관광공사 시설이 없으면 그 규칙 자체를 빼고, 있으면 출처 칸 기준을 못 박는다.
  // 없다고 말하라는 뜻으로 읽히지 않게, 관광공사 시설이 없으면 출처 얘기 자체를 하지 않는다.
  const sourceRule =
    tourCount > 0
      ? `- 출처 칸이 정확히 "관광공사"인 시설을 처음 언급할 때만 "한국관광공사 관광정보에 등록된 ○○" 처럼 근거를 한 번 밝히세요. 그 밖의 시설은 출처를 따로 말하지 말고 시설명만 언급하세요.`
      : `- 시설의 출처(데이터 출처)는 따로 말하지 말고 시설명만 언급하세요.`;
  return `
[레저 시설 데이터] (실제 시설 ${rows.length}곳${tourCount > 0 ? ` — 이 중 ${tourCount}곳은 한국관광공사 관광정보 OpenAPI 에서 수집·검증` : ""})
형식: id | 섬 | 활동 | 시설명 | 출처
${lines.join("\n")}

위 [레저 시설 데이터] 사용 규칙:
- 특정 섬·활동을 추천하거나 설명하면, 그 섬·활동에 맞는 실제 시설을 이 목록에서 최대 ${MAX_CARDS}곳 골라 "facilityIds"에 id 를 넣고, text 에서 시설명을 자연스럽게 언급하세요.
${sourceRule}
- 목록에 없는 시설·장소를 시설처럼 만들지 마세요. 맞는 시설이 없으면 "facilityIds"는 [] 로 두세요.
`.trim();
}

/** 모델이 돌려준 facilityIds 를 검증해 카드 데이터로 바꾼다 */
export function pickFacilities(ids: unknown, rows: FacilityCard[]): FacilityCard[] {
  if (!Array.isArray(ids)) return [];
  const byId = new Map(rows.map((f) => [f.id, f]));
  const picked: FacilityCard[] = [];
  for (const raw of ids) {
    const f = byId.get(String(raw));
    if (f && !picked.includes(f)) picked.push(f);
    if (picked.length >= MAX_CARDS) break;
  }
  return picked;
}

/** 활동명 비교용 — 띄어쓰기·가운뎃점 차이는 무시한다 */
const norm = (s: string) => s.replace(/[\s·・\-–—]/g, "");

/** 관광공사 출처·사진 있는 시설을 먼저 */
function rank(f: FacilityCard) {
  return (f.origin === "관광공사" ? 0 : 2) + (f.photo ? 0 : 1);
}

export type FacilityHints = {
  /** 답변이 추천한 (섬, 활동명) 쌍 */
  pairs: { islandName: string; activity: string }[];
  /** 답변 본문에 나온 섬 이름 (나온 순서) */
  islands: string[];
};

/**
 * 모델이 facilityIds 를 비워 보냈을 때 서버가 고른다.
 * 같은 질문도 모델이 시설을 고를 때가 있고 안 고를 때가 있어, 카드가 들쭉날쭉했다.
 * 추천한 섬·활동이 맞는 시설 → 답변에 나온 섬의 대표 시설 순으로 채운다.
 */
export function fallbackFacilities(hints: FacilityHints, rows: FacilityCard[]): FacilityCard[] {
  const picked: FacilityCard[] = [];
  const add = (f: FacilityCard | undefined) => {
    if (f && !picked.includes(f) && picked.length < MAX_CARDS) picked.push(f);
  };

  for (const { islandName, activity } of hints.pairs) {
    const key = norm(activity);
    const hits = rows
      .filter((f) => f.islandName === islandName && (norm(f.activity).includes(key) || key.includes(norm(f.activity))))
      .sort((a, b) => rank(a) - rank(b));
    add(hits[0]);
  }
  for (const island of hints.islands) {
    if (picked.length >= MAX_CARDS) break;
    add(rows.filter((f) => f.islandName === island && !picked.includes(f)).sort((a, b) => rank(a) - rank(b))[0]);
  }
  return picked;
}

/**
 * 파싱된 응답에서 facilityIds 를 떼고 facilities(카드 데이터)를 붙인다.
 * 화면·DB 에는 검증된 시설만 남는다.
 */
export function attachFacilities<T extends Record<string, unknown>>(
  parsed: T,
  rows: FacilityCard[],
  hints?: FacilityHints,
): T & { facilities: FacilityCard[] } {
  const { facilityIds, ...rest } = parsed as T & { facilityIds?: unknown };
  let facilities = pickFacilities(facilityIds, rows);
  if (facilities.length === 0 && hints) facilities = fallbackFacilities(hints, rows);
  return { ...(rest as T), facilities };
}
