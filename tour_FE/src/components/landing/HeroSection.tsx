import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { formatNumber } from "@/lib/landing-data";
import { getBadgeStats, getCurrentUserProfile, getPassportExpPercent } from "@/lib/user-profile";
import { demoProps } from "./ToastProvider";
import {
  HERO_SLIDE_DURATION_MS,
  HERO_SLIDE_FADE_MS,
  HERO_SLIDES,
} from "@/lib/landing-images";
import { PassportBookModal } from "./PassportBookModal";
import { PassportCoverVisual } from "./PassportCoverVisual";

/** 패스포트 카드가 로그인 상태로 노출되는 동안 프로필 표시 */
const SHOW_LANDING_PROFILE = true;

const SLIDE_COUNT = HERO_SLIDES.length;
const CATEGORIES = [
  { icon: "⛵", label: "해상 레저", to: "/sports?category=water" },
  { icon: "🥾", label: "육상 레저", to: "/sports?category=land" },
  { icon: "🎯", label: "체험", to: "/sports?category=exp" },
  { icon: "🌿", label: "힐링", to: "/sports?category=heal" },
] as const;

export function HeroSection() {
  const profile = getCurrentUserProfile();
  const badgeStats = getBadgeStats();
  const expPercent = getPassportExpPercent(profile);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const passportTriggerRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHero = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      timerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
      }, HERO_SLIDE_DURATION_MS);
    }
  }, []);

  useEffect(() => {
    HERO_SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    startHero();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startHero]);

  useEffect(() => {
    const onScroll = () => setShowScrollHint(window.scrollY < 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="hero"
      id="home"
      onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
      onMouseLeave={startHero}
    >
      <div
        className="hero-slides"
        aria-hidden="true"
        style={
          {
            "--hero-slide-duration": `${HERO_SLIDE_DURATION_MS}ms`,
            "--hero-slide-fade": `${HERO_SLIDE_FADE_MS}ms`,
          } as React.CSSProperties
        }
      >
        {HERO_SLIDES.map((src, i) => (
          <div
            key={src}
            className={`slide${activeSlide === i ? " on" : ""}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">
            인천의 섬에서
            <br />
            <span className="hl">나만의 레저 여정</span>을
            <br />
            시작하세요
          </h1>
          <p className="hero-sub">
            해상·수중·육상·체험 레저까지 —
            <br />
            인천의 섬에서 다양한 레저스포츠를 만나보세요.
          </p>
          <div className="hero-copy-actions">
            <div className="hero-cta">
              <Link className="btn btn-hero-start" to="/islands">
                탐험 시작하기 →
              </Link>
            </div>
            <div className="cats" aria-label="레저 카테고리">
              {CATEGORIES.map(({ icon, label, to }, index) => (
                <Link className={`cat${index === 0 ? " cat--featured" : ""}`} key={label} to={to}>
                  <i>{icon}</i>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pass-card-wrap">
          <aside className="pass-card" aria-label="나의 섬 여권">
            <div className="pc-head">
              <h3>나의 섬 여권</h3>
              {SHOW_LANDING_PROFILE ? (
                <Link to="/mypage" className="pc-profile-link">
                  <AuthorAvatar author={{ nickname: profile.nickname }} className="pc-profile-avatar" />
                  <span>{profile.nickname}님</span>
                </Link>
              ) : (
                <Link to="/login" className="pc-login-link">
                  로그인하기
                </Link>
              )}
            </div>

            <div className="pc-passport-layout">
              {SHOW_LANDING_PROFILE ? (
                <button
                  type="button"
                  ref={passportTriggerRef}
                  className="passport-cover passport-cover--link passport-cover--trigger"
                  aria-label="마이 여권 펼치기"
                  aria-haspopup="dialog"
                  onClick={() => setPassportModalOpen(true)}
                >
                  <PassportCoverVisual />
                </button>
              ) : (
                <div className="passport-cover" aria-hidden="true">
                  <PassportCoverVisual />
                </div>
              )}

              <div className="passport-info">
                <div className="passport-level">
                  <div className="passport-level-top">
                    <span className="passport-level-badge">Lv.{profile.level}</span>
                    <strong>{profile.levelTitle}</strong>
                  </div>
                  <div
                    className="passport-progress"
                    role="progressbar"
                    aria-valuenow={expPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="경험치 진행률"
                  >
                    <AnimatedWidthBar width={expPercent} className="passport-progress-fill" />
                  </div>
                  <p className="passport-exp">
                    EXP{" "}
                    <CountUpNumber value={profile.expCurrent} delay={200} format={formatNumber} />
                    {" / "}
                    {formatNumber(profile.expMax)}
                  </p>
                </div>

                <div className="passport-metrics" aria-label="탐험 현황">
                  <div className="passport-metric">
                    <CountUpNumber value={badgeStats.visited} delay={320} className="passport-metric__value" />
                    <span>방문 섬</span>
                  </div>
                  <div className="passport-metric">
                    <CountUpNumber value={badgeStats.earned} delay={400} className="passport-metric__value" />
                    <span>획득 배지</span>
                  </div>
                  <div className="passport-metric">
                    <CountUpNumber value={badgeStats.unearned} delay={480} className="passport-metric__value" />
                    <span>미획득 배지</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-grid">
              <Link className="q" to="/islands">
                <i>📍</i>추천 섬
              </Link>
              <Link className="q" to="/island-bti">
                <i>🏝️</i>섬BTI
              </Link>
              <span className="q" {...demoProps("안전 정보 페이지는 준비 중이에요")}>
                <i>🛟</i>안전 정보
              </span>
            </div>
          </aside>
          <a
            className="btn-ipass"
            href="https://island.theksa.co.kr/page/main"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ip-badge">인천시민</span>인천 i 바다패스로 예매하기<span className="ip-arrow">→</span>
          </a>
        </div>
      </div>

      <div className={`hero-scroll-hint${showScrollHint ? "" : " is-hidden"}`}>
        <span className="hero-scroll-label">스크롤하여 더 알아보기</span>
        <a href="#map" className="hero-scroll-chevron" aria-label="아래로 스크롤하여 더 알아보기">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 10l5 5 5-5M7 14l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <PassportBookModal
        open={passportModalOpen}
        onClose={() => setPassportModalOpen(false)}
        profile={profile}
        returnFocusRef={passportTriggerRef}
      />
    </section>
  );
}
