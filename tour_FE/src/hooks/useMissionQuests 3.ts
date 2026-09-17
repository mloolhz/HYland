import { useMissionProgress } from "@/store/mission-progress";
import type { MissionQuest } from "@/mocks/missions";

/**
 * 미션 목록 + 실제 진행도.
 *
 * 예전에는 이 훅이 따로 API 를 불렀는데, 여권·랜딩·리더보드는 정적 정의를 봐서
 * 화면마다 숫자가 달랐다. 지금은 store/mission-progress 하나만 본다.
 */
export function useMissionQuests(): { quests: MissionQuest[]; loading: boolean } {
  const { quests, loading } = useMissionProgress();
  return { quests, loading };
}
