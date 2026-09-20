import { Link, useLocation } from "react-router-dom";
import { useSession } from "@/store/session";
import { useAuthSheet } from "./auth/AuthSheetProvider";
import {
  CommunityIcon,
  HomeIcon,
  IslandIcon,
  LeisureIcon,
  UserIcon,
} from "./MobileIcons";

type Tab = {
  to: string;
  label: string;
  icon: (props: { size?: number }) => React.ReactElement;
  /** 이 경로들 아래에 있으면 활성 탭으로 본다 */
  match: string[];
  /** 로그인이 필요한 탭 — 비로그인이면 로그인 시트를 연다 */
  requiresAuth?: boolean;
};

const TABS: Tab[] = [
  { to: "/", label: "홈", icon: HomeIcon, match: ["/"] },
  { to: "/islands", label: "섬 탐험", icon: IslandIcon, match: ["/islands", "/island-bti"] },
  { to: "/sports", label: "레저", icon: LeisureIcon, match: ["/sports", "/ai-recommend"] },
  { to: "/community", label: "커뮤니티", icon: CommunityIcon, match: ["/community"] },
  { to: "/mypage", label: "MY", icon: UserIcon, match: ["/mypage"], requiresAuth: true },
];

function isActive(tab: Tab, pathname: string): boolean {
  return tab.match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));
}

/** 화면 아래 고정 탭바 — 모바일 전용 화면의 기본 이동 수단 */
export function MobileTabBar() {
  const { pathname } = useLocation();
  const { isLoggedIn } = useSession();
  const { openAuth } = useAuthSheet();

  const handleGuardedTab = (e: React.MouseEvent, tab: Tab) => {
    if (!tab.requiresAuth || isLoggedIn) return;
    e.preventDefault();
    openAuth("login");
  };

  return (
    <nav className="m-tabbar" aria-label="주요 화면">
      {TABS.map((tab) => {
        const active = isActive(tab, pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`m-tabbar__item${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={(e) => handleGuardedTab(e, tab)}
          >
            <span className="m-tabbar__icon">
              <Icon size={24} />
            </span>
            <span className="m-tabbar__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
