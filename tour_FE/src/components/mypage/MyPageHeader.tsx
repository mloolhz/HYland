import { CONTAINER } from "@/constants/layout";
import { getCurrentUserProfile } from "@/lib/user-profile";

export function MyPageHeader() {
  const profile = getCurrentUserProfile();

  return (
    <div className="mp-header-band">
      <header className="mp-header">
        <div className="mp-header-bg" aria-hidden="true" />
        <div className={`${CONTAINER} mp-header-inner`}>
          <div className="mp-header-copy">
            <span className="mp-header-eyebrow">MY PAGE</span>
            <h1 className="mp-header-title">마이페이지</h1>
            <p className="mp-header-desc">
              {profile.nickname}님의 섬 탐험 기록, 미션 배지, 리더보드 순위를 한곳에서 확인하세요
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}
