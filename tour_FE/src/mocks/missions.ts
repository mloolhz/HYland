export type MissionBadgeState = "earned" | "doing" | "locked";

/* ── 미션 & 인증 (게이지형 퀘스트) — API 연동 전 임시 데이터 (랜딩·미션 페이지 공용 단일 출처) ── */

export type MissionCategory = "탐험" | "레저" | "생태" | "기타";

export const MISSION_CATEGORIES: MissionCategory[] = ["탐험", "레저", "생태", "기타"];

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
  /** 상위 등급(골드) 배지 여부 */
  gold?: boolean;
};

export const MISSION_QUESTS: MissionQuest[] = [
  { id: 1, category: "탐험", icon: "⚓", title: "첫 발자국", desc: "인천의 섬 아무 곳이나 처음 방문해요", current: 1, target: 1, unit: "곳", reward: "첫 탐험 배지" },
  { id: 2, category: "탐험", icon: "🏝️", title: "섬 컬렉터", desc: "서로 다른 섬 5곳을 방문해 인증해요", current: 5, target: 5, unit: "곳", reward: "5개 섬 탐험 배지" },
  { id: 3, category: "레저", icon: "🏅", title: "레저 마스터", desc: "카약·SUP·사이클 등 레저 5종을 체험해요", current: 3, target: 5, unit: "종", reward: "레저 마스터 배지", gold: true },
  { id: 4, category: "생태", icon: "🦀", title: "갯벌 지킴이", desc: "갯벌 생태 체험 프로그램에 3회 참여해요", current: 1, target: 3, unit: "회", reward: "갯벌 지킴이 배지" },
  { id: 5, category: "기타", icon: "📸", title: "이야기꾼", desc: "섬 여행 후기를 커뮤니티에 10개 남겨요", current: 4, target: 10, unit: "개", reward: "이야기꾼 배지" },
  { id: 6, category: "탐험", icon: "🧭", title: "섬 완주자", desc: "인증 코스 전체를 완주하면 획득해요", current: 0, target: 12, unit: "코스", reward: "섬 완주자 배지", gold: true },
  { id: 7, category: "탐험", icon: "⛵", title: "서해 개척자", desc: "서해 5도(백령·대청·소청·연평·우도)를 모두 방문해요", current: 0, target: 5, unit: "곳", reward: "서해 개척자 배지", gold: true },
  { id: 8, category: "생태", icon: "🌅", title: "노을 수집가", desc: "섬에서 일몰을 감상하고 인증샷을 남겨요", current: 2, target: 4, unit: "회", reward: "노을 수집가 배지" },
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
