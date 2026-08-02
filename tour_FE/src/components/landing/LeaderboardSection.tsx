import { useState } from "react";
import { Link } from "react-router-dom";
import { avaColor, CATEGORY_LEADERBOARD, formatNumber } from "@/lib/landing-data";
import { MISSION_CATEGORIES, type MissionCategory } from "@/mocks/missions";

type LeaderboardSectionProps = {
  onGoToLogin: () => void;
};

export function LeaderboardSection({ onGoToLogin }: LeaderboardSectionProps) {
  const [category, setCategory] = useState<MissionCategory>("탐험");
  const data = CATEGORY_LEADERBOARD[category];

  const handleLogin = () => {
    onGoToLogin();
  };

  return (
    <section className="sec" id="leaderboard">
      <div className="container">
        <div className="sec-head reveal">
          <div className="sec-head-copy">
            <span className="eyebrow">LEADERBOARD</span>
            <h2>탐험가 리더보드</h2>
          </div>
          <Link className="more" to="/leaderboard">
            더보기 →
          </Link>
        </div>
        <p className="sec-sub reveal">
          미션을 완료하면 카테고리별 포인트가 쌓여요. 부문별 최고의 탐험가는 누구일까요?
        </p>
        <div className="lb-card reveal rv-z">
          <div className="lb-top">
            <div className="lb-bar">
              <div className="lb-title">
                LEADERBOARD <small>미션 카테고리별 순위</small>
              </div>
              <div className="lb-tabs" role="tablist">
                {MISSION_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={category === c ? "on" : ""}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="podium">
              {[2, 1, 3].map((rank) => {
                const [name, pts] = data[rank - 1];
                const pdClass = `pd pd-${rank}`;
                return (
                  <div className={pdClass} key={rank}>
                    {rank === 1 && (
                      <>
                        <span className="laurel l">🌿</span>
                        <span className="laurel r">🌿</span>
                      </>
                    )}
                    <span className="pd-rank">#{rank}</span>
                    <div
                      className="pd-ava"
                      style={{ background: `linear-gradient(150deg, ${avaColor(name)}, #2D2E6B)` }}
                    >
                      {name[0]}
                    </div>
                    <span className="medal">{rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}</span>
                    <span className="pd-name">{name}</span>
                    <span className="pd-pts">{formatNumber(pts)} P</span>
                  </div>
                );
              })}
            </div>
          </div>
          <ul className="lb-list">
            {data.slice(3).map(([name, pts], i) => (
              <li key={name}>
                <span className="rk">#{i + 4}</span>
                <span className="ava" style={{ background: avaColor(name) }}>
                  {name[0]}
                </span>
                <span className="nm">{name}</span>
                <span className="pt">{formatNumber(pts)} P</span>
              </li>
            ))}
          </ul>
          <div className="lb-cta">
            <span>🧭 내 순위가 궁금하다면?</span>
            <button className="btn btn-gold" onClick={handleLogin}>
              로그인하고 확인하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
