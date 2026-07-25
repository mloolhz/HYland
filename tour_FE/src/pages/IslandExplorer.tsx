import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IslandDetailPanel } from "@/components/island/IslandDetailPanel";
import { IslandExplorerHeader } from "@/components/island/IslandExplorerHeader";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import { ISLAND_MAP, ISLANDS } from "@/lib/island-data";

function readIslandId(param: string | null): string | null {
  if (!param || !ISLAND_MAP[param]) return null;
  return param;
}

function readRegionIslandId(param: string | null): string | null {
  if (!param) return null;
  const region = decodeURIComponent(param);
  const island = ISLANDS.find((item) => item.region === region);
  return island?.id ?? null;
}

export function IslandExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const islandParam = searchParams.get("island");
  const regionParam = searchParams.get("region");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => readIslandId(islandParam) ?? readRegionIslandId(regionParam),
  );

  useEffect(() => {
    setSelectedId(readIslandId(islandParam) ?? readRegionIslandId(regionParam));
  }, [islandParam, regionParam]);

  const selectedIsland = selectedId ? ISLAND_MAP[selectedId] ?? null : null;

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setSearchParams({ island: id }, { replace: true });
    },
    [setSearchParams],
  );

  const handleClose = useCallback(() => {
    setSelectedId(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

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
            <p className="isl-map-hint">섬을 클릭하면 상세 정보를 확인할 수 있어요</p>
          </div>

          <div className="isl-map-card">
            <IslandExplorerMap selectedId={selectedId} onSelect={handleSelect} />
          </div>
        </div>

        <IslandDetailPanel island={selectedIsland} isOpen={selectedId !== null} onClose={handleClose} />
      </div>
    </div>
  );
}
