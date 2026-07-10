import { useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogoIcon } from "@/components/landing/LogoIcon";
import { demoProps } from "@/components/landing/ToastProvider";
import { CONTAINER } from "@/constants/layout";

type NavbarProps = {
  onScrollToLogin: () => void;
};

const ANCHOR_ITEMS = [
  { label: "섬 탐험", hash: "map" },
  { label: "레저 스포츠", hash: "booking" },
  { label: "미션 & 인증", hash: "mission" },
  { label: "리더보드", hash: "leaderboard" },
] as const;

const ROUTE_ITEMS = [{ label: "커뮤니티", path: "/community" }] as const;

export function Navbar({ onScrollToLogin }: NavbarProps) {
  const headRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      headRef.current?.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = useCallback(
    (hash: string) => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
      navigate(`/#${hash}`);
    },
    [navigate],
  );

  const handleAnchorClick = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLanding) {
      scrollToSection(hash);
      return;
    }
    navigate(`/#${hash}`);
  };

  const handleGuideClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLanding) {
      document.getElementById("guide")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    navigate("/#guide");
  };

  return (
    <header className="site-head" id="siteHead" ref={headRef}>
      <div className="util-bar">
        <div className={CONTAINER + " util-inner"}>
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
      <div className={CONTAINER + " nav-inner"}>
        <Link className="logo" to="/" aria-label="ISLAND QUEST 홈">
          <LogoIcon />
          <span className="logo-txt">
            <b>ISLAND QUEST</b>
            <span>인천 섬 레저 탐험대</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="주요 메뉴">
          <Link to="/" className={onLanding ? "nav-route-active" : undefined}>
            홈
          </Link>
          {ANCHOR_ITEMS.map((item) => (
            <a key={item.hash} href={`#${item.hash}`} onClick={handleAnchorClick(item.hash)}>
              {item.label}
            </a>
          ))}
          {ROUTE_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? "nav-route-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <a href="#guide" onClick={handleGuideClick}>
            이용 가이드
          </a>
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
