
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/notification/NotificationBell";
import { LogoIcon } from "./LogoIcon";
import { useToast } from "./ToastProvider";

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
  const { showToast } = useToast();
  const location = useLocation();
  const onLanding = location.pathname === "/";
  const onCommunity = location.pathname.startsWith("/community");
  const onIslands = location.pathname.startsWith("/islands");

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 0) window.scrollTo(0, 0);
      const scrolled = window.scrollY > 0 || !onLanding;
      headRef.current?.classList.toggle("scrolled", scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onLanding]);

  return (
    <header className="site-head" id="siteHead" ref={headRef}>
      <div className="container nav-inner">
        <a
          className="logo"
          href="/"
          aria-label="ISLAND QUEST 홈"
          onClick={(e) => {
            e.preventDefault();
            const { pathname, search, hash } = window.location;
            if (pathname === "/" && !search && !hash) {
              window.location.reload();
            } else {
              window.location.href = "/";
            }
          }}
        >
          <LogoIcon />
          <span className="logo-txt">
            <b>ISLAND QUEST</b>
            <span>인천 섬 레저 탐험대</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="주요 메뉴">
          <Link to="/islands" className={onIslands ? "nav-route-active" : undefined}>
            섬 탐험
          </Link>
          <a href={onLanding ? "#booking" : "/#booking"}>레저 스포츠</a>
          <a href={onLanding ? "#mission" : "/#mission"}>미션 &amp; 인증</a>
          <a href={onLanding ? "#leaderboard" : "/#leaderboard"}>리더보드</a>
          <Link to="/community" className={onCommunity ? "nav-route-active" : undefined}>
            커뮤니티
          </Link>
        </nav>
        <div className="head-actions">
          <a
            className="btn-portal"
            href="https://isum.incheon.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="인천섬포털 바로가기"
          >
            <img
              className="btn-portal-logo"
              src="/incheon-island-portal-logo.png"
              alt="인천섬포털"
              width={160}
              height={32}
            />
            <span className="btn-portal-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <button
            type="button"
            className="icon-btn"
            aria-label="마이페이지"
            title="마이페이지"
            onClick={() => showToast("마이페이지는 준비 중이에요 👤")}
          >
            <ProfileIcon />
          </button>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
