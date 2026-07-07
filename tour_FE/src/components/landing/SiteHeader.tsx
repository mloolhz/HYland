
import { useEffect, useRef } from "react";
import { LogoIcon } from "./LogoIcon";
import { demoProps } from "./ToastProvider";

type SiteHeaderProps = {
  onScrollToLogin: () => void;
};

export function SiteHeader({ onScrollToLogin }: SiteHeaderProps) {
  const headRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      headRef.current?.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-head" id="siteHead" ref={headRef}>
      <div className="util-bar">
        <div className="container util-inner">
          <span className="util-note">인천 섬 레저스포츠 통합 플랫폼 · ISLAND QUEST</span>
          <nav className="util-links" aria-label="유틸리티 메뉴">
            <a href="#home" onClick={onScrollToLogin}>
              로그인
            </a>
            <a href="#home" {...demoProps("회원가입은 준비 중이에요")}>
              회원가입
            </a>
            <a href="https://www.incheon.go.kr" target="_blank" rel="noopener noreferrer">
              인천광역시
            </a>
            <a href="https://isum.incheon.go.kr" target="_blank" rel="noopener noreferrer">
              인천섬포털
            </a>
          </nav>
        </div>
      </div>
      <div className="container nav-inner">
        <a className="logo" href="#home" aria-label="ISLAND QUEST 홈">
          <LogoIcon />
          <span className="logo-txt">
            <b>ISLAND QUEST</b>
            <span>인천 섬 레저 탐험대</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="주요 메뉴">
          <a href="#home">홈</a>
          <a href="#map">섬 탐험</a>
          <a href="#booking">레저 스포츠</a>
          <a href="#mission">미션 &amp; 인증</a>
          <a href="#leaderboard">리더보드</a>
          <a href="#community">커뮤니티</a>
          <a href="#guide">이용 가이드</a>
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
          <button className="icon-btn" {...demoProps("알림은 로그인 후 확인할 수 있어요 🔔")} aria-label="알림">
            🔔
          </button>
        </div>
      </div>
    </header>
  );
}
