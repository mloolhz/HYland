import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/store/session";
import { Link, useLocation } from "react-router-dom";
import { resolveCommunityHref } from "@/lib/community-list-state";
import { NotificationBell } from "@/components/notification/NotificationBell";
import { ISLAND_REGION_SUB_ITEMS } from "@/lib/island-data";

const SITE_LOGO_SRC = "/incheon-island-leisure-nuri-logo.png";

type NavSubItem = { label: string; href: string };

type NavItem = {
  id: string;
  label: string;
  href: string;
  isRoute?: boolean;
  active?: boolean;
  subItems: NavSubItem[];
};

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

function buildNavItems(
  onIslands: boolean,
  onSports: boolean,
  onAiRecommend: boolean,
  onMissionsHub: boolean,
  onCommunity: boolean,
  communityHref: string,
): NavItem[] {
  return [
    {
      id: "islands",
      label: "섬 탐험",
      href: "/islands",
      isRoute: true,
      active: onIslands,
      subItems: ISLAND_REGION_SUB_ITEMS,
    },
    {
      id: "sports",
      label: "레저 스포츠",
      href: "/sports",
      isRoute: true,
      active: onSports,
      subItems: [
        { label: "해상 레저", href: "/sports?category=water" },
        { label: "육상 레저", href: "/sports?category=land" },
        { label: "체험", href: "/sports?category=exp" },
        { label: "힐링", href: "/sports?category=heal" },
      ],
    },
    {
      id: "ai-recommend",
      label: "AI 추천",
      href: "/ai-recommend",
      isRoute: true,
      active: onAiRecommend,
      subItems: [],
    },
    {
      id: "mission",
      label: "미션",
      href: "/missions",
      isRoute: true,
      active: onMissionsHub,
      subItems: [
        { label: "섬 탐험 미션", href: "/missions" },
        { label: "리더보드", href: "/leaderboard" },
      ],
    },
    {
      id: "community",
      label: "커뮤니티",
      href: communityHref,
      isRoute: true,
      active: onCommunity,
      subItems: [
        { label: "후기", href: "/community?category=review" },
        { label: "인증샷", href: "/community?category=photo" },
        { label: "Q&A", href: "/community?category=question" },
      ],
    },
  ];
}

type NavHoverHandlers = {
  openMegaMenu: () => void;
  handleEnter: (id: string) => void;
  clearCloseTimer: () => void;
  scheduleClose: () => void;
};

function useNavHoverTimer(
  onHoverNav: (id: string | null) => void,
  onMegaMenuChange: (open: boolean) => void,
): NavHoverHandlers {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      onHoverNav(null);
      onMegaMenuChange(false);
    }, 200);
  }, [clearCloseTimer, onHoverNav, onMegaMenuChange]);

  const openMegaMenu = useCallback(() => {
    clearCloseTimer();
    onMegaMenuChange(true);
  }, [clearCloseTimer, onMegaMenuChange]);

  const handleEnter = useCallback(
    (id: string) => {
      clearCloseTimer();
      onMegaMenuChange(true);
      onHoverNav(id);
    },
    [clearCloseTimer, onHoverNav, onMegaMenuChange],
  );

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  return { openMegaMenu, handleEnter, clearCloseTimer, scheduleClose };
}

type DesktopNavProps = {
  items: NavItem[];
  isOpen: boolean;
  hoveredNavId: string | null;
  onOpen: () => void;
  onEnter: (id: string) => void;
  onLeave: () => void;
  onNavigate: () => void;
};

function DesktopNav({
  items,
  isOpen,
  hoveredNavId,
  onOpen,
  onEnter,
  onLeave,
  onNavigate,
}: DesktopNavProps) {
  return (
    <div
      className={`nav-links-wrap${isOpen ? " is-open" : ""}`}
      onMouseLeave={onLeave}
    >
      <nav className="nav-links" aria-label="주요 메뉴">
        {items.map((item) => {
          const hasSubItems = item.subItems.length > 0;
          const linkClass = [
            "nav-link",
            item.active ? "nav-route-active" : undefined,
            hoveredNavId === item.id ? "is-hovered" : undefined,
          ]
            .filter(Boolean)
            .join(" ");

          const handleItemEnter = () => {
            if (hasSubItems) {
              onOpen();
              onEnter(item.id);
              return;
            }
            if (isOpen) {
              onEnter(item.id);
            }
          };

          const triggerProps = {
            className: linkClass,
            onMouseEnter: handleItemEnter,
            onFocus: handleItemEnter,
          };

          return (
            <div key={item.id} className="nav-item" onMouseEnter={handleItemEnter}>
              {item.isRoute ? (
                <Link to={item.href} {...triggerProps}>
                  <span className="nav-link__label">
                    <span className="nav-link__label-visible">{item.label}</span>
                    <span className="nav-link__label-bold" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </Link>
              ) : (
                <a href={item.href} {...triggerProps}>
                  <span className="nav-link__label">
                    <span className="nav-link__label-visible">{item.label}</span>
                    <span className="nav-link__label-bold" aria-hidden="true">
                      {item.label}
                    </span>
                  </span>
                </a>
              )}
              <div className="nav-dropdown-col" aria-hidden={!isOpen || !hasSubItems}>
                {item.subItems.map((sub) => (
                  <a
                    key={sub.label}
                    href={sub.href}
                    className="nav-dropdown-link"
                    onClick={onNavigate}
                    tabIndex={isOpen && hasSubItems ? 0 : -1}
                  >
                    {sub.label}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

type DrawerNavProps = {
  items: NavItem[];
  onNavigate?: () => void;
};

function DrawerNav({ items, onNavigate }: DrawerNavProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <nav className="nav-drawer-nav" aria-label="주요 메뉴">
      {items.map((item) => {
        const hasSubItems = item.subItems.length > 0;
        const expanded = expandedId === item.id;
        const linkClass = [
          "nav-drawer-link",
          item.active ? "nav-route-active" : undefined,
          expanded ? "is-expanded" : undefined,
        ]
          .filter(Boolean)
          .join(" ");

        const mainLink = item.isRoute ? (
          <Link to={item.href} className={linkClass} onClick={onNavigate}>
            {item.label}
          </Link>
        ) : (
          <a href={item.href} className={linkClass} onClick={onNavigate}>
            {item.label}
          </a>
        );

        return (
          <div key={item.id} className="nav-drawer-group">
            <div className={`nav-drawer-row${hasSubItems ? "" : " nav-drawer-row--solo"}`}>
              {mainLink}
              {hasSubItems && (
                <button
                  type="button"
                  className="nav-drawer-toggle"
                  aria-expanded={expanded}
                  aria-label={`${item.label} 하위 메뉴 ${expanded ? "접기" : "펼치기"}`}
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            {hasSubItems && (
              <div className={`nav-drawer-sub${expanded ? " is-open" : ""}`}>
                {item.subItems.map((sub) => (
                  <a
                    key={sub.label}
                    href={sub.href}
                    className="nav-drawer-sublink"
                    onClick={onNavigate}
                  >
                    {sub.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function SiteHeader() {
  const { isLoggedIn, user } = useSession();
  const scrollSnapshotRef = useRef(0);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [navMegaOpen, setNavMegaOpen] = useState(false);
  const onLanding = location.pathname === "/";
  const onCommunity = location.pathname.startsWith("/community");
  const onIslands = location.pathname.startsWith("/islands");
  const onSports = location.pathname.startsWith("/sports");
  const onAiRecommend = location.pathname.startsWith("/ai-recommend");
  const onMissionsHub =
    location.pathname.startsWith("/missions") || location.pathname.startsWith("/leaderboard");
  const navItems = useMemo(
    () => buildNavItems(onIslands, onSports, onAiRecommend, onMissionsHub, onCommunity),
    [onIslands, onSports, onAiRecommend, onMissionsHub, onCommunity],
  );
  const headerSolid = headerScrolled || navMegaOpen;
  const closeNavMega = useCallback(() => {
    setHoveredNavId(null);
    setNavMegaOpen(false);
  }, []);
  const { openMegaMenu, handleEnter, scheduleClose } = useNavHoverTimer(
    setHoveredNavId,
    setNavMegaOpen,
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const syncHeaderScrollState = useCallback(() => {
    const scrollY = Math.max(window.scrollY, scrollSnapshotRef.current);
    setHeaderScrolled(scrollY > 0 || !onLanding);
  }, [onLanding]);

  const restoreScrollPosition = useCallback((scrollY: number) => {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollY);
    html.style.scrollBehavior = previousScrollBehavior;
    scrollSnapshotRef.current = scrollY;
  }, []);

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
    setHoveredNavId(null);
    setNavMegaOpen(false);
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
      restoreScrollPosition(scrollY);
      syncHeaderScrollState();
    };
  }, [menuOpen, closeMenu, syncHeaderScrollState, restoreScrollPosition]);

  return (
    <>
      <header
        className={[
          "site-head",
          headerSolid ? "scrolled" : "",
          navMegaOpen ? "site-head--nav-open" : "",
          menuOpen ? "site-head--menu-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        id="siteHead"
      >
        <div className="container nav-inner">
          <a
            className="logo"
            href="/"
            aria-label="인천섬 레저누리 홈"
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
            <img
              className="logo-img"
              src={SITE_LOGO_SRC}
              alt="인천섬 레저누리"
              width={220}
              height={36}
            />
          </a>
          <DesktopNav
            items={navItems}
            isOpen={navMegaOpen}
            hoveredNavId={hoveredNavId}
            onOpen={openMegaMenu}
            onEnter={handleEnter}
            onLeave={scheduleClose}
            onNavigate={closeNavMega}
          />
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
            {user?.role === "ADMIN" && (
              <Link
                to="/admin/submissions"
                className="btn-admin"
                title="미션 인증 검수"
              >
                검수
              </Link>
            )}
            {isLoggedIn ? (
              <Link
                to="/mypage"
                className="icon-btn"
                aria-label={`마이페이지 (${user?.nickname ?? ""})`}
                title={user?.nickname ? `${user.nickname}님 · 마이페이지` : "마이페이지"}
              >
                <ProfileIcon />
              </Link>
            ) : (
              // 비로그인이면 마이페이지로 보내봐야 볼 게 없다
              <Link to="/login" className="icon-btn" aria-label="로그인" title="로그인">
                <ProfileIcon />
              </Link>
            )}
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

        <DrawerNav items={navItems} onNavigate={closeMenu} />

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
