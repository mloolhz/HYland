import { useState } from "react";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import type { IslandInfo } from "@/lib/island-data";

type IslandViewMode = "list" | "map";

type MyPageIslandRecordProps = {
  islandStats: { visited: number; total: number; percent: number };
  visitedIslands: IslandInfo[];
  unvisitedIslands: IslandInfo[];
};

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MyPageIslandRecord({
  islandStats,
  visitedIslands,
  unvisitedIslands,
}: MyPageIslandRecordProps) {
  const [viewMode, setViewMode] = useState<IslandViewMode>("map");

  return (
    <>
      <div className="mp-section-head mp-island-head">
        <div>
          <p className="mp-section-label">섬 탐험 기록</p>
          <h2 id="mp-islands-title" className="mp-section-title">
            방문 {islandStats.visited} / {islandStats.total} · 진행률 {islandStats.percent}%
          </h2>
        </div>
        <div className="mp-island-view-toggle" role="tablist" aria-label="섬 탐험 보기 방식">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "map"}
            aria-label="지도"
            title="지도"
            className={`mp-island-view-btn${viewMode === "map" ? " is-active" : ""}`}
            onClick={() => setViewMode("map")}
          >
            <IconMap />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "list"}
            aria-label="리스트"
            title="리스트"
            className={`mp-island-view-btn${viewMode === "list" ? " is-active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <IconList />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="mp-island-columns" role="tabpanel" aria-label="리스트 보기">
          <div className="mp-island-col">
            <h3 className="mp-island-col-title">
              방문 완료 <span>{visitedIslands.length}</span>
            </h3>
            <ul className="mp-island-list">
              {visitedIslands.map((island) => (
                <li key={island.id} className="mp-island-item done">
                  <span className="mp-island-name">{island.name}</span>
                  <span className="mp-island-region">{island.region}</span>
                  <span className="mp-island-badge done">방문 완료</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mp-island-col">
            <h3 className="mp-island-col-title">
              미방문 <span>{unvisitedIslands.length}</span>
            </h3>
            <ul className="mp-island-list">
              {unvisitedIslands.map((island) => (
                <li key={island.id} className="mp-island-item todo">
                  <span className="mp-island-name">{island.name}</span>
                  <span className="mp-island-region">{island.region}</span>
                  <span className="mp-island-badge todo">미방문</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mp-island-map-view" role="tabpanel" aria-label="지도 보기">
          <div className="mp-island-map-layout">
            <div className="mp-island-map-card">
              <IslandExplorerMap selectedId={null} onSelect={() => {}} />
            </div>
            <div className="isl-legend mp-island-map-legend" aria-label="지도 범례">
              <span className="lg">
                <span className="dot done" />
                방문 완료
              </span>
              <span className="lg">
                <span className="dot todo" />
                미방문
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
