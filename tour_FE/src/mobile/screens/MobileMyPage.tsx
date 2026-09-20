import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useBadgeStats } from "@/hooks/useBadgeStats";
import { useVisitedIslands } from "@/store/visited-islands";
import { useSession } from "@/store/session";
import { ISLANDS } from "@/lib/island-data";
import { ISLAND_BTI } from "@/constants/island";
import { getLevelPercent, isMaxLevel } from "@/lib/user-profile";
import { MobilePassportSheet } from "./MobilePassportSheet";
import { ChevronRightIcon } from "../MobileIcons";

type MenuItem = { to: string; label: string; icon: string };

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: "탐험",
    items: [
      { to: "/missions", label: "미션", icon: "🎯" },
      { to: "/leaderboard", label: "리더보드", icon: "🏆" },
      { to: "/islands", label: "섬 탐험", icon: "🏝️" },
      { to: "/island-bti", label: "섬BTI 테스트", icon: "✨" },
    ],
  },
  {
    title: "내 활동",
    items: [
      { to: "/community/my-posts", label: "내가 쓴 글", icon: "📝" },
      { to: "/community/my-comments", label: "내가 쓴 댓글", icon: "💬" },
      { to: "/community/liked", label: "좋아요한 글", icon: "❤️" },
      { to: "/notifications", label: "알림", icon: "🔔" },
    ],
  },
  {
    title: "설정",
    items: [
      { to: "/mypage/settings/profile", label: "프로필 수정", icon: "🙂" },
      { to: "/mypage/settings", label: "계정 설정", icon: "⚙️" },
      { to: "/safety", label: "섬 안전정보", icon: "🛟" },
    ],
  },
];

/**
 * 모바일 MY
 *
 * 데스크톱 마이페이지는 프로필·리더보드·여권책을 2단으로 펼친다.
 * 폰에서는 위에 프로필 요약 카드를 두고 나머지는 앱처럼 메뉴 목록으로 내린다.
 * 여권은 데스크톱 펼침책 대신 위아래로 읽는 시트를 쓴다 (MobilePassportSheet).
 */
export function MobileMyPage() {
  const navigate = useNavigate();
  const profile = useUserProfile();
  const badges = useBadgeStats();
  const { ids: visitedIds } = useVisitedIslands();
  const { signOut } = useSession();
  const [passportOpen, setPassportOpen] = useState(false);

  const percent = getLevelPercent(profile);
  const atMax = isMaxLevel(profile);
  const btiColors = ISLAND_BTI[profile.bti];

  const handleSignOut = () => {
    signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="m-screen m-my">
      <section className="m-card m-my__profile">
        <div className="m-my__id">
          <span className="m-my__avatar" aria-hidden="true">
            {profile.nickname[0]}
          </span>
          <div className="m-my__id-copy">
            <b>{profile.nickname}</b>
            <span className="m-my__tags">
              <em className="m-passport__lv">Lv.{profile.level}</em>
              <em>{profile.levelTitle}</em>
              <em style={{ color: btiColors.text }}>{profile.bti}</em>
            </span>
          </div>
        </div>

        <div className="m-passport__bar">
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="m-passport__exp">
          {atMax
            ? `최고 레벨 · 방문 섬 ${profile.expCurrent}곳`
            : `다음 레벨까지 섬 ${profile.expMax - profile.expCurrent}곳`}
        </p>

        <div className="m-passport__metrics">
          <div>
            <b>{visitedIds.size}</b>
            <span>방문 섬 / {ISLANDS.length}</span>
          </div>
          <div>
            <b>{badges.earned}</b>
            <span>획득 배지</span>
          </div>
          <div>
            <b>{badges.unearned}</b>
            <span>남은 배지</span>
          </div>
        </div>
      </section>

      <button
        type="button"
        className="m-card m-my__passport-btn"
        onClick={() => setPassportOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="m-my__passport-copy">
          <b>내 섬 여권 보기</b>
          <span>방문한 섬과 모은 배지를 한눈에</span>
        </span>
        <ChevronRightIcon size={18} />
      </button>

      {MENU_GROUPS.map((group) => (
        <section className="m-sec" key={group.title}>
          <div className="m-sec__head">
            <h2>{group.title}</h2>
          </div>
          <ul className="m-card m-menu">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="m-menu__row">
                  <span className="m-menu__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="m-menu__label">{item.label}</span>
                  <ChevronRightIcon size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <button type="button" className="m-my__signout" onClick={handleSignOut}>
        로그아웃
      </button>

      <MobilePassportSheet
        open={passportOpen}
        onClose={() => setPassportOpen(false)}
        profile={profile}
      />
    </div>
  );
}
