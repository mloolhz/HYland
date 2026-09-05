import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/store/session";
import { LandingLoginCard } from "@/components/landing/LandingLoginCard";
import { useBadgeStats } from "@/hooks/useBadgeStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { scrollToSection } from "@/utils/layout";
import { demoProps } from "./ToastProvider";
import {
  HERO_SLIDE_DURATION_MS,
  HERO_SLIDE_FADE_MS,
  HERO_SLIDES,
} from "@/lib/landing-images";
import { PassportBookModal } from "./PassportBookModal";
import { PassportCoverVisual } from "./PassportCoverVisual";
import { IncheonWeatherBar } from "./IncheonWeatherBar";

/** 패스포트 카드가 로그인 상태로 노출되는 동안 프로필 표시 */

const SLIDE_COUNT = HERO_SLIDES.length;
const CATEGORIES = [
  { icon: "⛵", label: "해상 레저", to: "/sports?category=water" },
  { icon: "🥾", label: "육상 레저", to: "/sports?category=land" },
  { icon: "🎯", label: "체험", to: "/sports?category=exp" },
  { icon: "🌿", label: "힐링", to: "/sports?category=heal" },
] as const;

export function HeroSection() {
  const profile = useUserProfile();
  const badgeStats = useBadgeStats();
  // 예전에는 SHOW_LANDING_PROFILE = true 로 박아둬서, 로그인 안 한 사람에게도
  // 남의 닉네임과 수치가 그대로 보였다.
  const { isLoggedIn } = useSession();
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
    const onScroll = () => setShowScrollHint(window.scrollY < 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToMap = () => {
    scrollToSection("map");
  };

  return (
    <section
      className="hero"
      id="hero"
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
          <IncheonWeatherBar />
          {!isLoggedIn ? (
            <LandingLoginCard />
          ) : (
          <aside className="pass-card" aria-label="나의 섬 여권">
            <div className="pc-head">
              <h3>나의 섬 여권</h3>
              <Link to="/mypage" className="pc-profile-link">
                <AuthorAvatar author={{ nickname: profile.nickname }} className="pc-profile-avatar" />
                <span>{profile.nickname}님</span>
              </Link>
            </div>

            <div className="pc-passport-layout">
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

              {/*
                레벨·경험치는 뺐다. DB 에 칸만 있고 올려 주는 곳이 없어서
                누구나 영원히 "Lv.1 새싹 탐험가 · EXP 0 / 1000" 이었다.
                실제로 쌓이는 수치(방문 섬·배지)만 남긴다.
              */}
              <div className="passport-info">
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
          )}
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

      <button
        type="button"
        className={`hero-scroll-hint${showScrollHint ? "" : " is-hidden"}`}
        onClick={scrollToMap}
        aria-label="섬 지도 섹션으로 이동"
      >
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
      </button>

      <PassportBookModal
        open={passportModalOpen}
        onClose={() => setPassportModalOpen(false)}
        profile={profile}
        returnFocusRef={passportTriggerRef}
      />
    </section>
  );
}
