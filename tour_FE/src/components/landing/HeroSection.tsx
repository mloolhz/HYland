import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { getFixedHeaderHeight, scrollToSection, syncHeaderHeightCssVar } from "@/utils/layout";
import { demoProps, useToast } from "./ToastProvider";

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [agentQuery, setAgentQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToMap = () => {
    scrollToSection("map");
  };

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
            해양 레저부터 러닝, 사이클, 하이킹까지 —
            <br />
            인천의 섬에서 다양한 레저스포츠를 만나보세요.
          </p>
          <div className="hero-cta">
            <a className="btn btn-navy" href="#map">
              탐험 시작하기 →
            </a>
            <a className="btn btn-white" href="#booking">
              레저 예약 보기
            </a>
          </div>
          <div className="cats" aria-label="레저 카테고리">
            {CATEGORIES.map(([icon, label]) => (
              <span className="cat" key={label}>
                <i>{icon}</i>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="pass-card-wrap">
          <div className="pc-agent" id="ai-agent" role="search">
            <div className={`pc-agent-panel${agentActive ? " is-active" : ""}`}>
              <div className="pc-agent-head">
                <span className="pc-agent-title">ISLAND QUEST AI 추천 서비스</span>
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
                  placeholder="자유롭게 질문해주세요."
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
          <aside className="pass-card" aria-label="나의 바다패스">
            <div className="pc-head">
              <h3>나의 바다패스</h3>
              <Link to="/login" className="pc-login-link">
                로그인하기
              </Link>
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
