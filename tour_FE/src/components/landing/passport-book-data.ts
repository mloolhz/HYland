import type { UserProfile } from "@/lib/user-profile";

export type PassportBadgeColor = "blue" | "green" | "purple" | "orange" | "mint" | "pink";

export type PassportBadge = {
  id: number;
  name: string;
  island: string;
  activity: string;
  acquired: boolean;
  /** @deprecated use acquired */
  isUnlocked?: boolean;
  acquiredAt: string | null;
  color: PassportBadgeColor | null;
  rotate: number;
  icon: "compass" | "hike" | "camp" | "cycle" | "kayak" | "wave" | "fish" | "lighthouse" | "anchor" | "sun";
};

export const BADGES_PER_PAGE = 6;

/** 획득·미획득 배지 샘플 — API 연동 전 임시 데이터 (총 18개, 3페이지) */
export const PASSPORT_BADGES: PassportBadge[] = [
  { id: 1, name: "백령도 탐험 완료", island: "백령도", activity: "탐험 완료", acquired: true, acquiredAt: "2025.05.10", color: "blue", rotate: -5, icon: "compass" },
  { id: 2, name: "자월도 하이킹", island: "자월도", activity: "하이킹", acquired: true, acquiredAt: "2025.05.18", color: "green", rotate: 4, icon: "hike" },
  { id: 3, name: "덕적도 캠핑", island: "덕적도", activity: "캠핑", acquired: true, acquiredAt: "2025.06.02", color: "purple", rotate: -3, icon: "camp" },
  { id: 4, name: "영종도 사이클", island: "영종도", activity: "사이클", acquired: true, acquiredAt: "2025.06.14", color: "orange", rotate: 6, icon: "cycle" },
  { id: 5, name: "무의도 해양 레저", island: "무의도", activity: "해양 레저", acquired: true, acquiredAt: "2025.06.22", color: "mint", rotate: -4, icon: "wave" },
  { id: 6, name: "섬BTI 참여", island: "섬BTI", activity: "참여 완료", acquired: true, acquiredAt: "2025.07.01", color: "pink", rotate: 2, icon: "anchor" },
  { id: 7, name: "소야도 카약", island: "소야도", activity: "카약", acquired: false, acquiredAt: null, color: null, rotate: -2, icon: "kayak" },
  { id: 8, name: "승봉도 낚시", island: "승봉도", activity: "낚시", acquired: true, acquiredAt: "2025.07.08", color: "blue", rotate: 5, icon: "fish" },
  { id: 9, name: "연평도 등대", island: "연평도", activity: "등대 탐방", acquired: true, acquiredAt: "2025.07.15", color: "green", rotate: -6, icon: "lighthouse" },
  { id: 10, name: "인천항 크루즈", island: "인천항", activity: "크루즈", acquired: true, acquiredAt: "2025.07.20", color: "purple", rotate: 3, icon: "anchor" },
  { id: 11, name: "월미도 산책", island: "월미도", activity: "산책", acquired: true, acquiredAt: "2025.07.28", color: "orange", rotate: -1, icon: "sun" },
  { id: 12, name: "강화도 맛집", island: "강화도", activity: "미식 투어", acquired: true, acquiredAt: "2025.08.03", color: "mint", rotate: 4, icon: "compass" },
  { id: 13, name: "대무의도 스노클", island: "대무의도", activity: "스노클링", acquired: false, acquiredAt: null, color: null, rotate: 1, icon: "wave" },
  { id: 14, name: "볼음도 트레킹", island: "볼음도", activity: "트레킹", acquired: true, acquiredAt: "2025.08.12", color: "pink", rotate: -5, icon: "hike" },
  { id: 15, name: "치도 캠핑", island: "치도", activity: "캠핑", acquired: true, acquiredAt: "2025.08.19", color: "blue", rotate: 6, icon: "camp" },
  { id: 16, name: "이작도 낚시", island: "이작도", activity: "낚시", acquired: true, acquiredAt: "2025.08.25", color: "green", rotate: -3, icon: "fish" },
  { id: 17, name: "석도 일출", island: "석도", activity: "일출 감상", acquired: true, acquiredAt: "2025.09.01", color: "purple", rotate: 2, icon: "sun" },
  { id: 18, name: "하늘섬 패러", island: "하늘섬", activity: "패러글라이딩", acquired: false, acquiredAt: null, color: null, rotate: -4, icon: "compass" },
  { id: 19, name: "불아섬 등반", island: "불아섬", activity: "등반", acquired: true, acquiredAt: "2025.09.08", color: "orange", rotate: 3, icon: "hike" },
  { id: 20, name: "신시도 요트", island: "신시도", activity: "요트", acquired: true, acquiredAt: "2025.09.15", color: "blue", rotate: -2, icon: "anchor" },
  { id: 21, name: "시호도 낚시", island: "시호도", activity: "낚시", acquired: true, acquiredAt: "2025.09.22", color: "green", rotate: 5, icon: "fish" },
  { id: 22, name: "영흥도 캠핑", island: "영흥도", activity: "캠핑", acquired: false, acquiredAt: null, color: null, rotate: -3, icon: "camp" },
  { id: 23, name: "풍도 트레킹", island: "풍도", activity: "트레킹", acquired: true, acquiredAt: "2025.10.01", color: "purple", rotate: 4, icon: "hike" },
  { id: 24, name: "말도 사이클", island: "말도", activity: "사이클", acquired: true, acquiredAt: "2025.10.08", color: "mint", rotate: -5, icon: "cycle" },
  { id: 25, name: "자라섬 SUP", island: "자라섬", activity: "SUP", acquired: true, acquiredAt: "2025.10.15", color: "pink", rotate: 2, icon: "wave" },
  { id: 26, name: "아차도 탐험", island: "아차도", activity: "탐험", acquired: true, acquiredAt: "2025.10.20", color: "blue", rotate: -4, icon: "compass" },
  { id: 27, name: "삼북도 등대", island: "삼북도", activity: "등대", acquired: false, acquiredAt: null, color: null, rotate: 1, icon: "lighthouse" },
  { id: 28, name: "미니멀섬 일출", island: "미니멀섬", activity: "일출", acquired: true, acquiredAt: "2025.10.28", color: "orange", rotate: 6, icon: "sun" },
  { id: 29, name: "크리스마스섬", island: "크리스마스섬", activity: "축제", acquired: true, acquiredAt: "2025.11.05", color: "green", rotate: -3, icon: "anchor" },
  { id: 30, name: "해양섬 카약", island: "해양섬", activity: "카약", acquired: true, acquiredAt: "2025.11.12", color: "purple", rotate: 4, icon: "kayak" },
];

export function isBadgeAcquired(badge: PassportBadge): boolean {
  return badge.acquired || badge.isUnlocked === true;
}

export function chunkBadges(badges: PassportBadge[], size = BADGES_PER_PAGE): PassportBadge[][] {
  const pages: PassportBadge[][] = [];
  for (let i = 0; i < badges.length; i += size) {
    pages.push(badges.slice(i, i + size));
  }
  return pages;
}

export function formatPassportNo(profile: Pick<UserProfile, "level">): string {
  return `ISLAND-${String(profile.level).padStart(4, "0")}`;
}

export function formatIssuedDate(joinedAt: string): string {
  const [year, month, day] = joinedAt.split("-");
  if (!year || !month || !day) return joinedAt;
  return `${year}.${month}.${day}`;
}
