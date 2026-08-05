import type { PassportBadgeColor } from "@/components/landing/passport-book-data";

export type IslandStampScene =
  | "cliff"
  | "mountain"
  | "camp"
  | "cycle"
  | "marine"
  | "mud"
  | "lighthouse"
  | "village"
  | "islands"
  | "beach"
  | "fish"
  | "sunset"
  | "anchor";

export type IslandStampMeta = {
  color: PassportBadgeColor;
  scene: IslandStampScene;
  activity: string;
  rotate: number;
  /** JPG/PNG 등 정적 에셋 — 있으면 SVG 대신 사용 */
  image?: string;
};

/** 섬별 스탬프 메타 (색·일러스트·활동 라벨) */
export const ISLAND_STAMP_META: Record<string, IslandStampMeta> = {
  baek: { color: "blue", scene: "cliff", activity: "탐험 완료", rotate: -4 },
  daech: { color: "mint", scene: "fish", activity: "낚시", rotate: 3 },
  yeonp: { color: "green", scene: "lighthouse", activity: "등대 탐방", rotate: -2 },
  gangh: { color: "orange", scene: "mud", activity: "갯벌 체험", rotate: 5 },
  gyo: { color: "purple", scene: "sunset", activity: "일출", rotate: -3 },
  seok: { color: "blue", scene: "lighthouse", activity: "등대 전망", rotate: 4 },
  jang: { color: "green", scene: "mud", activity: "갯벌 체험", rotate: -5 },
  sinsi: { color: "orange", scene: "islands", activity: "사이클", rotate: 2 },
  yeongj: { color: "orange", scene: "cycle", activity: "사이클", rotate: 6 },
  muui: { color: "mint", scene: "marine", activity: "해양 레저", rotate: -4 },
  yheung: { color: "purple", scene: "camp", activity: "캠핑", rotate: 3 },
  jawol: { color: "green", scene: "mountain", activity: "하이킹", rotate: 4 },
  seungb: { color: "pink", scene: "sunset", activity: "일몰", rotate: -3 },
  ijak: { color: "green", scene: "mountain", activity: "하이킹", rotate: -2 },
  deokj: { color: "purple", scene: "camp", activity: "캠핑", rotate: -3 },
  soya: { color: "blue", scene: "beach", activity: "해변 산책", rotate: 5 },
  mungap: { color: "mint", scene: "village", activity: "해안 산책", rotate: -1 },
  gureop: { color: "pink", scene: "sunset", activity: "일출", rotate: 2 },
};

const COLOR_CYCLE: PassportBadgeColor[] = ["blue", "green", "purple", "orange", "mint", "pink"];
const ROTATE_CYCLE = [-4, 3, -2, 5, -3, 4];

export function getIslandStampMeta(islandId: string, index = 0): IslandStampMeta {
  return (
    ISLAND_STAMP_META[islandId] ?? {
      color: COLOR_CYCLE[index % COLOR_CYCLE.length],
      scene: "anchor",
      activity: "방문",
      rotate: ROTATE_CYCLE[index % ROTATE_CYCLE.length],
    }
  );
}
