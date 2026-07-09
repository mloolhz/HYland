
import { useEffect, useRef } from "react";
import { LogoIcon } from "./LogoIcon";
import { demoProps } from "./ToastProvider";

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const headRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 0) window.scrollTo(0, 0);
      headRef.current?.classList.toggle("scrolled", window.scrollY > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-head" id="siteHead" ref={headRef}>
      <div className="container nav-inner">
        <a className="logo" href="#home" aria-label="ISLAND QUEST 홈">
          <LogoIcon />
          <span className="logo-txt">
            <b>ISLAND QUEST</b>
            <span>인천 섬 레저 탐험대</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="주요 메뉴">
          <a href="#map">섬 탐험</a>
          <a href="#booking">레저 스포츠</a>
          <a href="#mission">미션 &amp; 인증</a>
          <a href="#leaderboard">리더보드</a>
          <a href="#community">커뮤니티</a>
        </nav>
        <div className="head-actions">
          <a
            className="btn-portal"
            href="https://isum.incheon.go.kr"
            target="_blank"
            rel="noopener noreferrer"
          >
            인천섬포털 바로가기 <span>↗</span>
          </a>
          <a
            className="icon-btn"
            href="#mypage"
            {...demoProps("마이페이지는 준비 중이에요 👤")}
            aria-label="마이페이지"
            title="마이페이지"
          >
            <ProfileIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
