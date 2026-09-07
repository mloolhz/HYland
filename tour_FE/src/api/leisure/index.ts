/**
 * 레저스포츠 시설 API (tour_BE `GET /leisure-sports`)
 *
 * 예전에는 data/leisure-facilities.ts 정적 파일을 읽었다. 시설이 DB로 옮겨가면서
 * 이 모듈로 교체했고, 응답 모양은 그때와 같게 맞춰 두었다.
 */
import { API_BASE } from "@/lib/api-base";
import type { CategoryKey } from "@/data/sports";

export type LeisureFacility = {
  /** DB leisure_sports.id (문자열로 내려온다) */
  id: string;
  name: string;
  /** 레저 활동명 — 프론트 종목명과 대응 */
  activity: string;
  activityId: string;
  category: CategoryKey;
  /** IslandExplorer `ISLANDS[].id` */
  islandId: string;
  islandName: string;
  address: string;
  tel: string | null;
  homepage: string | null;
  photo: string | null;
  /** 관광공사 | 웹 조사 */
  origin: string;
  verification: string;
};

export type LeisureFacilityDetail = LeisureFacility & {
  addressLevel: string;
  lat: number | null;
  lng: number | null;
  description: string | null;
  sources: {
    sourceType: string;
    externalId: string | null;
    sourceName: string | null;
    rawCategory: string | null;
  }[];
};

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { signal });
  if (!res.ok) {
    throw new Error(`요청 실패 (${res.status})`);
  }
  return (await res.json()) as T;
}

/** 종목명(sports.ts `name`)으로 해당 활동의 시설 목록을 가져온다 */
export function fetchFacilitiesByActivity(
  sportName: string,
  signal?: AbortSignal,
): Promise<LeisureFacility[]> {
  return getJson(`/leisure-sports?activity=${encodeURIComponent(sportName)}`, signal);
}

/** 시설 상세 */
export function fetchFacilityById(
  id: string,
  signal?: AbortSignal,
): Promise<LeisureFacilityDetail> {
  return getJson(`/leisure-sports/${encodeURIComponent(id)}`, signal);
}

/**
 * 시설이 실제로 있는 섬 목록 (목록 응답에서 뽑는다).
 * id 는 IslandExplorer `ISLANDS[].id` 와 같아 그대로 이동에 쓸 수 있다.
 */
export function islandsOf(facilities: LeisureFacility[]): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const f of facilities) {
    if (f.islandId && !seen.has(f.islandId)) seen.set(f.islandId, f.islandName);
  }
  return [...seen]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
