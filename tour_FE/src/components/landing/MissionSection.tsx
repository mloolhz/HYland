import { Link } from "react-router-dom";
import { MissionSummary } from "./MissionSummary";
import { MISSION_QUESTS, missionQuestState, type MissionQuest } from "@/mocks/missions";

/** 미션 페이지와 동일한 퀘스트 데이터를 배지 카드 형태로 표시 */
function badgeDesc(quest: MissionQuest): string {
  const state = missionQuestState(quest);
  if (state === "earned") return `${quest.target}${quest.unit} 달성 완료`;
  if (state === "doing") return `진행 중 · ${quest.current}/${quest.target}${quest.unit}`;
  return `${quest.target}${quest.unit} 달성 시 획득`;
}

const STATE_LOCK: Record<ReturnType<typeof missionQuestState>, string | null> = {
  earned: null,
  doing: "⏳",
  locked: "🔒",
};

export function MissionSection() {
  return (
    <section className="sec" id="mission">
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">⭐</span>
          <h2>미션 &amp; 인증</h2>
          <Link className="more" to="/missions">
            더보기 →
          </Link>
        </div>
        <p className="sec-sub reveal">
          미션을 완료하고 배지와 카드를 모아보세요! 모은 배지는 바다패스 여권에 기록됩니다.
        </p>
        <div className="mis-wrap">
          <div className="badge-card reveal">
            <div className="badge-grid">
              {MISSION_QUESTS.map((quest) => {
                const state = missionQuestState(quest);
                const lock = STATE_LOCK[state];
                return (
                  <div className={`badge ${state}`} key={quest.id}>
                    <span className="b-ic">
                      <i>{quest.icon}</i>
                      {lock && <span className="lock">{lock}</span>}
                    </span>
                    <b>{quest.title}</b>
                    <span>{badgeDesc(quest)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="reveal mis-summary-col">
            <MissionSummary />
          </div>
        </div>
      </div>
    </section>
  );
}
