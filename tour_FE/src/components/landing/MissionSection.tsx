import { Link } from "react-router-dom";
import { MissionBadge } from "./MissionBadge";
import { MissionLeaderboardPreview } from "./MissionLeaderboardPreview";
import { MISSION_QUESTS, missionQuestState, type MissionQuest } from "@/mocks/missions";

/** 랜딩 프리뷰: 4개 카테고리 + 획득/진행/전설이 골고루 보이도록 큐레이션 */
const PREVIEW_IDS = [1, 3, 5, 6, 11, 13, 16, 22];

const PREVIEW_BADGES = PREVIEW_IDS.map((id) => MISSION_QUESTS.find((q) => q.id === id)).filter(
  (q): q is MissionQuest => Boolean(q),
);

function badgeDesc(quest: MissionQuest): string {
  const state = missionQuestState(quest);
  if (state === "earned") return "획득 완료 ✨";
  if (state === "doing") return `진행 중 · ${quest.current}/${quest.target}${quest.unit}`;
  return `${quest.target}${quest.unit} 달성 시 획득`;
}

export function MissionSection() {
  return (
    <section className="sec" id="mission">
      <div className="container">
        <div className="sec-head reveal">
          <div className="sec-head-copy">
            <span className="eyebrow">MISSION</span>
            <h2>미션</h2>
          </div>
          <Link className="more" to="/missions">
            자세히 보기 →
          </Link>
        </div>
        <p className="sec-sub reveal">
          미션을 완료하고 배지를 모으면 탐험가 순위에 올라요. 모은 배지는 섬 여권에 기록됩니다.
        </p>
        <div className="mis-wrap reveal">
          <div className="badge-card">
            <div className="mb-grid">
              {PREVIEW_BADGES.map((quest) => (
                <div className="mb-item" key={quest.id}>
                  <MissionBadge quest={quest} size={84} />
                  <b className="mb-item__title">{quest.title}</b>
                  <span className="mb-item__desc">{badgeDesc(quest)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mis-lb-col">
            <MissionLeaderboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
