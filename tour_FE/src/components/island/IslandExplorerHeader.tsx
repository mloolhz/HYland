import { IslandVisitProgressCard } from "./IslandVisitProgressCard";

export function IslandExplorerHeader() {
  return (
    <div className="isl-header-band">
      <header className="isl-header">
        <div className="isl-header-bg" aria-hidden="true" />
        <div className="container isl-header-inner">
          <div className="isl-header-copy">
            <span className="isl-header-eyebrow">ISLAND MAP</span>
            <h1 className="isl-header-title">섬 지도 탐험</h1>
            <p className="isl-header-desc">
              인천의 섬을 탐험해보세요. 방문한 섬은 초록빛으로, 아직 가보지 못한 섬은 회색으로 표시됩니다.
            </p>
          </div>
          <IslandVisitProgressCard />
        </div>
      </header>
    </div>
  );
}
