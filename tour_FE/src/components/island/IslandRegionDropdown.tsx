import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ISLAND_MAP,
  ISLAND_REGIONS,
  ISLANDS,
  type IslandRegionName,
} from "@/lib/island-data";

type IslandRegionDropdownProps = {
  activeRegion: IslandRegionName | null;
  selectedId: string | null;
  onRegionChange: (region: IslandRegionName | null) => void;
  onIslandSelect: (id: string) => void;
};

function triggerLabel(activeRegion: IslandRegionName | null, selectedId: string | null) {
  if (selectedId) {
    const island = ISLAND_MAP[selectedId];
    if (island) return `${island.region} · ${island.name}`;
  }
  if (activeRegion) return activeRegion;
  return "권역 · 섬 선택";
}

function triggerHint(activeRegion: IslandRegionName | null, selectedId: string | null) {
  if (selectedId) return "섬 선택됨";
  if (activeRegion) return "권역만 선택됨";
  return "전체";
}

export function IslandRegionDropdown({
  activeRegion,
  selectedId,
  onRegionChange,
  onIslandSelect,
}: IslandRegionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedRegion, setExpandedRegion] = useState<IslandRegionName | null>(activeRegion);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const islandsByRegion = useMemo(() => {
    const grouped = Object.fromEntries(ISLAND_REGIONS.map((region) => [region, [] as typeof ISLANDS])) as Record<
      IslandRegionName,
      typeof ISLANDS
    >;
    for (const island of ISLANDS) {
      grouped[island.region as IslandRegionName]?.push(island);
    }
    return grouped;
  }, []);

  useEffect(() => {
    if (activeRegion) setExpandedRegion(activeRegion);
  }, [activeRegion]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && activeRegion) setExpandedRegion(activeRegion);
      return next;
    });
  };

  const handleSelectAll = () => {
    onRegionChange(null);
    setExpandedRegion(null);
    close();
  };

  const handleSelectRegion = (region: IslandRegionName) => {
    onRegionChange(region);
    setExpandedRegion(region);
  };

  const handleSelectIsland = (id: string) => {
    onIslandSelect(id);
    close();
  };

  return (
    <div className="isl-region-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`isl-region-dropdown__trigger${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={handleToggle}
      >
        <span className="isl-region-dropdown__trigger-text">
          <span className="isl-region-dropdown__trigger-label">{triggerLabel(activeRegion, selectedId)}</span>
          <span className="isl-region-dropdown__trigger-hint">{triggerHint(activeRegion, selectedId)}</span>
        </span>
        <span className="isl-region-dropdown__chevron" aria-hidden="true" />
      </button>

      {open && (
        <div id={listId} className="isl-region-dropdown__panel" role="listbox" aria-label="권역 및 섬 선택">
          <button
            type="button"
            role="option"
            aria-selected={activeRegion === null && selectedId === null}
            className={`isl-region-dropdown__all${activeRegion === null && selectedId === null ? " is-active" : ""}`}
            onClick={handleSelectAll}
          >
            전체
          </button>

          <div className="isl-region-dropdown__groups">
            {ISLAND_REGIONS.map((region) => {
              const isRegionActive = activeRegion === region;
              const isExpanded = expandedRegion === region;
              const isRegionOnly = isRegionActive && !selectedId;
              const islands = islandsByRegion[region];

              return (
                <div
                  key={region}
                  className={`isl-region-dropdown__group${isExpanded ? " is-expanded" : ""}${isRegionActive ? " is-active" : ""}`}
                >
                  <button
                    type="button"
                    className={`isl-region-dropdown__region${isRegionActive ? " is-active" : ""}${isRegionOnly ? " is-region-only" : ""}`}
                    aria-expanded={isExpanded}
                    onClick={() => handleSelectRegion(region)}
                  >
                    <span className="isl-region-dropdown__region-label">{region}</span>
                    {isRegionOnly && <span className="isl-region-dropdown__badge">권역 보기</span>}
                    <span className="isl-region-dropdown__region-chevron" aria-hidden="true" />
                  </button>

                  {isExpanded && (
                    <ul className="isl-region-dropdown__islands" role="group" aria-label={`${region} 섬 목록`}>
                      {islands.map((island) => {
                        const isSelected = selectedId === island.id;
                        return (
                          <li key={island.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              className={`isl-region-dropdown__island${isSelected ? " is-selected" : ""}${island.visited ? " is-visited" : ""}`}
                              onClick={() => handleSelectIsland(island.id)}
                            >
                              <span className="isl-region-dropdown__island-name">{island.name}</span>
                              <span className="isl-region-dropdown__island-status">
                                {island.visited ? "방문 완료" : "미방문"}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
