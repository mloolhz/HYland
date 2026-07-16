import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/notification/NotificationBell";
import { LogoIcon } from "./LogoIcon";

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

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type NavLinkItemProps = {
  onNavigate?: () => void;
  className?: string;
  onLanding: boolean;
  onIslands: boolean;
  onCommunity: boolean;
};

function NavLinkItems({ onNavigate, className, onLanding, onIslands, onCommunity }: NavLinkItemProps) {
  const linkClass = (active: boolean) =>
    [className, active ? "nav-route-active" : undefined].filter(Boolean).join(" ");

  return (
    <>
      <Link
        to="/islands"
        className={linkClass(onIslands)}
        onClick={onNavigate}
      >
        섬 탐험
      </Link>
      <a
        href={onLanding ? "#booking" : "/#booking"}
        className={className}
        onClick={onNavigate}
      >
        레저 스포츠
      </a>
      <a
        href={onLanding ? "#mission" : "/#mission"}
        className={className}
        onClick={onNavigate}
      >
        미션 &amp; 인증
      </a>
      <a
        href={onLanding ? "#leaderboard" : "/#leaderboard"}
        className={className}
        onClick={onNavigate}
      >
        리더보드
      </a>
      <Link
        to="/community"
        className={linkClass(onCommunity)}
        onClick={onNavigate}
      >
        커뮤니티
      </Link>
    </>
  );
}

export function SiteHeader() {
  const scrollSnapshotRef = useRef(0);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const onLanding = location.pathname === "/";
  const onCommunity = location.pathname.startsWith("/community");
  const onIslands = location.pathname.startsWith("/islands");

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const syncHeaderScrollState = useCallback(() => {
    const scrollY = Math.max(window.scrollY, scrollSnapshotRef.current);
    setHeaderScrolled(scrollY > 0 || !onLanding);
  }, [onLanding]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 0) window.scrollTo(0, 0);
      scrollSnapshotRef.current = window.scrollY;
      syncHeaderScrollState();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [syncHeaderScrollState]);

  useEffect(() => {
    syncHeaderScrollState();
  }, [location.pathname, syncHeaderScrollState]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.hash, closeMenu]);

  useEffect(() => {
    if (!menuOpen) {
      syncHeaderScrollState();
      return;
    }

    const scrollY = window.scrollY;
    scrollSnapshotRef.current = scrollY;
    const scrollbarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );

    const { style: bodyStyle } = document.body;
    const siteHead = document.getElementById("siteHead");
    const previousBodyStyle = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      paddingRight: bodyStyle.paddingRight,
    };
    const previousHeadPadding = siteHead?.style.paddingRight ?? "";
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("site-menu-open");

    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    if (scrollbarWidth > 0) {
      bodyStyle.paddingRight = `${scrollbarWidth}px`;
      if (siteHead) siteHead.style.paddingRight = `${scrollbarWidth}px`;
    }

    const canScrollInside = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest(".nav-drawer") || target.closest(".noti-dropdown"));
    };

    const preventBackgroundScroll = (event: Event) => {
      if (canScrollInside(event.target)) return;
      event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && document.querySelector(".noti-bell-btn.is-open")) {
        return;
      }
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      bodyStyle.overflow = previousBodyStyle.overflow;
      bodyStyle.position = previousBodyStyle.position;
      bodyStyle.top = previousBodyStyle.top;
      bodyStyle.left = previousBodyStyle.left;
      bodyStyle.right = previousBodyStyle.right;
      bodyStyle.width = previousBodyStyle.width;
      bodyStyle.paddingRight = previousBodyStyle.paddingRight;
      if (siteHead) siteHead.style.paddingRight = previousHeadPadding;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.classList.remove("site-menu-open");
      window.removeEventListener("wheel", preventBackgroundScroll);
      window.removeEventListener("touchmove", preventBackgroundScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.scrollTo(0, scrollY);
      scrollSnapshotRef.current = scrollY;
      syncHeaderScrollState();
    };
  }, [menuOpen, closeMenu, syncHeaderScrollState]);

  return (
    <>
      <header
        className={`site-head${headerScrolled ? " scrolled" : ""}${menuOpen ? " site-head--menu-open" : ""}`}
        id="siteHead"
      >
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
            <NavLinkItems onLanding={onLanding} onIslands={onIslands} onCommunity={onCommunity} />
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
            <Link to="/mypage" className="icon-btn" aria-label="마이페이지" title="마이페이지">
              <ProfileIcon />
            </Link>
            <NotificationBell />
          </div>
        </div>
        <button
          type="button"
          className="nav-menu-btn"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="siteNavDrawer"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </header>

      <div
        className={`nav-drawer-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        id="siteNavDrawer"
        className={`nav-drawer${menuOpen ? " is-open" : ""}`}
        aria-label="모바일 메뉴"
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-head">
          <p className="nav-drawer-title">메뉴</p>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="메뉴 닫기"
            onClick={closeMenu}
          >
            <MenuIcon open />
          </button>
        </div>

        <nav className="nav-drawer-nav" aria-label="주요 메뉴">
          <NavLinkItems
            className="nav-drawer-link"
            onNavigate={closeMenu}
            onLanding={onLanding}
            onIslands={onIslands}
            onCommunity={onCommunity}
          />
        </nav>

        <div className="nav-drawer-actions">
          <a
            className="btn-portal nav-drawer-portal"
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
          <div className="nav-drawer-icons">
            <Link
              to="/mypage"
              className="icon-btn"
              aria-label="마이페이지"
              title="마이페이지"
              onClick={closeMenu}
            >
              <ProfileIcon />
            </Link>
            <NotificationBell placement="drawer" onDrawerAction={closeMenu} />
          </div>
        </div>
      </aside>
    </>
  );
}
