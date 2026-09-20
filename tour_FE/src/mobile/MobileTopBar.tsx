import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeftIcon, MenuIcon } from "./MobileIcons";

const SITE_LOGO_SRC = "/incheon-island-leisure-nuri-logo.png";

/** 경로별 화면 이름 — 긴 것부터 맞춰 본다 */
const TITLES: [prefix: string, title: string][] = [
  ["/island-bti/result", "섬BTI 결과"],
  ["/island-bti/test", "섬BTI 테스트"],
  ["/island-bti", "섬BTI"],
  ["/islands", "섬 탐험"],
  ["/sports/facility", "시설 정보"],
  ["/sports", "레저스포츠"],
  ["/ai-recommend", "AI 추천"],
  ["/missions", "미션"],
  ["/leaderboard", "리더보드"],
  ["/safety", "섬 안전정보"],
  ["/community/write", "글쓰기"],
  ["/community/my-posts", "내가 쓴 글"],
  ["/community/my-comments", "내 댓글"],
  ["/community/liked", "좋아요한 글"],
  ["/community/me", "내 활동"],
  ["/community/users", "프로필"],
  ["/community", "커뮤니티"],
  ["/notifications", "알림"],
  ["/mypage/settings/profile", "프로필 수정"],
  ["/mypage/settings", "설정"],
  ["/mypage", "MY"],
  ["/find-account", "계정 찾기"],
  ["/admin/submissions", "검수"],
  ["/oauth/callback", "로그인 중"],
  ["/signup/nickname", "닉네임 설정"],
];

function titleFor(pathname: string): string {
  const hit = TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return hit ? hit[1] : "페이지를 찾을 수 없어요";
}

/** 메뉴에서 바로 갈 수 있는 최상위 화면 — 뒤로가기 대신 로고를 보여준다 */
const ROOT_PATHS = new Set([
  "/",
  "/islands",
  "/sports",
  "/ai-recommend",
  "/missions",
  "/leaderboard",
  "/community",
  "/mypage",
]);

export function MobileTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const isRoot = ROOT_PATHS.has(pathname);

  /**
   * 홈은 히어로 사진 위에 투명하게 얹혀 있다. 사진을 지나 내려가면
   * 흰 로고가 밝은 배경에 겹쳐 안 보이므로 흰 바로 바꾼다.
   */
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setPastHero(false);
      return;
    }
    const onScroll = () => {
      const hero = document.querySelector(".m-hero");
      const limit = hero ? hero.getBoundingClientRect().height - 80 : 240;
      setPastHero(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const overHero = isHome && !pastHero;

  return (
    <header className={`m-top${overHero ? " m-top--home" : ""}`}>
      <div className="m-top__left">
        {isRoot ? (
          <Link to="/" className="m-top__logo" aria-label="인천섬 레저누리 홈">
            <img src={SITE_LOGO_SRC} alt="인천섬 레저누리" />
          </Link>
        ) : (
          <button
            type="button"
            className="m-top__icon"
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            <ChevronLeftIcon size={24} />
          </button>
        )}
      </div>

      {!isRoot && <h1 className="m-top__title">{titleFor(pathname)}</h1>}

      <div className="m-top__right">
        <button type="button" className="m-top__icon" onClick={onOpenMenu} aria-label="메뉴 열기">
          <MenuIcon size={24} />
        </button>
      </div>
    </header>
  );
}
