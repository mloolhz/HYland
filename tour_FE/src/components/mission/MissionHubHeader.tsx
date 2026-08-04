import { CONTAINER } from "@/constants/layout";

export function MissionHubHeader() {
  return (
    <div className="ms-header-band">
      <header className="ms-header">
        <div className="ms-header-bg" aria-hidden="true" />
        <div className={`${CONTAINER} ms-header-inner`}>
          <div className="ms-header-copy">
            <span className="ms-header-eyebrow">MISSION</span>
            <h1 className="ms-header-title">미션</h1>
            <p className="ms-header-desc">
              게이지를 가득 채워 귀여운 배지를 모아보세요! 모은 배지는 바다패스 여권에 기록됩니다.
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}
