
import { useEffect, useRef } from "react";
import { demoProps } from "./ToastProvider";

const BADGES = [
  { state: "earned", icon: "⚓", title: "첫 탐험", desc: "첫 섬 방문 완료" },
  { state: "earned", icon: "🏝️", title: "5개 섬 탐험", desc: "섬 5곳 방문 완료" },
  { state: "doing", icon: "🏅", lock: "⏳", title: "레저 마스터", desc: "레저 5종 체험 · 3/5" },
  { state: "doing", icon: "🦀", lock: "⏳", title: "갯벌 지킴이", desc: "갯벌 체험 · 1/3" },
  { state: "locked", icon: "🧭", lock: "🔒", title: "섬 완주자", desc: "전 코스 완주 시 획득" },
  { state: "locked", icon: "⛵", lock: "🔒", title: "서해 개척자", desc: "서해 5도 방문 시 획득" },
] as const;

const PROGRESS = [
  { label: "수집 카드", value: "12 / 48", width: 25, gold: false },
  { label: "퍼즐 완성도", value: "36%", width: 36, gold: true },
  { label: "이번 주 미션", value: "2 / 3", width: 66, gold: false },
] as const;

function ProgressBar({ width, gold }: { width: number; gold?: boolean }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        el.style.width = `${width}%`;
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div className="track">
      <div ref={fillRef} className={`fill${gold ? " gold" : ""}`} data-w={width} />
    </div>
  );
}

export function MissionSection() {
  return (
    <section className="sec" id="mission" style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">⭐</span>
          <h2>미션 &amp; 인증</h2>
          <a className="more" href="#" {...demoProps("미션 전체 보기는 준비 중이에요 ⭐")}>
            더보기 →
          </a>
        </div>
        <p className="sec-sub reveal">
          미션을 완료하고 배지와 카드를 모아보세요! 모은 배지는 바다패스 여권에 기록됩니다.
        </p>
        <div className="mis-wrap">
          <div className="badge-card reveal">
            <div className="badge-grid">
              {BADGES.map((badge) => (
                <div className={`badge ${badge.state}`} key={badge.title}>
                  <span className="b-ic">
                    <i>{badge.icon}</i>
                    {"lock" in badge && badge.lock && <span className="lock">{badge.lock}</span>}
                  </span>
                  <b>{badge.title}</b>
                  <span>{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="prog-card reveal">
            <h3>📊 나의 진행 현황</h3>
            {PROGRESS.map((row) => (
              <div className="bar-row" key={row.label}>
                <div className="bl">
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </div>
                <ProgressBar width={row.width} gold={row.gold} />
              </div>
            ))}
            <p className="prog-note">
              💡 이번 주 남은 미션: <b>새로운 섬 1곳 방문하기</b> — 완료하면 배지 카드 1장이 지급돼요!
            </p>
            <button className="btn btn-navy btn-block" {...demoProps("미션 확인 페이지는 준비 중이에요 ⭐")}>
              미션 확인하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
