
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

const PASSPORT_PROFILE = {
  nickname: "바다탐험가",
  region: "인천 중구",
  seomBti: "감성 힐링러",
};

const PASSPORT_METRICS = [
  { value: "12", label: "방문 섬" },
  { value: "28", label: "완료 미션" },
  { value: "15", label: "획득 배지" },
];

export function MissionSection() {
  return (
    <section className="sec" id="mission" style={{ paddingTop: 20 }}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="sec-ico">🛂</span>
          <h2>i-바다패스</h2>
          <a className="more" href="#" {...demoProps("여권 전체 보기는 준비 중이에요 🛂")}>
            더보기 →
          </a>
        </div>
        <p className="sec-sub reveal">
          인천의 섬을 탐험하며 도장을 모아보세요! 방문 기록과 배지가 나만의 바다패스 여권에 기록됩니다.
        </p>

        <div className="pp-book reveal">
          <span className="pp-book__spine" aria-hidden="true" />

          {/* 왼쪽 페이지 — 신원 정보 */}
          <div className="pp-page pp-page--id">
            <div className="pp-id-head">
              <svg className="pp-emblem" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <circle cx="40" cy="40" r="31" stroke="currentColor" strokeWidth="1.4" opacity="0.85" />
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeDasharray="2.5 3.8"
                  opacity="0.6"
                />
                <path d="M40 13 L43.2 19.5 L36.8 19.5 Z" fill="currentColor" />
                <path d="M40 67 L43.2 60.5 L36.8 60.5 Z" fill="currentColor" />
                <path d="M13 40 L19.5 36.8 L19.5 43.2 Z" fill="currentColor" />
                <path d="M67 40 L60.5 36.8 L60.5 43.2 Z" fill="currentColor" />
                <circle cx="40" cy="27" r="4.5" stroke="currentColor" strokeWidth="2" />
                <path d="M40 31.5 V50" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M29 42 H51" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <path
                  d="M40 50 C32 50 25.5 55 23 62 C29.5 58.5 34.5 58 40 58 C45.5 58 50.5 58.5 57 62 C54.5 55 48 50 40 50 Z"
                  fill="currentColor"
                />
              </svg>
              <div className="pp-id-title">
                <p className="pp-id-country">대한민국 · 인천</p>
                <p className="pp-id-doc">i-바다패스 · PASSPORT</p>
              </div>
            </div>

            <div className="pp-profile">
              <div className="pp-photo">
                <img src="/profile-sample.png" alt="프로필 사진" />
              </div>
              <dl className="pp-fields">
                <div className="pp-field">
                  <dt>닉네임</dt>
                  <dd>{PASSPORT_PROFILE.nickname}</dd>
                </div>
                <div className="pp-field">
                  <dt>거주지</dt>
                  <dd>{PASSPORT_PROFILE.region}</dd>
                </div>
                <div className="pp-field">
                  <dt>섬BTI</dt>
                  <dd>{PASSPORT_PROFILE.seomBti}</dd>
                </div>
              </dl>
            </div>

            <div className="pp-level">
              <div className="pp-level-top">
                <span className="pp-level-badge">Lv.3</span>
                <strong>탐험가</strong>
              </div>
              <div
                className="pp-progress"
                role="progressbar"
                aria-valuenow={68}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="경험치 진행률"
              >
                <span className="pp-progress-fill" style={{ width: "68%" }} />
              </div>
              <p className="pp-exp">EXP 1,350 / 2,000</p>
            </div>

            <div className="pp-metrics" aria-label="탐험 현황">
              {PASSPORT_METRICS.map((metric) => (
                <div className="pp-metric" key={metric.label}>
                  <b>{metric.value}</b>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="pp-progress-list">
              {MISSION_PROGRESS.map((row) => (
                <div className="bar-row" key={row.label}>
                  <div className="bl">
                    <span>{row.label}</span>
                    <b>{row.value}</b>
                  </div>
                  <ProgressBar width={row.width} gold={row.gold} />
                </div>
              ))}
            </div>

            <Link to="/login" className="btn btn-navy btn-block pp-view-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 17c.8-2 2.2-3 4-3s3.2 1 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              여권 보기
            </Link>
          </div>

          {/* 오른쪽 페이지 — 인증 스탬프 */}
          <div className="pp-page pp-page--stamps">
            <div className="pp-page-head">
              <h3>인증 스탬프</h3>
              <span className="pp-page-num">P. 03</span>
            </div>

            <div className="pp-stamp-grid">
              {MISSION_BADGES.map((badge) => (
                <div className={`pp-stamp ${badge.state}`} key={badge.title}>
                  <span className="pp-stamp-ic">
                    <i>{badge.icon}</i>
                    {"lock" in badge && badge.lock && <span className="pp-stamp-lock">{badge.lock}</span>}
                  </span>
                  <b>{badge.title}</b>
                  <span>{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
