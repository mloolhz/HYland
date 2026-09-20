import {
  useCallback,
  useId,
  useMemo,
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
  /**
   * 섬 클릭 영역 밖(바다·미매핑) 클릭 시 — 권역 「전체」 등.
   * 누른 자리를 지도 원본 좌표로 같이 넘긴다. 모바일 뷰어는 이 좌표로
   * 근처 섬을 찾아 "섬 이름 글자"를 눌러도 그 섬이 잡히게 쓴다.
   */
  onBackgroundClick?: (point?: { x: number; y: number }) => void;
  readonly?: boolean;
  /**
   * 이 지도를 감싼 쪽에서 CSS transform 으로 확대한 배율 (모바일 지도 뷰어).
   * 툴팁은 확대된 지도 안에 그려지므로 배율만큼 같이 커져 섬을 덮어 버린다.
   * 이 값으로 좌표를 되돌리고 크기를 역보정해 화면에서는 늘 같은 크기로 보이게 한다.
   */
  viewScale?: number;
  /**
   * 툴팁을 어디에 붙일지.
   * - "pointer" (기본): 마우스를 올린 섬에, 커서 자리에 붙는다 (데스크톱)
   * - "selection": 선택된 섬에 고정된다 (터치 — 호버가 없으니 탭한 섬의 이름표 역할)
   */
  tooltipAnchor?: "pointer" | "selection";
  /** 확대·이동이 끝날 때까지 툴팁을 감춘다 (움직이는 도중에 먼저 뜨지 않도록) */
  tooltipHidden?: boolean;
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
  /** 지도 래퍼 기준 위치 — px(숫자) 또는 "%"(문자열) */
  x: number | string;
  y: number | string;
};

function IslandMapTooltip({ hover, viewScale }: { hover: MapHover; viewScale: number }) {
  const { isVisited } = useVisitedIslands();
  const island = ISLAND_MAP[hover.id];
  const visited = isVisited(hover.id);
  if (!island) return null;

  return (
    <div
      className="isl-map-tooltip"
      style={
        {
          left: hover.x,
          top: hover.y,
          "--isl-tip-scale": 1 / viewScale,
        } as CSSProperties
      }
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
  viewScale = 1,
  tooltipAnchor = "pointer",
  tooltipHidden = false,
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
      // 선택 고정 모드(터치)에서는 손가락을 올렸다는 이유로 이름표를 띄우지 않는다
      if (tooltipAnchor === "selection") return;
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

      // rect·rawX/rawY 는 확대가 반영된 화면 px 이다. 툴팁은 확대되기 전 좌표계에
      // 그려지므로 clamp 는 화면 px 로 하고, 마지막에 배율로 나눠 되돌린다.
      const padX = 96;
      const padTop = 8;
      const padBottom = 24;
      const x = Math.min(Math.max(rawX, padX), rect.width - padX) / viewScale;
      const y = Math.min(Math.max(rawY, padTop), rect.height - padBottom) / viewScale;

      setHover({ id, x, y });
    },
    [mapPointToLocal, viewScale, tooltipAnchor],
  );

  /**
   * 선택된 섬에 고정하는 툴팁 위치.
   * 래퍼 기준 % 라서 감싼 쪽이 CSS transform 으로 확대·이동해도 그대로 맞는다.
   */
  const selectionTip = useMemo<MapHover | null>(() => {
    if (tooltipAnchor !== "selection" || !selectedId) return null;
    const pos = ISLAND_MAP_AREA_BY_ID[selectedId]?.boatPosition;
    if (!pos) return null;
    return {
      id: selectedId,
      x: `${(pos.x / width) * 100}%`,
      y: `${(pos.y / height) * 100}%`,
    };
  }, [tooltipAnchor, selectedId, width, height]);

  const activeTip = tooltipAnchor === "selection" ? selectionTip : hover;

  const handleSvgClick = useCallback(
    (event: MouseEvent<SVGSVGElement>) => {
      if (readonly || !onBackgroundClick) return;
      const target = event.target as Element;
      if (target.closest(".isl-explorer")) return;

      // 누른 자리를 지도 원본 좌표(1024×642)로 환산해 같이 넘긴다
      const svg = event.currentTarget;
      const matrix = svg.getScreenCTM();
      if (!matrix) {
        onBackgroundClick();
        return;
      }
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const local = pt.matrixTransform(matrix.inverse());
      onBackgroundClick({ x: local.x, y: local.y });
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
          /* 랜딩 프리뷰는 클릭도 툴팁도 없다. CSS 의 :hover 까지 막아 그림처럼 둔다 */
          readonly ? "isl-map-svg--readonly" : "",
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

      {activeTip && !readonly && !tooltipHidden && (
        <IslandMapTooltip hover={activeTip} viewScale={viewScale} />
      )}
    </div>
  );
}
