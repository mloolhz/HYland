import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { ISLAND_MAP } from "@/lib/island-data";
import { useVisitedIslands } from "@/store/visited-islands";
import {
  ISLAND_MAP_AREAS,
  ISLAND_MAP_AREA_BY_ID,
  ISLAND_MAP_IMAGE,
  ISLAND_MAP_VIEWBOX,
} from "./island-map-areas";

type IslandExplorerMapProps = {
  selectedId?: string | null;
  activeRegion?: string | null;
  onSelect?: (id: string) => void;
  /** 섬 클릭 영역 밖(바다·미매핑) 클릭 시 — 권역 「전체」 등 */
  onBackgroundClick?: () => void;
  readonly?: boolean;
};

function islandClass(
  id: string,
  selectedId: string | null,
  activeRegion: string | null,
  visited: boolean,
) {
  const island = ISLAND_MAP[id];
  const selected = selectedId === id;
  const dimmed = activeRegion !== null && island?.region !== activeRegion;
  return `isl-explorer ${visited ? "done" : "todo"}${selected ? " selected" : ""}${dimmed ? " is-dimmed" : ""}`;
}

function SelectedIslandBoat({ islandId }: { islandId: string }) {
  const pos = ISLAND_MAP_AREA_BY_ID[islandId]?.boatPosition;
  if (!pos) return null;

  const name = ISLAND_MAP[islandId]?.name ?? "선택한 섬";

  return (
    <g
      className="isl-selected-marker"
      transform={`translate(${pos.x} ${pos.y})`}
      aria-hidden="true"
    >
      <title>{name}</title>
      <g className="isl-boat-icon">
        <path className="isl-boat-hull" d="M-11 6 C-3 9.5 3 9.5 11 6 L 8.5 2.5 C2 0.8 -2 0.8 -8.5 2.5 Z" />
        <path className="isl-boat-hull-shine" d="M-6 4.5 C-1 6.5 1 6.5 6 4.5 L 4.5 3.2 C1.5 2.2 -1.5 2.2 -4.5 3.2 Z" />
        <line className="isl-boat-mast" x1="0" y1="2.5" x2="0" y2="-14.5" />
        <path className="isl-boat-sail-main" d="M0.8 -14 L9.5 2.5 L0.8 2.5 Z" />
        <path className="isl-boat-sail-jib" d="M-0.8 -12.5 L-8.5 2.5 L-0.8 2.5 Z" />
      </g>
    </g>
  );
}

function IslandHitArea({
  id,
  polygon,
  regionColor,
  title,
  selectedId,
  activeRegion,
  onSelect,
  onHover,
  readonly = false,
}: {
  id: string;
  polygon: string;
  regionColor: string;
  title: string;
  selectedId: string | null;
  activeRegion: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null, event?: PointerEvent<SVGGElement>) => void;
  readonly?: boolean;
}) {
  const { isVisited } = useVisitedIslands();
  const visited = isVisited(id);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (readonly || !onSelect) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
    [id, onSelect, readonly],
  );

  const visitLabel = visited ? "방문 완료" : "미방문";
  const style = { "--isl-region-color": regionColor } as CSSProperties;

  const handlePointer = useCallback(
    (event: PointerEvent<SVGGElement>) => {
      if (readonly || !onHover) return;
      onHover(id, event);
    },
    [id, onHover, readonly],
  );

  const handlePointerLeave = useCallback(() => {
    if (readonly || !onHover) return;
    onHover(null);
  }, [onHover, readonly]);

  const handleFocus = useCallback(() => {
    if (readonly || !onHover) return;
    onHover(id);
  }, [id, onHover, readonly]);

  return (
    <g
      className={islandClass(id, selectedId, activeRegion, visited)}
      style={style}
      {...(readonly
        ? {}
        : {
            role: "button",
            tabIndex: 0,
            "aria-label": `${title} · ${visitLabel}`,
            "aria-pressed": selectedId === id,
            onClick: () => onSelect?.(id),
            onKeyDown: handleKeyDown,
            onPointerEnter: handlePointer,
            onPointerMove: handlePointer,
            onPointerLeave: handlePointerLeave,
            onFocus: handleFocus,
            onBlur: handlePointerLeave,
          })}
    >
      <path className="isl-hit-area" d={polygon} />
    </g>
  );
}

function RegionDimLayer({
  activeRegion,
  maskId,
  width,
  height,
}: {
  activeRegion: string;
  maskId: string;
  width: number;
  height: number;
}) {
  const activePolygons = ISLAND_MAP_AREAS.filter(
    (area) => area.polygon && ISLAND_MAP[area.id]?.region === activeRegion,
  );

  return (
    <>
      <defs>
        <mask id={maskId}>
          <rect width={width} height={height} fill="white" />
          {activePolygons.map((area) => (
            <path
              key={area.id}
              d={area.polygon!}
              fill="black"
              stroke="black"
              strokeWidth={14}
              strokeLinejoin="round"
            />
          ))}
        </mask>
      </defs>
      <rect
        className="isl-map-region-dim"
        width={width}
        height={height}
        mask={`url(#${maskId})`}
        aria-hidden="true"
      />
    </>
  );
}

type MapHover = {
  id: string;
  x: number;
  y: number;
};

function IslandMapTooltip({ hover }: { hover: MapHover }) {
  const { isVisited } = useVisitedIslands();
  const island = ISLAND_MAP[hover.id];
  const visited = isVisited(hover.id);
  if (!island) return null;

  return (
    <div
      className="isl-map-tooltip"
      style={{ left: hover.x, top: hover.y }}
      role="tooltip"
      aria-hidden="true"
    >
      <p className="isl-map-tooltip__name">{island.name}</p>
      <span className={`isl-map-tooltip__status${visited ? " is-visited" : " is-unvisited"}`}>
        <span className="isl-map-tooltip__dot" aria-hidden="true" />
        {visited ? "방문 완료" : "미방문"}
      </span>
    </div>
  );
}

export function IslandExplorerMap({
  selectedId = null,
  activeRegion = null,
  onSelect,
  onBackgroundClick,
  readonly = false,
}: IslandExplorerMapProps) {
  const { width, height } = ISLAND_MAP_VIEWBOX;
  const wrapRef = useRef<HTMLDivElement>(null);
  const regionDimMaskId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<MapHover | null>(null);
  const mapPointToLocal = useCallback((svgX: number, svgY: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const svg = wrap.querySelector("svg");
    if (!svg) return null;

    const pt = svg.createSVGPoint();
    pt.x = svgX;
    pt.y = svgY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const screen = pt.matrixTransform(matrix);
    const rect = wrap.getBoundingClientRect();
    return { x: screen.x - rect.left, y: screen.y - rect.top };
  }, []);

  const handleHover = useCallback(
    (id: string | null, event?: PointerEvent<SVGGElement>) => {
      if (!id || !wrapRef.current) {
        setHover(null);
        return;
      }

      const rect = wrapRef.current.getBoundingClientRect();
      const anchor = ISLAND_MAP_AREA_BY_ID[id]?.boatPosition;

      let rawX = rect.width / 2;
      let rawY = rect.height / 2;

      if (event) {
        rawX = event.clientX - rect.left;
        rawY = event.clientY - rect.top;
      } else if (anchor) {
        const mapped = mapPointToLocal(anchor.x, anchor.y);
        if (mapped) {
          rawX = mapped.x;
          rawY = mapped.y;
        }
      }

      const padX = 96;
      const padTop = 8;
      const padBottom = 24;
      const x = Math.min(Math.max(rawX, padX), rect.width - padX);
      const y = Math.min(Math.max(rawY, padTop), rect.height - padBottom);

      setHover({ id, x, y });
    },
    [mapPointToLocal],
  );

  const handleSvgClick = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (readonly || !onBackgroundClick) return;
      const target = event.target as Element;
      if (target.closest(".isl-explorer")) return;
      onBackgroundClick();
    },
    [onBackgroundClick, readonly],
  );

  return (
    <div className="isl-map-interactive" ref={wrapRef}>
      <div className="isl-map-wrap">
        <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden={!readonly}
        aria-label={readonly ? undefined : "섬 클릭 영역"}
        className={[
          "isl-map-svg",
          !readonly && selectedId ? "isl-map-has-selection" : "",
          !readonly && activeRegion ? "isl-map-has-region" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleSvgClick}
      >
        <image
          href={ISLAND_MAP_IMAGE}
          width={width}
          height={height}
          preserveAspectRatio="none"
          aria-hidden="true"
        />

        {!readonly && activeRegion && (
          <RegionDimLayer
            activeRegion={activeRegion}
            maskId={regionDimMaskId}
            width={width}
            height={height}
          />
        )}

        {ISLAND_MAP_AREAS.map((area) => {
          if (!area.polygon) return null;
          return (
            <IslandHitArea
              key={area.id}
              id={area.id}
              polygon={area.polygon}
              regionColor={area.regionColor}
              title={area.name}
              selectedId={selectedId}
              activeRegion={activeRegion}
              onSelect={onSelect}
              onHover={handleHover}
              readonly={readonly}
            />
          );
        })}

        {!readonly && selectedId && <SelectedIslandBoat islandId={selectedId} />}
        </svg>
      </div>

      {hover && !readonly && <IslandMapTooltip hover={hover} />}
    </div>
  );
}
