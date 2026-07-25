import { useState } from "react";
import {
  avaColor,
  CATEGORY_LEADERBOARD,
  CATEGORY_RANK_DELTAS,
  formatNumber,
  SEASON_REWARDS,
  type RankDelta,
} from "@/lib/landing-data";
import {
  getAllCategoryRanks,
  getCategoryLeaderboardRank,
  getCurrentUserProfile,
} from "@/lib/user-profile";
import { MISSION_CATEGORIES, type MissionCategory } from "@/mocks/missions";

/** 순위 변동 뱃지 (↑2 / ↓1 / NEW / -) */
function RankDeltaBadge({ delta }: { delta: RankDelta | undefined }) {
  if (delta === undefined) return null;
  if (delta === "new") return <span className="lbp-delta lbp-delta--new">NEW</span>;
  if (delta > 0) return <span className="lbp-delta lbp-delta--up">▲{delta}</span>;
  if (delta < 0) return <span className="lbp-delta lbp-delta--down">▼{Math.abs(delta)}</span>;
  return <span className="lbp-delta lbp-delta--same">–</span>;
}

export function Leaderboard() {
  const [category, setCategory] = useState<MissionCategory>("탐험");
  const data = CATEGORY_LEADERBOARD[category];
  const deltas = CATEGORY_RANK_DELTAS[category];
  const me = getCurrentUserProfile();
  const myRank = getCategoryLeaderboardRank(category);
  const allRanks = getAllCategoryRanks();
  const bestCategory = allRanks.reduce((best, cur) => (cur.rank < best.rank ? cur : best));

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

        {/* 내 순위 카드 + 다음 순위까지 게이지 */}
        <section className="lbp-me" aria-label="내 순위">
          <div className="lbp-me__top">
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
          </div>

          <div className="lbp-next">
            {myRank.nextName ? (
              <>
                <div className="lbp-next__label">
                  <span>
                    🔥 다음 순위 <b>{myRank.nextName}</b>까지
                  </span>
                  <span className="lbp-next__gap">{formatNumber(myRank.pointsToNext)} P</span>
                </div>
                <div className="lbp-next__track">
                  <span className="lbp-next__fill" style={{ width: `${myRank.progressPercent}%` }} />
                </div>
              </>
            ) : (
              <div className="lbp-next__label lbp-next__label--top">
                <span>👑 {category} 부문 1위! 최고의 탐험가예요.</span>
              </div>
            )}
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
                <RankDeltaBadge delta={deltas[i + 3]} />
                <span className="pt">{formatNumber(pts)} P</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 내 부문별 순위 */}
        <section className="lbp-mine" aria-label="내 부문별 순위">
          <div className="lbp-section-head">
            <h2>내 부문별 순위</h2>
            <p>
              가장 강한 부문은 <b>{bestCategory.category}</b> {bestCategory.rank}위예요.
            </p>
          </div>
          <div className="lbp-mine__grid">
            {allRanks.map((r) => (
              <button
                key={r.category}
                type="button"
                className={`lbp-mine__card${category === r.category ? " is-active" : ""}`}
                onClick={() => setCategory(r.category)}
              >
                <span className="lbp-mine__cat">{r.category}</span>
                <strong className="lbp-mine__rank">
                  {r.rank}
                  <i>위</i>
                </strong>
                <span className="lbp-mine__pts">{formatNumber(r.points)} P</span>
              </button>
            ))}
          </div>
        </section>

        {/* 시즌 리워드 배너 */}
        <section className="lbp-reward" aria-label="시즌 보상">
          <div className="lbp-section-head">
            <h2>🏅 이번 시즌 순위 보상</h2>
            <p>시즌 종료 시 순위에 따라 배지와 여권 스탬프가 지급돼요.</p>
          </div>
          <div className="lbp-reward__grid">
            {SEASON_REWARDS.map((reward) => (
              <div className="lbp-reward__card" key={reward.rank}>
                <span className="lbp-reward__medal" aria-hidden="true">
                  {reward.medal}
                </span>
                <span className="lbp-reward__rank">{reward.rank}</span>
                <b className="lbp-reward__title">{reward.title}</b>
                <span className="lbp-reward__desc">{reward.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
