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
        <span className="ms-ring__percent">
          <CountUpNumber value={percent} suffix="%" delay={200} className="ms-ring__count" />
        </span>
        <span className="ms-ring__caption">전체 달성률</span>
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
        <li className="ms-summary__stat ms-summary__stat--earned">
          <span className="ms-summary__num">
            <CountUpNumber value={stats.earned} delay={120} className="ms-summary__count" />
          </span>
          <span className="ms-summary__label">획득 배지</span>
        </li>
        <li className="ms-summary__stat ms-summary__stat--doing">
          <span className="ms-summary__num">
            <CountUpNumber value={stats.doing} delay={200} className="ms-summary__count" />
          </span>
          <span className="ms-summary__label">진행 중</span>
        </li>
        <li className="ms-summary__stat ms-summary__stat--total">
          <span className="ms-summary__num">
            <CountUpNumber value={stats.total} delay={280} className="ms-summary__count" />
          </span>
          <span className="ms-summary__label">전체 미션</span>
        </li>
      </ul>
    </section>
  );
}
