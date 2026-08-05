import {
  isBadgeAcquired,
  PASSPORT_BADGES,
  type PassportBadge,
  type PassportBadgeColor,
} from "@/components/landing/passport-book-data";
import type { IslandInfo } from "@/lib/island-data";

export type IslandBadgeIcon = PassportBadge["icon"];

export type IslandCollectibleBadgeDef = {
  id: string;
  name: string;
  hint: string;
  icon: IslandBadgeIcon;
  /** Earned when the island is marked visited (first-visit style badges). */
  visitBadge?: boolean;
  /** Match against passport stamp data when available. */
  passportLink?: { island: string; keyword: string };
};

export type IslandCollectibleBadge = IslandCollectibleBadgeDef & {
  earned: boolean;
};

const STAMP_COLORS: PassportBadgeColor[] = ["blue", "green", "purple", "orange", "mint", "pink"];
const STAMP_ROTATES = [-5, 4, -3, 6, -2, 3];

const ICON_ACTIVITY: Record<IslandBadgeIcon, string> = {
  compass: "탐험",
  hike: "트레킹",
  camp: "캠핑",
  cycle: "사이클",
  kayak: "카약",
  wave: "해양",
  fish: "낚시",
  lighthouse: "등대",
  anchor: "방문",
  sun: "일출",
  cliff: "절벽",
};
const ISLAND_COLLECTIBLE_BADGES: Record<string, IslandCollectibleBadgeDef[]> = {
  baek: [
    { id: "baek-visit", name: "백령 개척자", hint: "백령도에 처음 도착하면 획득", icon: "compass", visitBadge: true, passportLink: { island: "백령도", keyword: "탐험" } },
    { id: "baek-hike", name: "두무진 트레커", hint: "두무진 해안 트레킹 코스 완주", icon: "hike" },
    { id: "baek-cycle", name: "사곶 사이클러", hint: "사곶해안 사이클 체험 완료", icon: "cycle" },
  ],
  daech: [
    { id: "daech-visit", name: "대청 첫 발", hint: "대청도 첫 방문 인증", icon: "anchor", visitBadge: true },
    { id: "daech-fish", name: "갯바위 낚시꾼", hint: "갯바위 낚시 체험 후 인증", icon: "fish" },
  ],
  yeonp: [
    { id: "yeonp-lighthouse", name: "연평 등대 탐험", hint: "연평도 등대 탐방 완료", icon: "lighthouse", passportLink: { island: "연평도", keyword: "등대" } },
    { id: "yeonp-hike", name: "연평 둘레길", hint: "연평 해안 둘레길 완주", icon: "hike" },
  ],
  gangh: [
    { id: "gangh-food", name: "강화 미식 탐험", hint: "강화도 맛집·특산 미션 완료", icon: "compass", passportLink: { island: "강화도", keyword: "맛집" } },
    { id: "gangh-mud", name: "갯벌 탐험가", hint: "갯벌 체험 프로그램 참여", icon: "wave" },
  ],
  gyo: [
    { id: "gyo-visit", name: "교동 마을 산책", hint: "교동도 마을 산책 코스 완주", icon: "compass", visitBadge: true },
    { id: "gyo-sun", name: "교동 일출", hint: "교동도에서 일출 인증샷 제출", icon: "sun" },
  ],
  seok: [
    { id: "seok-lighthouse", name: "석모 등대", hint: "등대 전망대 방문 인증", icon: "lighthouse" },
    { id: "seok-kayak", name: "석모 카약", hint: "해안 카약 체험 완료", icon: "kayak" },
  ],
  jang: [
    { id: "jang-mud", name: "갯벌 체험가", hint: "장봉도 갯벌 체험 참여", icon: "wave" },
    { id: "jang-family", name: "패밀리 탐험", hint: "가족 피크닉·조개 잡기 미션", icon: "camp" },
  ],
  sinsi: [
    { id: "sinsi-cycle", name: "3섬 사이클러", hint: "신도-시도-모도 자전거 코스 완주", icon: "cycle" },
    { id: "sinsi-visit", name: "북도 탐험", hint: "신도·시도·모도 첫 방문", icon: "compass", visitBadge: true },
  ],
  yeongj: [
    { id: "yeongj-cycle", name: "영종 사이클러", hint: "영종 해안 사이클 체험", icon: "cycle", passportLink: { island: "영종도", keyword: "사이클" } },
    { id: "yeongj-beach", name: "왕산 해변", hint: "왕산 해수욕장 방문 인증", icon: "sun" },
  ],
  muui: [
    { id: "muui-wave", name: "무의 해양 레저", hint: "SUP·해양 레저 체험 완료", icon: "wave", passportLink: { island: "무의도", keyword: "해양" } },
    { id: "muui-run", name: "바다누리 러너", hint: "무의바다누리길 러닝 완주", icon: "hike" },
  ],
  yheung: [
    { id: "yheung-camp", name: "영흥 캠퍼", hint: "영흥도 캠핑 체험 완료", icon: "camp", passportLink: { island: "영흥도", keyword: "캠핑" } },
    { id: "yheung-fish", name: "방파제 낚시꾼", hint: "방파제 낚시 체험 인증", icon: "fish" },
  ],
  jawol: [
    { id: "jawol-hike", name: "자월 하이커", hint: "자월도 해안 하이킹 완주", icon: "hike", passportLink: { island: "자월도", keyword: "하이킹" } },
    { id: "jawol-sun", name: "자월 일몰", hint: "자월도 일몰 포토 인증", icon: "sun" },
  ],
  seungb: [
    { id: "seungb-fish", name: "승봉 낚시꾼", hint: "승봉도 낚시 체험 완료", icon: "fish", passportLink: { island: "승봉도", keyword: "낚시" } },
    { id: "seungb-camp", name: "승봉 캠퍼", hint: "승봉도 캠핑·일몰 감상", icon: "camp" },
  ],
  ijak: [
    { id: "ijak-hike", name: "부아산 정복", hint: "부아산 전망대 등정", icon: "hike" },
    { id: "ijak-sand", name: "모래섬 산책", hint: "풀등 모래섬 산책 코스 완주", icon: "compass" },
  ],
  deokj: [
    { id: "deokj-camp", name: "덕적 캠퍼", hint: "덕적도 캠핑·야영 체험", icon: "camp", passportLink: { island: "덕적도", keyword: "캠핑" } },
    { id: "deokj-sup", name: "덕적 SUP", hint: "SUP·카약 체험 완료", icon: "wave" },
  ],
  soya: [
    { id: "soya-kayak", name: "소야 카약", hint: "소야도 카약 체험 완료", icon: "kayak", passportLink: { island: "소야도", keyword: "카약" } },
    { id: "soya-visit", name: "소야 해변", hint: "소야도 해변 산책 인증", icon: "anchor", visitBadge: true },
  ],
  mungap: [
    { id: "mungap-walk", name: "문갑 산책", hint: "문갑도 해안 산책 완주", icon: "hike" },
    { id: "mungap-visit", name: "미니 탐험", hint: "문갑도 첫 방문", icon: "compass", visitBadge: true },
  ],
  gureop: [
    { id: "gureop-sun", name: "굴업 일출", hint: "굴업도 일출 감상 인증", icon: "sun" },
    { id: "gureop-village", name: "어촌 마을", hint: "굴업 마을 산책 미션", icon: "anchor" },
  ],
};

function matchPassportBadge(link: { island: string; keyword: string }) {
  return PASSPORT_BADGES.find(
    (badge) =>
      badge.island === link.island &&
      (badge.name.includes(link.keyword) || badge.activity.includes(link.keyword)),
  );
}

function resolveEarned(badge: IslandCollectibleBadgeDef, island: IslandInfo): boolean {
  if (badge.passportLink) {
    const passportBadge = matchPassportBadge(badge.passportLink);
    if (passportBadge) return isBadgeAcquired(passportBadge);
  }
  if (badge.visitBadge && island.visited) return true;
  return false;
}

export function getCollectibleBadgesForIsland(island: IslandInfo): IslandCollectibleBadge[] {
  const defs = ISLAND_COLLECTIBLE_BADGES[island.id] ?? [];
  return defs.map((badge) => ({
    ...badge,
    earned: resolveEarned(badge, island),
  }));
}

export function toPassportBadgeView(
  badge: IslandCollectibleBadge,
  islandName: string,
  index: number,
): PassportBadge {
  const passportMatch = badge.passportLink ? matchPassportBadge(badge.passportLink) : undefined;

  return {
    id: index + 1,
    name: badge.name,
    island: islandName,
    activity: ICON_ACTIVITY[badge.icon],
    acquired: badge.earned,
    acquiredAt: badge.earned ? passportMatch?.acquiredAt ?? null : null,
    color: badge.earned ? passportMatch?.color ?? STAMP_COLORS[index % STAMP_COLORS.length] : null,
    rotate: STAMP_ROTATES[index % STAMP_ROTATES.length],
    icon: badge.icon,
  };
}
