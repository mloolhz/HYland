
import { useEffect, useRef } from "react";
import { demoProps } from "./ToastProvider";
import { MISSION_BADGES, MISSION_PROGRESS } from "@/mocks/missions";

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
              {MISSION_BADGES.map((badge) => (
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
            {MISSION_PROGRESS.map((row) => (
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
