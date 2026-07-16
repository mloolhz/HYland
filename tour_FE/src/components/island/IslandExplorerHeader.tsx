import { getIslandStats } from "@/lib/island-data";
import { RollingNumber } from "./RollingNumber";

export function IslandExplorerHeader() {
  const { visited, total, percent } = getIslandStats();

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
          <div className="isl-header-stats" aria-label="탐험 현황">
            <div className="isl-stat-chip isl-stat-chip--accent">
              <b aria-label={`방문 완료 ${visited}개`}>
                <RollingNumber value={visited} delay={0} />
              </b>
              <span>방문 완료</span>
            </div>
            <div className="isl-stat-chip">
              <b aria-label={`전체 섬 ${total}개`}>
                <RollingNumber value={total} delay={80} />
              </b>
              <span>전체 섬</span>
            </div>
            <div className="isl-stat-chip">
              <b aria-label={`탐험 진행률 ${percent}%`}>
                <RollingNumber value={percent} delay={160} suffix="%" />
              </b>
              <span>탐험 진행률</span>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
