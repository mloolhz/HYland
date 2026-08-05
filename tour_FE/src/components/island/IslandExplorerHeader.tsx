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
              인천의 섬을 한눈에 살펴보세요. 권역별로 섬을 골라 클릭하면 레저 코스와 뱃길 정보를 확인할 수
              있어요.
            </p>
          </div>
          <IslandVisitProgressCard />
        </div>
      </header>
    </div>
  );
}
