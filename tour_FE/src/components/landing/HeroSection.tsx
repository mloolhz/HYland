import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { AuthorAvatar } from "@/components/community/AuthorAvatar";
import { formatNumber } from "@/lib/landing-data";
import { getCurrentUserProfile, getPassportExpPercent } from "@/lib/user-profile";
import { demoProps, useToast } from "./ToastProvider";

/** 패스포트 카드가 로그인 상태로 노출되는 동안 프로필 표시 */
const SHOW_LANDING_PROFILE = true;

const SLIDE_COUNT = 5;
const CATEGORIES = [
  ["⛵", "해양 레저"],
  ["🏃", "러닝"],
  ["🚴", "사이클"],
  ["🥾", "하이킹"],
  ["🎣", "낚시"],
  ["🏕️", "캠핑"],
  ["🏄", "패들보드"],
  ["⋯", "더보기"],
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
  const { showToast } = useToast();
  const profile = getCurrentUserProfile();
  const expPercent = getPassportExpPercent(profile);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [agentQuery, setAgentQuery] = useState("");
  const [agentPlaceholderIndex, setAgentPlaceholderIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0][1]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentPlaceholderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleAgentSubmit = () => {
    const query = agentQuery.trim();
    if (!query) {
      showToast("질문을 입력해 주세요");
      return;
    }
    showToast("AI 어시스턴트 서비스는 아직 개발중이에요.");
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
    const onScroll = () => setShowScrollHint(window.scrollY < 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      id="home"
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
          <div className="hero-action-group">
            <p className="hero-sub">
              <span className="hero-sub-line">해양 레저부터 러닝, 사이클, 하이킹까지 —</span>
              <span className="hero-sub-line hero-sub-line--anchor">
                인천의 섬에서 다양한 레저스포츠를 만나보세요.
              </span>
            </p>
            <div className="hero-cta">
              <a className="btn btn-hero-primary" href="#map">
                탐험 시작하기
                <span className="btn-hero-arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a className="btn btn-hero-secondary" href="#booking">
                레저 예약 보기
              </a>
            </div>
          </div>
          <div className="cats" aria-label="레저 카테고리">
            {CATEGORIES.map(([icon, label]) => (
              <button
                type="button"
                key={label}
                className={`cat${activeCategory === label ? " is-active" : ""}`}
                aria-pressed={activeCategory === label}
                onClick={() => setActiveCategory(label)}
              >
                <i aria-hidden="true">{icon}</i>
                <span>{label}</span>
              </button>
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
                  rows={1}
                  aria-label="AI에게 질문하기"
                />
                <button
                  type="button"
                  className="pc-agent-send"
                  onClick={handleAgentSubmit}
                  aria-label="질문 보내기"
                  disabled={!agentQuery.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
              {SHOW_LANDING_PROFILE ? (
                <Link to="/mypage" className="passport-cover passport-cover--link" aria-label="여권 보기 - 마이페이지로 이동">
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
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="passport-cover passport-cover--link"
                  aria-label="로그인 후 여권 보기"
                  {...demoProps("로그인 후 여권을 확인할 수 있어요")}
                >
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
                </Link>
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
              <span className="q" {...demoProps("추천 섬 페이지는 준비 중이에요")}>
                <i>📍</i>추천 섬
              </span>
              <span className="q" {...demoProps("나에게 맞는 섬BTI를 찾아보세요!")}>
                <i>🏝️</i>섬BTI
              </span>
              <span className="q" {...demoProps("레저 예약은 아래 섹션에서 미리 만나보세요")}>
                <i>📅</i>레저 예약
              </span>
              <span className="q" {...demoProps("안전 정보 페이지는 준비 중이에요")}>
                <i aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </i>
                안전 정보
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

      <div className={`hero-scroll-hint${showScrollHint ? "" : " is-hidden"}`}>
        <span className="hero-scroll-label">스크롤하여 더 알아보기</span>
        <a href="#map" className="hero-scroll-chevron" aria-label="아래로 스크롤하여 더 알아보기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    </section>
  );
}
