import { useCallback, useState } from "react";
import { IslandDetailPanel } from "@/components/island/IslandDetailPanel";
import { IslandExplorerHeader } from "@/components/island/IslandExplorerHeader";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import { ISLAND_MAP } from "@/lib/island-data";

export function IslandExplorer() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIsland = selectedId ? ISLAND_MAP[selectedId] ?? null : null;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

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
