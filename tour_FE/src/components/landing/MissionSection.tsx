import { Link } from "react-router-dom";
import { MissionBadge } from "./MissionBadge";
import { MissionLeaderboardPreview } from "./MissionLeaderboardPreview";
import { MISSION_QUESTS, type MissionQuest } from "@/mocks/missions";

/**
 * 랜딩 프리뷰 — 섬·해상·육상·힐링과 그랜드슬램이 고루 보이도록 고른 8개.
 * 예전에는 35(존재하지 않는 id)가 섞여 있어 .filter 가 조용히 버리는 바람에
 * 7칸만 나왔다. 카테고리를 재정비하며 육상이 30~34로 줄어든 탓이다.
 */
const PREVIEW_IDS = [1, 10, 15, 20, 30, 49, 34, 44];

const PREVIEW_BADGES = PREVIEW_IDS.map((id) => MISSION_QUESTS.find((q) => q.id === id)).filter(
  (q): q is MissionQuest => Boolean(q),
);

/**
 * 예시로 보여주는 배지라 진행 상태를 쓰지 않는다.
 * mock 의 고정 상태를 그대로 쓰면 로그인도 안 한 사람에게 "획득 완료 ✨" 가
 * 떠서 자기 기록으로 읽힌다.
 */
function badgeDesc(quest: MissionQuest): string {
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
                  {/* 랜딩 배지는 예시용이다. 툴팁을 끄고 상태도 미획득으로 고정한다 —
                      mock 의 획득 상태를 그대로 그리면 내 기록처럼 보여 오해를 준다 */}
                  <MissionBadge quest={quest} size={84} tooltip={false} state="locked" />
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
