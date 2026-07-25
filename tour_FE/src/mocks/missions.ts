export type MissionBadgeState = "earned" | "doing" | "locked";

/* ── 미션 & 인증 (게이지형 퀘스트) — API 연동 전 임시 데이터 (랜딩·미션 페이지 공용 단일 출처) ── */

export type MissionCategory = "탐험" | "레저" | "생태" | "기타";

export const MISSION_CATEGORIES: MissionCategory[] = ["탐험", "레저", "생태", "기타"];

/** 배지 희귀도 — 수집 재미를 위한 등급 */
export type MissionTier = "일반" | "희귀" | "전설";

/** 카테고리별 대표 이모지·색상 (배지 프레임·게이지·그룹 헤더 공용) — 인천 색깔 10 중 4색 사용 */
export const CATEGORY_META: Record<MissionCategory, { emoji: string; color: string; colorName: string }> = {
  탐험: { emoji: "🧭", color: "#2A5C93", colorName: "인천바다색" },
  레저: { emoji: "🏄", color: "#B08A4A", colorName: "강화갯벌색" },
  생태: { emoji: "🌿", color: "#3E8354", colorName: "문학산녹색" },
  기타: { emoji: "✨", color: "#B0503A", colorName: "개항장벽돌색" },
};

export type MissionQuest = {
  id: number;
  category: MissionCategory;
  icon: string;
  title: string;
  desc: string;
  /** 현재 진행 수치 */
  current: number;
  /** 배지 획득에 필요한 목표 수치 */
  target: number;
  /** 진행 수치 단위 (곳, 종, 회 등) */
  unit: string;
  /** 획득 시 지급되는 배지 이름 */
  reward: string;
  /** 배지 희귀도 */
  tier: MissionTier;
};

export const MISSION_QUESTS: MissionQuest[] = [
  // ── 탐험 (6) ──
  { id: 1, category: "탐험", icon: "👣", title: "첫 발자국", desc: "인천의 섬 아무 곳이나 처음 방문해요", current: 1, target: 1, unit: "곳", reward: "첫 발자국 배지", tier: "일반" },
  { id: 2, category: "탐험", icon: "🏝️", title: "섬 나들이", desc: "서로 다른 섬 3곳을 방문해요", current: 3, target: 3, unit: "곳", reward: "섬 나들이 배지", tier: "일반" },
  { id: 3, category: "탐험", icon: "🗺️", title: "섬 컬렉터", desc: "서로 다른 섬 5곳을 방문해 인증해요", current: 5, target: 5, unit: "곳", reward: "섬 컬렉터 배지", tier: "희귀" },
  { id: 4, category: "탐험", icon: "🗼", title: "등대 지기", desc: "섬 등대 3곳을 찾아가요", current: 2, target: 3, unit: "곳", reward: "등대 지기 배지", tier: "일반" },
  { id: 5, category: "탐험", icon: "🧭", title: "섬 완주자", desc: "인증 코스 5개를 완주해요", current: 3, target: 5, unit: "코스", reward: "섬 완주자 배지", tier: "희귀" },
  { id: 6, category: "탐험", icon: "👑", title: "섬 정복왕", desc: "인천의 섬 15곳을 모두 방문해요", current: 0, target: 15, unit: "곳", reward: "섬 정복왕 배지", tier: "전설" },

  // ── 레저 (6) ──
  { id: 7, category: "레저", icon: "🎽", title: "레저 입문", desc: "레저 스포츠를 처음 체험해요", current: 1, target: 1, unit: "종", reward: "레저 입문 배지", tier: "일반" },
  { id: 8, category: "레저", icon: "🛶", title: "물놀이 시작", desc: "카약 또는 SUP를 1회 체험해요", current: 1, target: 1, unit: "회", reward: "물놀이 배지", tier: "일반" },
  { id: 9, category: "레저", icon: "🚴", title: "사이클 라이더", desc: "섬 자전거 코스를 3회 달려요", current: 2, target: 3, unit: "회", reward: "사이클 라이더 배지", tier: "일반" },
  { id: 10, category: "레저", icon: "🏄", title: "서핑 비기너", desc: "SUP·서핑을 3회 체험해요", current: 1, target: 3, unit: "회", reward: "서핑 비기너 배지", tier: "일반" },
  { id: 11, category: "레저", icon: "🏅", title: "레저 마스터", desc: "카약·SUP·사이클 등 레저 5종을 체험해요", current: 3, target: 5, unit: "종", reward: "레저 마스터 배지", tier: "희귀" },
  { id: 12, category: "레저", icon: "🏆", title: "레저 그랜드슬램", desc: "레저 8종을 모두 정복해요", current: 0, target: 8, unit: "종", reward: "그랜드슬램 배지", tier: "전설" },

  // ── 생태 (5) ──
  { id: 13, category: "생태", icon: "🐚", title: "갯벌 첫걸음", desc: "갯벌 생태 체험에 처음 참여해요", current: 1, target: 1, unit: "회", reward: "갯벌 첫걸음 배지", tier: "일반" },
  { id: 14, category: "생태", icon: "🦀", title: "갯벌 지킴이", desc: "갯벌 생태 체험에 3회 참여해요", current: 1, target: 3, unit: "회", reward: "갯벌 지킴이 배지", tier: "일반" },
  { id: 16, category: "생태", icon: "🌅", title: "노을 수집가", desc: "섬에서 일몰을 감상하고 인증샷을 남겨요", current: 2, target: 4, unit: "회", reward: "노을 수집가 배지", tier: "일반" },
  { id: 17, category: "생태", icon: "🌿", title: "생태 관찰자", desc: "생태 인증을 5건 완료해요", current: 2, target: 5, unit: "건", reward: "생태 관찰자 배지", tier: "희귀" },

  // ── 기타 (5) ──
  { id: 18, category: "기타", icon: "✍️", title: "첫 후기", desc: "섬 여행 후기를 처음 남겨요", current: 1, target: 1, unit: "개", reward: "첫 후기 배지", tier: "일반" },
  { id: 19, category: "기타", icon: "💬", title: "댓글 요정", desc: "커뮤니티에 댓글 5개를 남겨요", current: 5, target: 5, unit: "개", reward: "댓글 요정 배지", tier: "일반" },
  { id: 20, category: "기타", icon: "🧩", title: "섬BTI 참여", desc: "나의 섬BTI 테스트에 참여해요", current: 1, target: 1, unit: "회", reward: "섬BTI 배지", tier: "일반" },
  { id: 21, category: "기타", icon: "❤️", title: "인싸 탐험가", desc: "내 글이 좋아요 10개를 받아요", current: 10, target: 10, unit: "개", reward: "인싸 탐험가 배지", tier: "희귀" },
  { id: 22, category: "기타", icon: "📸", title: "이야기꾼", desc: "섬 여행 후기를 10개 남겨요", current: 4, target: 10, unit: "개", reward: "이야기꾼 배지", tier: "희귀" },
];

export function missionQuestState(quest: MissionQuest): MissionBadgeState {
  if (quest.current >= quest.target) return "earned";
  if (quest.current > 0) return "doing";
  return "locked";
}

export function missionQuestPercent(quest: MissionQuest): number {
  if (quest.target <= 0) return 0;
  return Math.min(100, Math.round((quest.current / quest.target) * 100));
}

/** 카테고리별 획득/전체 배지 수 */
export function getCategoryProgress(category: MissionCategory) {
  const quests = MISSION_QUESTS.filter((q) => q.category === category);
  const earned = quests.filter((q) => missionQuestState(q) === "earned").length;
  return { earned, total: quests.length };
}
