import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { formatNumber } from "@/lib/landing-data";
import { getCurrentUserProfile, getPassportExpPercent } from "@/lib/user-profile";
import { getFixedHeaderHeight, scrollToSection, syncHeaderHeightCssVar } from "@/utils/layout";
import { demoProps, useToast } from "./ToastProvider";

/** 패스포트 카드가 로그인 상태로 노출되는 동안 프로필 표시 */
const SHOW_LANDING_PROFILE = true;

const SLIDE_COUNT = 5;
const CATEGORIES = [
  { icon: "⛵", label: "해상 레저", to: "/sports?category=water" },
  { icon: "🤿", label: "수중 레저", to: "/sports?category=water" },
  { icon: "🥾", label: "육상 레저", to: "/sports?category=land" },
  { icon: "🎯", label: "체험·힐링", to: "/sports?category=exp" },
  { icon: "⋯", label: "기타 레저", to: "/sports" },
] as const;

const AGENT_PLACEHOLDERS = [
  "초보자가 가기 좋은 섬 추천해줘",
  "당일치기 가능한 섬 추천",
  "카약 타기 좋은 곳 알려줘",
] as const;

type HeroSectionProps = {
  agentInputRef?: RefObject<HTMLTextAreaElement | null>;
  agentActive?: boolean;
  onAgentActiveChange?: (active: boolean) => void;
};

export function HeroSection({
  agentInputRef,
  agentActive = false,
  onAgentActiveChange,
}: HeroSectionProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const profile = getCurrentUserProfile();
  const expPercent = getPassportExpPercent(profile);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentPlaceholderIndex, setAgentPlaceholderIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentPlaceholderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToMap = () => {
    scrollToSection("map");
  };

  const handleAgentSubmit = () => {
    const query = agentQuery.trim();
    if (!query) {
      showToast("질문을 입력해 주세요");
      return;
    }
    navigate("/ai-recommend", { state: { initialMessage: query } });
    setAgentQuery("");
  };

  const startHero = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      timerRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
      }, 5000);
    }
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

  useEffect(() => {
    syncHeaderHeightCssVar();
    window.addEventListener("resize", syncHeaderHeightCssVar);
    return () => window.removeEventListener("resize", syncHeaderHeightCssVar);
  }, []);

  /* One-wheel jump hero ↔ map; destinations from live layout (no cached heroH / offsets). */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let locked = false;
    let unlockTimer: ReturnType<typeof window.setTimeout> | undefined;

    const unlock = () => {
      locked = false;
      if (unlockTimer !== undefined) window.clearTimeout(unlockTimer);
      unlockTimer = undefined;
    };

    const jumpTo = (id: string) => {
      locked = true;
      scrollToSection(id);

      const supportsScrollEnd = "onscrollend" in window;
      if (supportsScrollEnd) {
        window.addEventListener("scrollend", unlock, { once: true });
        unlockTimer = window.setTimeout(unlock, 1200);
      } else {
        let lastY = window.scrollY;
        const check = () => {
          if (Math.abs(window.scrollY - lastY) < 1) {
            unlock();
            return;
          }
          lastY = window.scrollY;
          unlockTimer = window.setTimeout(check, 100);
        };
        unlockTimer = window.setTimeout(check, 150);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (locked) return;

      const map = document.getElementById("map");
      if (!map) return;

      const y = window.scrollY;
      const headerH = getFixedHeaderHeight();
      const mapSnapY = map.getBoundingClientRect().top + window.scrollY - headerH;

      if (e.deltaY > 0 && y <= 60) {
        e.preventDefault();
        jumpTo("map");
        return;
      }

      if (e.deltaY < 0 && y >= mapSnapY - 40 && y <= mapSnapY + 160) {
        e.preventDefault();
        jumpTo("hero");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scrollend", unlock);
      if (unlockTimer !== undefined) window.clearTimeout(unlockTimer);
    };
  }, []);

  useEffect(() => {
    if (agentPlaceholderTimerRef.current) clearInterval(agentPlaceholderTimerRef.current);

    if (agentQuery.trim() || agentActive) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    agentPlaceholderTimerRef.current = setInterval(() => {
      setAgentPlaceholderIndex((prev) => (prev + 1) % AGENT_PLACEHOLDERS.length);
    }, 4000);

    return () => {
      if (agentPlaceholderTimerRef.current) clearInterval(agentPlaceholderTimerRef.current);
    };
  }, [agentQuery, agentActive]);

  const agentPlaceholder = AGENT_PLACEHOLDERS[agentPlaceholderIndex];

  return (
    <section
      className="hero"
      id="hero"
      onMouseEnter={() => timerRef.current && clearInterval(timerRef.current)}
      onMouseLeave={startHero}
    >
      <div className="hero-slides" aria-hidden="true">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <div key={i} className={`slide s${i + 1}${activeSlide === i ? " on" : ""}`} />
        ))}
        <div className="hero-shade" />
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">바다, 산, 섬을 넘나드는 새로운 여정</span>
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
          <div className="hero-cta">
            <Link className="btn btn-navy" to="/islands">
              탐험 시작하기 →
            </Link>
            <Link className="btn btn-white" to="/sports">
              레저스포츠 보기
            </Link>
          </div>
          <div className="cats" aria-label="레저 카테고리">
            {CATEGORIES.map(({ icon, label, to }) => (
              <Link className="cat" key={label} to={to}>
                <i>{icon}</i>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pass-card-wrap">
          <div className="pc-agent" id="ai-agent" role="search">
            <div className={`pc-agent-panel${agentActive ? " is-active" : ""}`}>
              <div className="pc-agent-head">
                <span className="pc-agent-title">인천섬 레저누리 AI 추천 서비스</span>
              </div>
              <div className="pc-agent-field">
                <textarea
                  ref={agentInputRef}
                  className="pc-agent-input"
                  value={agentQuery}
                  onChange={(event) => setAgentQuery(event.target.value)}
                  onFocus={() => onAgentActiveChange?.(true)}
                  onBlur={() => onAgentActiveChange?.(false)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleAgentSubmit();
                    }
                  }}
                  placeholder={agentPlaceholder}
                  rows={2}
                  aria-label="AI에게 질문하기"
                />
                <button
                  type="button"
                  className="pc-agent-send"
                  onClick={handleAgentSubmit}
                  aria-label="질문 보내기"
                  disabled={!agentQuery.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 19V5M12 5l-6 6M12 5l6 6"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <aside className="pass-card" aria-label="나의 i-바다패스">
            <div className="pc-head">
              <h3>나의 i-바다패스</h3>
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
              {/* i-바다 패스 card */}
              <div className="passport-cover" aria-hidden="true">
                <div className="passport-cover__book">
                  <span className="passport-cover__shadow" />
                  <span className="passport-cover__thickness" />
                  <span className="passport-cover__spine" />
                  <span className="passport-cover__pages" />
                  <div className="passport-cover__face">
                    <span className="passport-cover__sheen" />
                    <p className="passport-cover__title">i-바다패스</p>
                    <svg className="passport-cover__emblem" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                      <circle cx="40" cy="40" r="31" stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
                      <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.5 3.8" opacity="0.65" />
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
                    <p className="passport-cover__footer">INCHEON</p>
                  </div>
                </div>
              </div>

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
                    <span className="passport-progress-fill" style={{ width: `${expPercent}%` }} />
                  </div>
                  <p className="passport-exp">
                    EXP {formatNumber(profile.expCurrent)} / {formatNumber(profile.expMax)}
                  </p>
                </div>

                <div className="passport-metrics" aria-label="탐험 현황">
                  <div className="passport-metric">
                    <b>{profile.visitedIslandCount}</b>
                    <span>방문 섬</span>
                  </div>
                  <div className="passport-metric">
                    <b>{profile.completedMissions}</b>
                    <span>완료 미션</span>
                  </div>
                  <div className="passport-metric">
                    <b>{profile.earnedBadgeCount}</b>
                    <span>획득 배지</span>
                  </div>
                </div>

                {SHOW_LANDING_PROFILE ? (
                  <Link to="/mypage" className="btn-passport-view">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 17c.8-2 2.2-3 4-3s3.2 1 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    여권 보기
                  </Link>
                ) : (
                  <Link to="/login" className="btn-passport-view" {...demoProps("로그인 후 여권을 확인할 수 있어요")}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 17c.8-2 2.2-3 4-3s3.2 1 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    여권 보기
                  </Link>
                )}
              </div>
            </div>

            <div className="quick-grid">
              <Link className="q" to="/islands">
                <i>📍</i>추천 섬
              </Link>
              <span className="q" {...demoProps("나에게 맞는 섬BTI를 찾아보세요!")}>
                <i>🏝️</i>섬BTI
              </span>
              <Link className="q" to="/sports">
                <i>📅</i>레저스포츠
              </Link>
              <span className="q" {...demoProps("안전 정보 페이지는 준비 중이에요")}>
                <i>🛟</i>안전 정보
              </span>
            </div>
            <p className="pc-foot">로그인하면 방문 기록 · 미션 · 배지가 여권에 자동 저장돼요</p>
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

      <button
        type="button"
        className={`hero-scroll-hint${showScrollHint ? "" : " is-hidden"}`}
        onClick={scrollToMap}
        aria-label="섬 지도 섹션으로 이동"
      >
        <span className="hero-scroll-label">스크롤하여 더 알아보기</span>
        <span className="hero-scroll-chevron" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10l5 5 5-5M7 14l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </section>
  );
}
