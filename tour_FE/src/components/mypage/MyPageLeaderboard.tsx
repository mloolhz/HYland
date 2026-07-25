import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { getLeaderboardRank } from "@/lib/user-profile";
import { formatNumber } from "@/lib/landing-data";
import type { LeaderboardPeriod } from "@/lib/landing-data";

const RANK_PERIODS: LeaderboardPeriod[] = ["week", "month", "all"];

export function MyPageLeaderboard() {
  const monthRank = getLeaderboardRank("month");

  return (
    <section className="mp-section mp-rank-card" aria-label="리더보드">
      <div className="mp-rank-head">
        <div className="mp-rank-head-top">
          <p className="mp-section-label">리더보드</p>
          <a href="/#leaderboard" className="mp-section-link">
            전체 리더보드 보기 →
          </a>
        </div>
        <div className="mp-rank-value-row">
          <h2 className="mp-rank-value">
            {monthRank.periodLabel}{" "}
            <strong className="mp-rank-value-num">
              <CountUpNumber value={monthRank.rank} delay={120} suffix="위" />
            </strong>
            <span className="mp-rank-points">
              <CountUpNumber value={monthRank.points} delay={220} format={formatNumber} suffix=" XP" />
            </span>
          </h2>
        </div>
      </div>
      <div className="mp-rank-periods">
        {RANK_PERIODS.map((period, index) => {
          const { rank, points, periodLabel } = getLeaderboardRank(period);
          return (
            <div key={period} className={`mp-rank-pill${period === "month" ? " is-active" : ""}`}>
              <span className="mp-rank-pill-label">{periodLabel}</span>
              <small className="mp-rank-pill-points">
                <CountUpNumber
                  value={points}
                  delay={260 + index * 80}
                  format={formatNumber}
                  suffix=" XP"
                />
              </small>
              <b className="mp-rank-pill-rank">
                <CountUpNumber value={rank} delay={180 + index * 80} suffix="위" />
              </b>
            </div>
          );
        })}
      </div>
    </section>
  );
}
