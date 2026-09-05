import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GearIcon } from "@/components/mypage/GearIcon";
import { CONTAINER } from "@/constants/layout";
import { useSession } from "@/store/session";

type MyPageHeaderProps = {
  showSettingsButton?: boolean;
};

export function MyPageHeader({ showSettingsButton = false }: MyPageHeaderProps) {
  const profile = useUserProfile();
  const navigate = useNavigate();
  // 로그아웃이 설정 안에만 있어 찾기 어려웠다. 마이페이지에서 바로 누를 수 있게 둔다.
  const { signOut, isLoggedIn } = useSession();

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mp-header-band">
      <header className="mp-header">
        <div className="mp-header-bg" aria-hidden="true" />
        <div className={`${CONTAINER} mp-header-inner`}>
          <span className="mp-header-eyebrow">MY PAGE</span>
          <div className="mp-header-title-row">
            <h1 className="mp-header-title">마이페이지</h1>
            {showSettingsButton && (
              <div className="mp-header-actions">
                {isLoggedIn && (
                  <button type="button" className="mp-logout-btn" onClick={handleLogout}>
                    로그아웃
                  </button>
                )}
                <Link
                  to="/mypage/settings"
                  className="mp-settings-btn"
                  aria-label="설정"
                  title="설정"
                >
                  <GearIcon />
                </Link>
              </div>
            )}
          </div>
          <p className="mp-header-desc">
            {profile.nickname}님의 미션 배지와 리더보드 순위를 한곳에서 확인하세요
          </p>
        </div>
      </header>
    </div>
  );
}
