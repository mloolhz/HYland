import { useCallback, useEffect, useRef, useState } from "react";
import { demoProps } from "./ToastProvider";

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
  loginInputRef: React.RefObject<HTMLInputElement | null>;
};

export function HeroSection({ loginInputRef }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goSlide = useCallback((index: number) => {
    setActiveSlide((index + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

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
        <div className="hero-copy reveal">
          <span className="eyebrow">바다, 산, 섬을 넘나드는 새로운 탐험!</span>
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
            168개 인천 섬의 다양한 레저스포츠를 한눈에 만나보세요.
          </p>
          <div className="hero-cta">
            <a className="btn btn-navy" href="#map">
              탐험 시작하기 →
            </a>
            <a className="btn btn-white" href="#booking">
              레저 예약 보기
            </a>
          </div>
        </div>

        <aside className="pass-card reveal" aria-label="바다패스 로그인">
          <div className="pc-head">
            <h3>나의 바다패스</h3>
            <span className="pill">LOGIN</span>
          </div>
          <div className="pc-body">
            <img className="passport" src="/passport.png" alt="바다패스 여권" width={118} height={158} />
            <div className="pc-form">
              <div className="field">
                <span>👤</span>
                <input
                  ref={loginInputRef}
                  type="text"
                  id="login-id"
                  placeholder="아이디 또는 이메일"
                  autoComplete="username"
                />
              </div>
              <div className="field">
                <span>🔒</span>
                <input type="password" placeholder="비밀번호" autoComplete="current-password" />
              </div>
              <div className="keep-row">
                <label>
                  <input type="checkbox" defaultChecked /> 로그인 상태 유지
                </label>
              </div>
              <button className="btn-login" {...demoProps("🛂 데모 페이지입니다. 로그인 기능은 추후 연동 예정이에요!")}>
                로그인
              </button>
              <div className="find-links">
                <a href="#" {...demoProps("아이디 찾기는 준비 중이에요 🙂")}>
                  아이디 찾기
                </a>
                <em>·</em>
                <a href="#" {...demoProps("비밀번호 찾기는 준비 중이에요 🙂")}>
                  비밀번호 찾기
                </a>
                <em>·</em>
                <a href="#" {...demoProps("회원가입은 준비 중이에요 🙂")}>
                  <b style={{ color: "var(--blue)" }}>회원가입</b>
                </a>
              </div>
            </div>
          </div>
          <div className="divider">간편 로그인</div>
          <div className="sns-row">
            <button className="btn-kakao" {...demoProps("카카오 로그인은 추후 연동 예정이에요 💬")}>
              💬 카카오
            </button>
            <button className="btn-naver" {...demoProps("네이버 로그인은 추후 연동 예정이에요 🟢")}>
              <b>N</b> 네이버
            </button>
          </div>
          <button className="btn-ipass" {...demoProps("인천 i-바다패스 연동은 준비 중이에요 🌊")}>
            <span className="ip-badge">인천시민</span>인천 i-바다패스 연동하기<span className="ip-arrow">→</span>
          </button>
          <div className="quick-grid">
            <span className="q" {...demoProps("추천 섬 페이지는 준비 중이에요 🏝️")}>
              <i>📍</i>추천 섬
            </span>
            <span className="q" {...demoProps("나에게 맞는 섬BTI를 찾아보세요! 🏝️")}>
              <i>🏝️</i>섬BTI
            </span>
            <span className="q" {...demoProps("레저 예약은 아래 섹션에서 미리 만나보세요 📅")}>
              <i>📅</i>레저 예약
            </span>
            <span className="q" {...demoProps("안전 정보 페이지는 준비 중이에요 🛟")}>
              <i>🛟</i>안전 정보
            </span>
          </div>
          <p className="pc-foot">로그인하면 방문 기록 · 미션 · 배지가 여권에 자동 저장돼요</p>
        </aside>

        <div className="hero-foot">
          <div className="cats" aria-label="레저 카테고리">
            {CATEGORIES.map(([icon, label]) => (
              <span className="cat" key={label}>
                <i>{icon}</i>
                {label}
              </span>
            ))}
          </div>
          <div className="hero-dots" aria-label="배경 사진 전환">
            {Array.from({ length: SLIDE_COUNT }, (_, i) => (
              <button
                key={i}
                className={`hdot${activeSlide === i ? " on" : ""}`}
                aria-label={`사진 ${i + 1}`}
                onClick={() => {
                  goSlide(i);
                  startHero();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
