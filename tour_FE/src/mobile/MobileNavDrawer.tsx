import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ISLAND_REGION_SUB_ITEMS } from "@/lib/island-data";
import { useSession } from "@/store/session";
import { useNotifications } from "@/store/notifications";
import { useAuthSheet } from "./auth/AuthSheetProvider";
import { ChevronRightIcon, CloseIcon } from "./MobileIcons";

const PORTAL_URL = "https://isum.incheon.go.kr";

type SubItem = { label: string; href: string };
type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  /** 펼쳐서 바로 갈 수 있는 하위 항목 */
  subItems: SubItem[];
  /** 활성 판정용 경로 접두사 */
  match: string[];
};

/** 데스크톱 상단바와 같은 메뉴 구성 — 모바일 탭바에서 빠져 있던 AI 추천도 포함한다 */
const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "홈", href: "/", icon: "🏠", subItems: [], match: ["/"] },
  {
    id: "islands",
    label: "섬 탐험",
    href: "/islands",
    icon: "🏝️",
    subItems: ISLAND_REGION_SUB_ITEMS,
    match: ["/islands"],
  },
  {
    id: "sports",
    label: "레저 스포츠",
    href: "/sports",
    icon: "⛵",
    subItems: [
      { label: "해상 레저", href: "/sports?category=water" },
      { label: "육상 레저", href: "/sports?category=land" },
      { label: "체험", href: "/sports?category=exp" },
      { label: "힐링", href: "/sports?category=heal" },
    ],
    match: ["/sports"],
  },
  {
    id: "ai",
    label: "AI 추천",
    href: "/ai-recommend",
    icon: "✨",
    subItems: [],
    match: ["/ai-recommend"],
  },
  {
    id: "mission",
    label: "미션",
    href: "/missions",
    icon: "🎯",
    subItems: [
      { label: "섬 탐험 미션", href: "/missions" },
      { label: "리더보드", href: "/leaderboard" },
    ],
    match: ["/missions", "/leaderboard"],
  },
  {
    id: "community",
    label: "커뮤니티",
    href: "/community",
    icon: "💬",
    subItems: [
      { label: "후기", href: "/community?category=review" },
      { label: "인증샷", href: "/community?category=photo" },
      { label: "Q&A", href: "/community?category=question" },
    ],
    match: ["/community"],
  },
  { id: "bti", label: "섬BTI", href: "/island-bti", icon: "🧭", subItems: [], match: ["/island-bti"] },
  { id: "safety", label: "섬 안전정보", href: "/safety", icon: "🛟", subItems: [], match: ["/safety"] },
];

function isActive(item: NavItem, pathname: string): boolean {
  return item.match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
}

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * 모바일 메뉴 서랍
 *
 * 하단 탭바를 쓰다가 오른쪽 위 버튼으로 여는 서랍으로 바꿨다. 탭바는 다섯 칸
 * 뿐이라 AI 추천·섬BTI·안전정보가 들어갈 자리가 없었는데, 서랍은 데스크톱
 * 상단바와 같은 메뉴를 하위 항목까지 그대로 담을 수 있다.
 */
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const { pathname } = useLocation();
  const { isLoggedIn } = useSession();
  const { unreadCount } = useNotifications();
  const { openAuth } = useAuthSheet();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  // 열려 있는 동안 뒤 화면은 스크롤을 막는다
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // 화면을 옮기면 서랍은 닫는다
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mounted) return null;

  return createPortal(
    <div className={`m-nav-root${open ? " is-open" : ""}`}>
      <div className="m-nav-backdrop" onClick={onClose} role="presentation" />

      <aside className="m-nav" role="dialog" aria-modal="true" aria-label="메뉴">
        <div className="m-nav__head">
          <p className="m-nav__title">메뉴</p>
          <button type="button" className="m-nav__close" onClick={onClose} aria-label="메뉴 닫기">
            <CloseIcon size={22} />
          </button>
        </div>

        <div className="m-nav__body">
          <nav aria-label="주요 메뉴">
            <ul className="m-nav__list">
              {NAV_ITEMS.map((item) => {
                const hasSub = item.subItems.length > 0;
                const isOpen = expanded === item.id;
                return (
                  <li key={item.id} className="m-nav__group">
                    <div className="m-nav__row">
                      <Link
                        to={item.href}
                        className={`m-nav__link${isActive(item, pathname) ? " is-active" : ""}`}
                        onClick={onClose}
                      >
                        <span className="m-nav__icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                      {hasSub && (
                        <button
                          type="button"
                          className={`m-nav__toggle${isOpen ? " is-open" : ""}`}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                          aria-expanded={isOpen}
                          aria-label={`${item.label} 하위 메뉴`}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="m6 9.5 6 6 6-6"
                              stroke="currentColor"
                              strokeWidth="1.9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {hasSub && (
                      <ul className={`m-nav__sub${isOpen ? " is-open" : ""}`}>
                        {item.subItems.map((sub) => (
                          <li key={sub.href}>
                            <Link to={sub.href} className="m-nav__sublink" onClick={onClose}>
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="m-nav__divider" />

          <ul className="m-nav__list m-nav__list--minor">
            <li className="m-nav__group">
              <div className="m-nav__row">
                <Link to="/notifications" className="m-nav__link" onClick={onClose}>
                  <span className="m-nav__icon" aria-hidden="true">
                    🔔
                  </span>
                  알림
                  {unreadCount > 0 && (
                    <em className="m-nav__badge">{unreadCount > 99 ? "99+" : unreadCount}</em>
                  )}
                </Link>
              </div>
            </li>
            {isLoggedIn && (
              <li className="m-nav__group">
                <div className="m-nav__row">
                  <Link to="/mypage" className="m-nav__link" onClick={onClose}>
                    <span className="m-nav__icon" aria-hidden="true">
                      🙂
                    </span>
                    MY
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </div>

        <div className="m-nav__foot">
          {!isLoggedIn && (
            <button
              type="button"
              className="m-btn m-btn--primary"
              onClick={() => {
                onClose();
                openAuth("login");
              }}
            >
              로그인 / 회원가입
            </button>
          )}
          <a
            className="m-nav__portal"
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <img src="/incheon-island-portal-logo.png" alt="인천섬포털" />
            <ChevronRightIcon size={16} />
          </a>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
