export type MissionBadgeState = "earned" | "doing" | "locked";

export type MissionBadge = {
  state: MissionBadgeState;
  icon: string;
  title: string;
  desc: string;
  lock?: string;
};

export type MissionProgress = {
  label: string;
  value: string;
  width: number;
  gold?: boolean;
};

export const MISSION_BADGES: MissionBadge[] = [
  { state: "earned", icon: "⚓", title: "첫 탐험", desc: "첫 섬 방문 완료" },
  { state: "earned", icon: "🏝️", title: "5개 섬 탐험", desc: "섬 5곳 방문 완료" },
  { state: "earned", icon: "🌅", title: "일출 헌터", desc: "섬 일출 감상 완료" },
  { state: "doing", icon: "🏅", lock: "⏳", title: "레저 마스터", desc: "레저 5종 체험 · 3/5" },
  { state: "doing", icon: "🦀", lock: "⏳", title: "갯벌 지킴이", desc: "갯벌 체험 · 1/3" },
  { state: "doing", icon: "🍤", lock: "⏳", title: "미식 탐험가", desc: "특산물 체험 · 2/4" },
  { state: "locked", icon: "🧭", lock: "🔒", title: "섬 완주자", desc: "전 코스 완주 시 획득" },
  { state: "locked", icon: "⛵", lock: "🔒", title: "서해 개척자", desc: "서해 5도 방문 시 획득" },
  { state: "locked", icon: "🗼", lock: "🔒", title: "등대지기", desc: "등대 5곳 방문 시 획득" },
];

export const MISSION_PROGRESS: MissionProgress[] = [
  { label: "수집 카드", value: "12 / 48", width: 25, gold: false },
  { label: "퍼즐 완성도", value: "36%", width: 36, gold: true },
];
