import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IslandDetailPanel } from "@/components/island/IslandDetailPanel";
import { IslandExplorerHeader } from "@/components/island/IslandExplorerHeader";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import { IslandRegionDropdown } from "@/components/island/IslandRegionDropdown";
import { ISLAND_MAP, parseIslandRegion, type IslandRegionName } from "@/lib/island-data";

function readIslandId(param: string | null): string | null {
  if (!param || !ISLAND_MAP[param]) return null;
  return param;
}

type IslandsLocationState = {
  islandId?: string;
};

export function IslandExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const islandParam = searchParams.get("island");
  const regionParam = searchParams.get("region");

  const [selectedId, setSelectedId] = useState<string | null>(() => readIslandId(islandParam));
  const [activeRegion, setActiveRegion] = useState<IslandRegionName | null>(() =>
    parseIslandRegion(regionParam),
  );

  useEffect(() => {
    const islandId = readIslandId(islandParam);
    setSelectedId(islandId);

    const regionFromParam = parseIslandRegion(regionParam);
    if (regionFromParam) {
      setActiveRegion(regionFromParam);
      return;
    }

    if (islandId && ISLAND_MAP[islandId]) {
      setActiveRegion(ISLAND_MAP[islandId].region as IslandRegionName);
      return;
    }

    setActiveRegion(null);
  }, [islandParam, regionParam]);

  const selectedIsland = selectedId ? (ISLAND_MAP[selectedId] ?? null) : null;

  const syncParams = useCallback(
    (next: { region?: IslandRegionName | null; island?: string | null }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const region = next.region !== undefined ? next.region : parseIslandRegion(params.get("region"));
          const island = next.island !== undefined ? next.island : readIslandId(params.get("island"));

          params.delete("region");
          params.delete("island");

          if (region) params.set("region", region);
          if (island) params.set("island", island);

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleRegionChange = useCallback(
    (region: IslandRegionName | null) => {
      setActiveRegion(region);
      setSelectedId(null);
      syncParams({ region, island: null });
    },
    [syncParams],
  );

  const handleSelect = useCallback(
    (id: string) => {
      const islandRegion = ISLAND_MAP[id]?.region as IslandRegionName | undefined;
      setSelectedId(id);
      setActiveRegion(islandRegion ?? null);
      syncParams({ island: id, region: islandRegion ?? null });
    },
    [syncParams],
  );

  const handleClose = useCallback(() => {
    setSelectedId(null);
    syncParams({ island: null });
  }, [syncParams]);

  return (
    <div className="isl-page">
      <IslandExplorerHeader />

      <div className="container isl-main">
        <div className="isl-map-area">
          <div className="isl-map-toolbar">
            <div className="isl-legend" aria-label="지도 범례">
              <span className="lg">
                <span className="dot done" />
                방문 완료
              </span>
              <span className="lg">
                <span className="dot todo" />
                미방문
              </span>
            </div>
            <p className="isl-map-hint">
              권역을 선택하면 해당 섬들이 강조되고, 섬을 선택하면 상세 정보를 확인할 수 있어요
            </p>
          </div>

          <IslandRegionDropdown
            activeRegion={activeRegion}
            selectedId={selectedId}
            onRegionChange={handleRegionChange}
            onIslandSelect={handleSelect}
          />

          <div className="isl-map-card">
            <IslandExplorerMap
              selectedId={selectedId}
              activeRegion={activeRegion}
              onSelect={handleSelect}
              onBackgroundClick={() => handleRegionChange(null)}
            />
          </div>
        </div>

        <div className="isl-detail-slot">
          <IslandDetailPanel island={selectedIsland} onClose={handleClose} />
        </div>
      </div>
    </div>
  );
}
