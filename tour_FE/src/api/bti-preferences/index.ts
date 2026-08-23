const API_BASE = "http://localhost:4000";

export type BtiIslandPreference = {
  islandName: string;
  count: number;
};

export type BtiPreferenceEntry = {
  islandBti: string;
  sampleCount: number;
  topIslands: BtiIslandPreference[];
};

/** 섬BTI 유형별 섬 선호도 조회. code를 주면 해당 유형만, 실패 시 빈 배열(FE에서 조용히 숨김) */
export async function getBtiPreferences(code?: string): Promise<BtiPreferenceEntry[]> {
  try {
    const url = code
      ? `${API_BASE}/api/bti-preferences?code=${encodeURIComponent(code)}`
      : `${API_BASE}/api/bti-preferences`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { preferences?: BtiPreferenceEntry[] };
    return data.preferences ?? [];
  } catch {
    return [];
  }
}
