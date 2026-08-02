import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type RefObject } from "react";
import { ISLAND_MAP } from "@/lib/island-data";
import {
  ISLAND_MAP_AREAS,
  ISLAND_MAP_AREA_BY_ID,
  ISLAND_MAP_IMAGE,
  ISLAND_MAP_VIEWBOX,
} from "./island-map-areas";

type IslandExplorerMapProps = {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  readonly?: boolean;
  captureMode?: boolean;
};

function islandClass(id: string, selectedId: string | null) {
  const island = ISLAND_MAP[id];
  const visited = island?.visited ?? false;
  const selected = selectedId === id;
  return `isl-explorer ${visited ? "done" : "todo"}${selected ? " selected" : ""}`;
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
  onSelect,
  readonly = false,
}: {
  id: string;
  polygon: string;
  regionColor: string;
  title: string;
  selectedId: string | null;
  onSelect?: (id: string) => void;
  readonly?: boolean;
}) {
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

  const visitLabel = ISLAND_MAP[id]?.visited ? "방문 완료" : "미방문";
  const style = { "--isl-region-color": regionColor } as CSSProperties;

  return (
    <g
      className={islandClass(id, selectedId)}
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
          })}
    >
      <title>{`${title} · ${visitLabel}`}</title>
      <path className="isl-hit-area" d={polygon} />
    </g>
  );
}

function clientToSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const local = pt.matrixTransform(ctm.inverse());
  return { x: Math.round(local.x), y: Math.round(local.y) };
}

function MapCaptureOverlay({ svgRef }: { svgRef: RefObject<SVGSVGElement | null> }) {
  const [captureId, setCaptureId] = useState(ISLAND_MAP_AREAS[0]?.id ?? "baek");
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const handleSvgClick = (e: MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const pt = clientToSvgPoint(svg, e.clientX, e.clientY);
    if (!pt) return;
    setPoints((prev) => [...prev, pt]);
    console.log(`[mapCapture:${captureId}]`, pt);
  };

  const pathFromPoints = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return "";
    const [first, ...rest] = pts;
    return ["M" + first.x + " " + first.y, ...rest.map((p) => `L${p.x} ${p.y}`), "Z"].join(" ");
  };

  const copyPath = async () => {
    const d = pathFromPoints(points);
    await navigator.clipboard.writeText(JSON.stringify({ id: captureId, d }, null, 2));
    console.log("[mapCapture] copied", { id: captureId, d });
  };

  return (
    <>
      <rect
        className="isl-map-capture-layer"
        x="0"
        y="0"
        width={ISLAND_MAP_VIEWBOX.width}
        height={ISLAND_MAP_VIEWBOX.height}
        onClick={handleSvgClick}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} className="isl-map-capture-dot" />
      ))}
      {points.length >= 2 && (
        <polyline
          className="isl-map-capture-line"
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        />
      )}
      <foreignObject x="8" y="8" width="320" height="120">
        <div className="isl-map-capture-panel">
          <label>
            섬 ID
            <select value={captureId} onChange={(e) => setCaptureId(e.target.value)}>
              {ISLAND_MAP_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.id})
                </option>
              ))}
            </select>
          </label>
          <div className="isl-map-capture-actions">
            <button type="button" onClick={() => setPoints([])}>
              초기화
            </button>
            <button type="button" onClick={copyPath} disabled={points.length < 3}>
              path 복사
            </button>
          </div>
          <p>클릭으로 외곽 좌표 수집 → 콘솔 확인 후 island-map-traced.json 갱신</p>
        </div>
      </foreignObject>
    </>
  );
}

export function IslandExplorerMap({
  selectedId = null,
  onSelect,
  readonly = false,
  captureMode = false,
}: IslandExplorerMapProps) {
  const { width, height } = ISLAND_MAP_VIEWBOX;
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div
      className={[
        "isl-map-stack",
        !readonly && selectedId ? "isl-map-has-selection" : "",
        captureMode ? "isl-map-capture" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        className="isl-map-image"
        src={ISLAND_MAP_IMAGE}
        alt={readonly ? "인천 섬 지도" : "인천 섬 탐험 지도"}
        width={width}
        height={height}
        draggable={false}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden={!readonly}
        aria-label={readonly ? undefined : "섬 클릭 영역"}
        className="isl-map-overlay"
      >
        {captureMode && import.meta.env.DEV ? (
          <MapCaptureOverlay svgRef={svgRef} />
        ) : (
          ISLAND_MAP_AREAS.map((area) => {
            if (!area.polygon) return null;
            return (
              <IslandHitArea
                key={area.id}
                id={area.id}
                polygon={area.polygon}
                regionColor={area.regionColor}
                title={area.name}
                selectedId={selectedId}
                onSelect={onSelect}
                readonly={readonly}
              />
            );
          })
        )}

        {!readonly && !captureMode && selectedId && <SelectedIslandBoat islandId={selectedId} />}
      </svg>
    </div>
  );
}
