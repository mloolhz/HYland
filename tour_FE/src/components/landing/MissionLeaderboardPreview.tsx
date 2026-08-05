import { Link } from "react-router-dom";
import { avaColor, formatNumber, LANDING_LEADERBOARD } from "@/lib/landing-data";

const PODIUM_ORDER = [2, 1, 3] as const;
const MEDALS = ["🥈", "🏆", "🥉"] as const;

const PREVIEW_LEADERBOARD = LANDING_LEADERBOARD.slice(0, 5);
const topThree = PREVIEW_LEADERBOARD.slice(0, 3);
const restRanks = PREVIEW_LEADERBOARD.slice(3);

/** 랜딩 미션 섹션 우측 — 비로그인용 리더보드 프리뷰 */
export function MissionLeaderboardPreview() {
  return (
    <section className="mis-lb-preview" aria-label="리더보드 미리보기">
      <div className="mis-lb-preview__head">
        <div>
          <span className="mis-lb-preview__eyebrow">LEADERBOARD</span>
          <h3 className="mis-lb-preview__title">탐험가 순위</h3>
        </div>
        <Link className="mis-lb-preview__more" to="/leaderboard">
          더보기 →
        </Link>
      </div>

      <div className="mis-lb-preview__podium">
        {PODIUM_ORDER.map((rank) => {
          const [name, pts] = topThree[rank - 1];
          return (
            <div className={`mis-lb-preview__pd mis-lb-preview__pd--${rank}`} key={rank}>
              <span className="mis-lb-preview__rank">#{rank}</span>
              <div
                className="mis-lb-preview__ava"
                style={{ background: `linear-gradient(150deg, ${avaColor(name)}, #2D2E6B)` }}
              >
                {name[0]}
              </div>
              <span className="mis-lb-preview__medal" aria-hidden="true">
                {MEDALS[rank - 1]}
              </span>
              <span className="mis-lb-preview__name">{name}</span>
              <span className="mis-lb-preview__pts">{formatNumber(pts)} P</span>
            </div>
          );
        })}
      </div>

      <ul className="mis-lb-preview__list">
        {restRanks.map(([name, pts], index) => (
          <li key={name}>
            <span className="mis-lb-preview__rk">#{index + 4}</span>
            <span className="mis-lb-preview__list-ava" style={{ background: avaColor(name) }}>
              {name[0]}
            </span>
            <span className="mis-lb-preview__list-name">{name}</span>
            <span className="mis-lb-preview__list-pts">{formatNumber(pts)} P</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
