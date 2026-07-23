import { useState } from "react";
import { avaColor, CATEGORY_LEADERBOARD, formatNumber } from "@/lib/landing-data";
import { getCategoryLeaderboardRank, getCurrentUserProfile } from "@/lib/user-profile";
import { MISSION_CATEGORIES, type MissionCategory } from "@/mocks/missions";

export function Leaderboard() {
  const [category, setCategory] = useState<MissionCategory>("탐험");
  const data = CATEGORY_LEADERBOARD[category];
  const me = getCurrentUserProfile();
  const myRank = getCategoryLeaderboardRank(category);

  return (
    <main className="lbp-page">
      <div className="container">
        <header className="lbp-head">
          <span className="lbp-head__eyebrow">LEADERBOARD</span>
          <h1 className="lbp-head__title">탐험가 리더보드</h1>
          <p className="lbp-head__sub">
            미션을 완료하면 카테고리별 포인트가 쌓여요. 부문별 최고의 탐험가는 누구일까요?
          </p>
        </header>

        {/* 내 순위 카드 */}
        <section className="lbp-me" aria-label="내 순위">
          <div className="lbp-me__ava" style={{ background: avaColor(me.nickname) }}>
            {me.nickname[0]}
          </div>
          <div className="lbp-me__info">
            <span className="lbp-me__label">내 순위 · {category}</span>
            <b className="lbp-me__name">{me.nickname}</b>
          </div>
          <div className="lbp-me__figures">
            <div className="lbp-me__rank">
              <strong>{myRank.rank}</strong>
              <span>위</span>
            </div>
            <div className="lbp-me__pts">{formatNumber(myRank.points)} P</div>
          </div>
        </section>

        <div className="lb-card">
          <div className="lb-top">
            <div className="lb-bar">
              <div className="lb-title">
                LEADERBOARD <small>미션 &amp; 인증 카테고리별 순위</small>
              </div>
              <div className="lb-tabs" role="tablist">
                {MISSION_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={category === c}
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
                return (
                  <div className={`pd pd-${rank}`} key={rank}>
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
                    <span className="medal">
                      {rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}
                    </span>
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
        </div>
      </div>
    </main>
  );
}
