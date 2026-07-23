import { useMemo } from "react";
import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { MISSION_QUESTS, missionQuestState } from "@/mocks/missions";

/** 원형 게이지 — 전체 미션 달성률 */
function RingGauge({ percent }: { percent: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="ms-ring" role="img" aria-label={`전체 달성률 ${percent}%`}>
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle className="ms-ring__track" cx="70" cy="70" r={radius} />
        <circle
          className="ms-ring__fill"
          cx="70"
          cy="70"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="ms-ring__label">
        <strong>
          <CountUpNumber value={percent} suffix="%" delay={200} />
        </strong>
        <span>전체 달성률</span>
      </div>
    </div>
  );
}

/** 미션 요약 카드 — 원형 게이지 + 획득/진행중/전체 통계 (미션 페이지·랜딩 공용) */
export function MissionSummary() {
  const stats = useMemo(() => {
    const total = MISSION_QUESTS.length;
    const earned = MISSION_QUESTS.filter((q) => missionQuestState(q) === "earned").length;
    const doing = MISSION_QUESTS.filter((q) => missionQuestState(q) === "doing").length;
    const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { total, earned, doing, percent };
  }, []);

  return (
    <section className="ms-summary" aria-label="미션 요약">
      <RingGauge percent={stats.percent} />
      <ul className="ms-summary__stats">
        <li>
          <b>
            <CountUpNumber value={stats.earned} delay={120} />
          </b>
          <span>획득 배지</span>
        </li>
        <li>
          <b>
            <CountUpNumber value={stats.doing} delay={200} />
          </b>
          <span>진행 중</span>
        </li>
        <li>
          <b>
            <CountUpNumber value={stats.total} delay={280} />
          </b>
          <span>전체 미션</span>
        </li>
      </ul>
    </section>
  );
}
