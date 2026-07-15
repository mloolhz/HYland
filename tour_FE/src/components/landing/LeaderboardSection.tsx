import { useState } from "react";
import {
  avaColor,
  formatNumber,
  LEADERBOARD,
  type LeaderboardPeriod,
} from "@/lib/landing-data";
import { demoProps, useToast } from "./ToastProvider";

const RESET_NOTICE: Record<LeaderboardPeriod, string | null> = {
  week: "매주 월요일 00:00 초기화",
  month: "매월 1일 00:00 초기화",
  all: null,
};

type LeaderboardSectionProps = {
  onScrollToLogin: () => void;
};

export function LeaderboardSection({ onScrollToLogin }: LeaderboardSectionProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const { showToast } = useToast();
  const data = LEADERBOARD[period];
  const resetNotice = RESET_NOTICE[period];

  const handleLogin = () => {
    onScrollToLogin();
    showToast("🛂 바다패스에 로그인하면 내 순위를 볼 수 있어요!");
  };

  return (
    <section className="sec" id="leaderboard" style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">🏆</span>
          <h2>탐험가 리더보드</h2>
          <a className="more" href="#" {...demoProps("리더보드 전체 순위는 준비 중이에요 🏆")}>
            전체 순위 →
          </a>
        </div>
        <p className="sec-sub reveal">
          섬을 방문하고 미션을 완료하면 탐험 포인트가 쌓여요. 이번 주 최고의 탐험가는 누구일까요?
        </p>
        <div className="lb-card reveal rv-z">
          <div className="lb-top">
            <div className="lb-bar">
              <div className="lb-title">
                LEADERBOARD
                {resetNotice && <small>{resetNotice}</small>}
              </div>
              <div className="lb-tabs" role="tablist">
                {(["week", "month", "all"] as const).map((key) => (
                  <button
                    key={key}
                    className={period === key ? "on" : ""}
                    data-period={key}
                    onClick={() => setPeriod(key)}
                  >
                    {key === "week" ? "주간" : key === "month" ? "월간" : "전체"}
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
                      style={{ background: `linear-gradient(150deg, ${avaColor(name)}, #0E2B52)` }}
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
