import { IslandVisitStamp } from "@/components/landing/IslandVisitStamp";
import type { IslandInfo } from "@/lib/island-data";
import { missionQuestState } from "@/mocks/missions";
import { useMissionProgress } from "@/store/mission-progress";

type IslandBadgeListProps = {
  island: IslandInfo;
};

/** 섬 방문 배지 — 미션·여권과 같은 스탬프를 그대로 사용 */
export function IslandBadgeList({ island }: IslandBadgeListProps) {
  // 진행도는 DB 가 정답 — 정적 MISSION_QUESTS 를 직접 보면 미션 탭과 어긋난다
  const { quests } = useMissionProgress();
  const quest = quests.find((q) => q.category === "섬" && q.title === `${island.name} 방문`);
  if (!quest) return null;

  const state = missionQuestState(quest);
  const earned = state === "earned";
  const doing = state === "doing";

  return (
    <section className="isl-detail-block isl-badge-section">
      <div className="isl-badge-section-head">
        <h4>섬 배지</h4>
        <span className="isl-badge-count">{earned ? "획득" : "미획득"}</span>
      </div>
      <div className="isl-badge-single">
        <IslandVisitStamp
          islandId={island.id}
          islandName={island.name}
          earned={earned}
          doing={doing}
          questIndex={quest.id}
          size={104}
        />
        <p className="isl-badge-hint">
          {earned ? `${island.name}에 방문해 배지를 획득했어요` : `${island.name}에 방문하면 획득해요`}
        </p>
      </div>
    </section>
  );
}
