import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { GearIcon } from "@/components/mypage/GearIcon";
import { CONTAINER } from "@/constants/layout";

type MyPageHeaderProps = {
  showSettingsButton?: boolean;
};

export function MyPageHeader({ showSettingsButton = false }: MyPageHeaderProps) {
  const profile = useUserProfile();

  return (
    <div className="mp-header-band">
      <header className="mp-header">
        <div className="mp-header-bg" aria-hidden="true" />
        <div className={`${CONTAINER} mp-header-inner`}>
          <span className="mp-header-eyebrow">MY PAGE</span>
          <div className="mp-header-title-row">
            <h1 className="mp-header-title">마이페이지</h1>
            {showSettingsButton && (
              <Link
                to="/mypage/settings"
                className="mp-settings-btn"
                aria-label="설정"
                title="설정"
              >
                <GearIcon />
              </Link>
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
