import { CONTAINER } from "@/constants/layout";

export function CommunityHeader() {
  return (
    <div className="cm-header-band">
      <header className="cm-header">
        <div className="cm-header-bg" aria-hidden="true" />
        <div className={`${CONTAINER} cm-header-inner`}>
          <div className="cm-header-copy">
            <span className="cm-header-eyebrow">COMMUNITY</span>
            <h1 className="cm-header-title">섬 탐험가들의 기록</h1>
            <p className="cm-header-desc">인천의 다양한 섬에서 남긴 후기와 인증샷을 만나보세요</p>
          </div>
        </div>
      </header>
    </div>
  );
}
