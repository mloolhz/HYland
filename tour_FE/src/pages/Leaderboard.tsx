import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { avaColor, SEASON_REWARDS } from "@/lib/landing-data";
import { useLeaderboardView } from "@/hooks/useLeaderboard";
import { MISSION_CATEGORIES, type MissionCategory } from "@/mocks/missions";

/**
 * 리더보드
 *
 * 순위 기준은 "획득한 배지 수"다. 미션을 완료해야 배지가 나오므로 미션 탭에
 * 보이는 숫자와 그대로 맞고, 어떻게 나온 등수인지 따로 설명할 것이 없다.
 * (예전에는 lib/landing-data 의 고정 순위표와 방문×100 + 미션×50 이라는
 *  별도 점수를 썼는데, 그 점수가 화면 어디에도 없어 근거를 알 수 없었다.)
 */
export function LeaderboardView() {
  const [category, setCategory] = useState<MissionCategory>("섬");
  const me = useUserProfile();
  const { rows, myRank, byCategoryAll, loading } = useLeaderboardView(category);

  const myBadges = myRank?.badgeCount ?? 0;
  /** 바로 위 순위 — 있으면 "몇 개 더 모으면 따라잡는지" 를 보여준다 */
  const above = myRank && myRank.rank > 1 ? rows[myRank.rank - 2] : undefined;
  const gap = above ? Math.max(above.badgeCount - myBadges, 0) : 0;
  const progressPercent = above && above.badgeCount > 0
    ? Math.round((myBadges / above.badgeCount) * 100)
    : 0;

  const bestCategory = byCategoryAll
    .filter((r) => r.rank > 0)
    .sort((a, b) => a.rank - b.rank)[0];

  return (
    <div className="container">
      {/* 내 순위 카드 */}
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
              {myRank ? (
                <>
                  <strong>
                    <CountUpNumber value={myRank.rank} delay={0} className="lbp-me__count" />
                  </strong>
                  <span>위</span>
                </>
              ) : (
                <span>순위 없음</span>
              )}
            </div>
            <div className="lbp-me__pts">
              <CountUpNumber
                value={myBadges}
                delay={120}
                suffix=" 배지"
                className="lbp-me__count"
              />
            </div>
          </div>
        </div>

        <div className="lbp-next">
          {above ? (
            <>
              <div className="lbp-next__label">
                <span>
                  🔥 다음 순위 <b>{above.nickname}</b>까지
                </span>
                <span className="lbp-next__gap">배지 {gap}개</span>
              </div>
              <div className="lbp-next__track">
                <AnimatedWidthBar width={progressPercent} delay={240} className="lbp-next__fill" />
              </div>
            </>
          ) : myRank ? (
            <div className="lbp-next__label lbp-next__label--top">
              <span>👑 {category} 부문 1위! 최고의 탐험가예요.</span>
            </div>
          ) : (
            <div className="lbp-next__label lbp-next__label--top">
              <span>🎯 {category} 미션을 완료하고 배지를 모으면 순위에 올라요.</span>
            </div>
          )}
        </div>
      </section>

      <div className="lb-card">
        <div className="lb-top">
          <div className="lb-bar">
            <div className="lb-title">
              LEADERBOARD <small>카테고리별 배지 획득 순위</small>
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

          {/* 아직 아무도 배지를 못 받은 카테고리는 시상대를 비워 둔다 */}
          <div className="podium">
            {[2, 1, 3].map((rank) => {
              const row = rows[rank - 1];
              return (
                <div className={`pd pd-${rank}${row ? "" : " pd--empty"}`} key={rank}>
                  {rank === 1 && row && (
                    <>
                      <span className="laurel l">🌿</span>
                      <span className="laurel r">🌿</span>
                    </>
                  )}
                  <span className="pd-rank">#{rank}</span>
                  <div
                    className="pd-ava"
                    style={{
                      background: row
                        ? `linear-gradient(150deg, ${avaColor(row.nickname)}, #2D2E6B)`
                        : "linear-gradient(150deg, #C9CEDB, #7D8398)",
                    }}
                  >
                    {row ? row.nickname[0] : "–"}
                  </div>
                  <span className="medal">{rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉"}</span>
                  <span className="pd-name">{row ? row.nickname : "아직 없음"}</span>
                  <span className="pd-pts">{row ? `배지 ${row.badgeCount}개` : "–"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ul className="lb-list">
          {rows.slice(3).map((row) => (
            <li key={row.userId}>
              <span className="rk">#{row.rank}</span>
              <span className="ava" style={{ background: avaColor(row.nickname) }}>
                {row.nickname[0]}
              </span>
              <span className="nm">{row.nickname}</span>
              <span className="pt">배지 {row.badgeCount}개</span>
            </li>
          ))}
        </ul>

        {!loading && rows.length === 0 && (
          <p className="lb-empty">아직 {category} 부문 배지를 받은 탐험가가 없어요.</p>
        )}
      </div>

      {/* 내 부문별 순위 */}
      <section className="lbp-mine" aria-label="내 부문별 순위">
        <div className="lbp-section-head">
          <h2>내 부문별 순위</h2>
          <p>
            {bestCategory ? (
              <>
                가장 강한 부문은 <b>{bestCategory.category}</b> {bestCategory.rank}위예요.
              </>
            ) : (
              <>미션을 완료해 배지를 받으면 부문별 순위가 생겨요.</>
            )}
          </p>
        </div>
        <div className="lbp-mine__grid">
          {byCategoryAll.map((r) => (
            <button
              key={r.category}
              type="button"
              className={`lbp-mine__card${category === r.category ? " is-active" : ""}`}
              onClick={() => setCategory(r.category)}
            >
              <span className="lbp-mine__cat">{r.category}</span>
              <strong className="lbp-mine__rank">
                {r.rank > 0 ? (
                  <>
                    {r.rank}
                    <i>위</i>
                  </>
                ) : (
                  <i>–</i>
                )}
              </strong>
              <span className="lbp-mine__pts">배지 {r.badgeCount}개</span>
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
  );
}
