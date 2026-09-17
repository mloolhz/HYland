/** Official Incheon Island Portal — 섬정보 pages (`isleInfo.do`). */
export const ISLAND_PORTAL_BASE = "https://isum.incheon.go.kr";

type PortalRef = { isle: number; key: number };

/**
 * Maps explorer island ids to the matching isum.incheon.go.kr 섬정보 page.
 * Source: isum.incheon.go.kr/isleInfo.do (2024–2026 portal structure).
 */
const ISLAND_PORTAL_REFS: Record<string, PortalRef> = {
  baek: { isle: 186, key: 2407020007 }, // 백령도
  daech: { isle: 187, key: 2407020007 }, // 대청도
  yeonp: { isle: 184, key: 2407020006 }, // 연평도 (대연평도)
  gangh: { isle: 163, key: 2407020003 }, // 강화도
  gyo: { isle: 164, key: 2407020005 }, // 교동도
  seok: { isle: 167, key: 2407020005 }, // 석모도
  jang: { isle: 179, key: 2407020005 }, // 장봉도
  sinsi: { isle: 176, key: 2407020005 }, // 신시모도
  yeongj: { isle: 206, key: 2407020003 }, // 영종·용유도
  muui: { isle: 200, key: 2606290001 }, // 대무의도 (무의도)
  yheung: { isle: 173, key: 2407020005 }, // 영흥도
  jawol: { isle: 196, key: 2407020005 }, // 자월도
  seungb: { isle: 199, key: 2407020005 }, // 승봉도
  ijak: { isle: 197, key: 2407020003 }, // 대이작도
  deokj: { isle: 189, key: 2407020003 }, // 덕적도
  soya: { isle: 190, key: 2407020008 }, // 소야도
  mungap: { isle: 191, key: 2407020008 }, // 문갑도
  gureop: { isle: 193, key: 2407020005 }, // 굴업도
};

export function getIslandPortalUrl(islandId: string): string | null {
  const ref = ISLAND_PORTAL_REFS[islandId];
  if (!ref) return null;
  return `${ISLAND_PORTAL_BASE}/isleInfo.do?isle=${ref.isle}&key=${ref.key}`;
}
