import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import { ISLAND_MAP_AREAS, ISLAND_MAP_VIEWBOX } from "@/components/island/island-map-areas";
import type { IslandRegionName } from "@/lib/island-data";

const MAP_RATIO = ISLAND_MAP_VIEWBOX.height / ISLAND_MAP_VIEWBOX.width;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
/** 섬·권역을 눌렀을 때의 확대 배율 — 지도 크기나 대상과 상관없이 고정 */
const FOCUS_ZOOM = 1.5;
/** 더블탭 확대 배율 */
const DOUBLE_TAP_ZOOM = 2.4;
/** 확대·이동에 쓰는 시간(ms) */
const ANIM_MS = 420;
/** 배경을 눌렀을 때 "이 섬을 누른 것"으로 쳐 주는 손가락 여유(화면 px) */
const TAP_SLACK_PX = 22;

type Transform = { k: number; x: number; y: number };

const IDENTITY: Transform = { k: 1, x: 0, y: 0 };

/** 지도 원본 좌표계(1024×642)의 사각형 */
type Box = { x: number; y: number; w: number; h: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 확대해도 지도가 화면 밖으로 빠져나가지 않게 이동량을 가둔다.
 * k=1 이면 이동 없음, k>1 이면 넘치는 만큼만 움직일 수 있다.
 */
function clampTransform(t: Transform, viewW: number, viewH: number): Transform {
  const k = clamp(t.k, MIN_SCALE, MAX_SCALE);
  const overflowX = Math.max(0, viewW * k - viewW) / 2;
  const overflowY = Math.max(0, viewH * k - viewH) / 2;
  return {
    k,
    x: clamp(t.x, -overflowX, overflowX),
    y: clamp(t.y, -overflowY, overflowY),
  };
}

/** 여러 상자를 감싸는 가장 작은 상자 */
function unionBox(prev: Box | undefined, next: Box): Box {
  if (!prev) return next;
  const x1 = Math.min(prev.x, next.x);
  const y1 = Math.min(prev.y, next.y);
  const x2 = Math.max(prev.x + prev.w, next.x + next.w);
  const y2 = Math.max(prev.y + prev.h, next.y + next.h);
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** 점에서 상자까지의 거리 (안에 있으면 0) */
function distanceToBox(px: number, py: number, box: Box): number {
  const dx = Math.max(box.x - px, 0, px - (box.x + box.w));
  const dy = Math.max(box.y - py, 0, py - (box.y + box.h));
  return Math.hypot(dx, dy);
}

/**
 * 권역별·섬별 경계 상자를 지도 원본 좌표(1024×642)로 잰다.
 *
 * 화면에 그려진 <g> 를 뒤지지 않고, 트레이싱된 path 문자열을 화면 밖 SVG 에
 * 한 번씩 넣어 getBBox() 로 잰다. 렌더 순서나 DOM 속성에 기대지 않는다.
 */
function measureBoxes(): { regions: Map<string, Box>; islands: Map<string, Box> } {
  const regions = new Map<string, Box>();
  const islands = new Map<string, Box>();
  if (typeof document === "undefined") return { regions, islands };

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  const path = document.createElementNS(NS, "path");
  svg.appendChild(path);
  document.body.appendChild(svg);

  try {
    for (const area of ISLAND_MAP_AREAS) {
      if (!area.polygon) continue;
      path.setAttribute("d", area.polygon);
      const b = path.getBBox();
      if (b.width === 0 || b.height === 0) continue;

      const box: Box = { x: b.x, y: b.y, w: b.width, h: b.height };
      regions.set(area.region, unionBox(regions.get(area.region), box));
      islands.set(area.id, unionBox(islands.get(area.id), box));
    }
  } finally {
    svg.remove();
  }

  return { regions, islands };
}

type MobileIslandMapProps = {
  selectedId: string | null;
  activeRegion: IslandRegionName | null;
  onSelect: (id: string) => void;
  onBackgroundClick: () => void;
  /**
   * 권역 칩을 누를 때마다 1 씩 오르는 값.
   * 같은 권역을 다시 눌러도(= activeRegion 이 그대로여도) 다시 확대하려면
   * 바뀌는 값이 하나 필요하다. 이게 없으면 "전체"로 되돌린 뒤 같은 칩을
   * 눌렀을 때 아무 일도 일어나지 않는다.
   */
  focusNonce?: number;
};

/**
 * 모바일 지도 뷰어 — 확대·이동을 얹은 껍데기
 *
 * 지도 그림(1024×642)을 폭 358px 화면에 그대로 맞추면 섬 하나가 13~52px 라
 * 손가락으로 누를 수가 없다. 지도 자체는 그대로 두고, 보여주는 방식만 바꾼다.
 *
 * - 섬이나 권역을 고르면 그쪽이 가운데로 오게 1.5배로 부드럽게 확대한다
 * - 두 손가락 핀치·더블탭으로 자유 확대, 드래그로 이동
 * - IslandExplorerMap 은 손대지 않고 CSS transform 으로 감싸기만 한다
 *   (히트 영역도 같이 커지므로 탭 정확도가 배율만큼 올라간다)
 */
export function MobileIslandMap({
  selectedId,
  activeRegion,
  onSelect,
  onBackgroundClick,
  focusNonce = 0,
}: MobileIslandMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  /** 확대·이동이 진행 중 — 끝나야 섬 이름표를 띄운다 */
  const [moving, setMoving] = useState(false);
  /**
   * 이름표를 띄워도 되는 섬 — "그 섬으로의 이동이 끝났을 때"만 갱신된다.
   *
   * moving 만으로는 한 프레임 번쩍인다. 섬을 누르면 selectedId 가 먼저 바뀐
   * 렌더가 한 번 지나가는데, 그때는 아직 이동을 시작하기 전(useEffect 이전)이라
   * moving 이 false 다. 그 틈에 이름표가 옛 자리에 잠깐 떴다가 사라졌다.
   * 선택이 바뀌는 렌더에서 곧바로 selectedId !== settledId 가 되어 가려진다.
   */
  const [settledId, setSettledId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  // 뷰포트 크기 — 스테이지도 같은 크기라 이게 곧 배율 1 의 지도 크기다
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** 권역별·섬별 경계 상자 (지도 원본 좌표) — 스테이지 크기와 무관하게 한 번만 잰다 */
  const boxes = useMemo(() => measureBoxes(), []);

  /**
   * 확대·이동 애니메이션은 JS 로 직접 돌린다.
   *
   * 처음엔 CSS transition 에 맡겼는데, 트랜지션을 켜는 클래스와 transform 값이
   * 같은 렌더에 바뀌다 보니 트랜지션이 아예 시작되지 않았다 (transitionend 도
   * 안 와서 지도가 즉시 튀고, "도착했는지"를 알 방법도 없었다).
   * 프레임마다 값을 직접 보간하면 끝나는 시점을 정확히 잡을 수 있다.
   */
  const rafRef = useRef<number | null>(null);
  const fallbackRef = useRef<number | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  useEffect(() => stopAnimation, [stopAnimation]);

  /** 손가락으로 끌거나 핀치할 때 — 프레임마다 바로 반영 */
  const setTransformNow = useCallback(
    (next: Transform) => {
      stopAnimation();
      setMoving(false);
      setTransform(next);
    },
    [stopAnimation],
  );

  /** 버튼·섬 선택처럼 프로그램이 옮길 때 — 미끄러지듯 이동 */
  const animateTo = useCallback(
    (target: Transform) => {
      stopAnimation();

      /** 도착 — 이제 이 섬의 이름표를 띄워도 된다 */
      const arrive = () => {
        setMoving(false);
        setSettledId(selectedIdRef.current);
      };

      const from = transformRef.current;
      const same =
        Math.abs(from.k - target.k) < 0.001 &&
        Math.abs(from.x - target.x) < 0.5 &&
        Math.abs(from.y - target.y) < 0.5;
      // 화면이 안 보이면 rAF 가 멈춘다 — 보간할 이유도 없으니 바로 목표값으로
      if (same || (typeof document !== "undefined" && document.visibilityState === "hidden")) {
        setTransform(target);
        arrive();
        return;
      }

      setMoving(true);
      const started = performance.now();

      const step = (now: number) => {
        const p = Math.min(1, (now - started) / ANIM_MS);
        const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setTransform({
          k: from.k + (target.k - from.k) * e,
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
        });
        if (p < 1) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        rafRef.current = null;
        arrive();
      };
      rafRef.current = requestAnimationFrame(step);

      // 탭이 숨겨져 rAF 가 멈춘 경우 — 끝난 것으로 치고 목표값을 박는다
      fallbackRef.current = window.setTimeout(() => {
        stopAnimation();
        setTransform(target);
        arrive();
      }, ANIM_MS + 400);
    },
    [stopAnimation],
  );

  /** 원본 좌표 상자의 가운데가 화면 가운데로 오게 FOCUS_ZOOM 배로 확대한다 */
  const focusBox = useCallback(
    (raw: Box) => {
      if (size.w === 0) return;
      const sx = size.w / ISLAND_MAP_VIEWBOX.width;
      const sy = size.h / ISLAND_MAP_VIEWBOX.height;
      const box: Box = { x: raw.x * sx, y: raw.y * sy, w: raw.w * sx, h: raw.h * sy };

      const k = FOCUS_ZOOM;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      // transform-origin 이 가운데라 중심 기준으로 계산한다
      const x = (size.w / 2 - cx) * k;
      const y = (size.h / 2 - cy) * k;
      animateTo(clampTransform({ k, x, y }, size.w, size.h));
    },
    [animateTo, size],
  );

  const reset = useCallback(() => animateTo(IDENTITY), [animateTo]);

  // 섬을 누르면 그 섬으로, 권역을 고르면 그 권역으로 확대 (전체면 원위치).
  // 고정 배율에서는 권역 가운데에 맞추면 가장자리 섬이 화면 밖에 남을 수 있어
  // 섬이 선택돼 있을 땐 그 섬 자체를 가운데에 둔다.
  useEffect(() => {
    if (size.w === 0) return;
    if (!activeRegion) {
      reset();
      return;
    }
    const box = (selectedId && boxes.islands.get(selectedId)) || boxes.regions.get(activeRegion);
    if (box) focusBox(box);
  }, [activeRegion, selectedId, focusNonce, boxes, size, focusBox, reset]);

  /**
   * 지도 배경을 눌렀을 때.
   *
   * 섬 이름은 배경 그림(PNG)에 인쇄된 글자라 클릭 영역이 없다. 그래서 이름을
   * 누르면 "바다를 눌렀다"로 처리돼 선택이 풀리고 확대도 되돌아갔다.
   * 손가락 굵기만큼 안에 섬이 있으면 그 섬을 누른 것으로 친다.
   */
  const handleBackground = useCallback(
    (point?: { x: number; y: number }) => {
      if (!point || size.w === 0) {
        onBackgroundClick();
        return;
      }

      // 화면에서 잰 여유(px)를 지도 원본 좌표로 환산 — 확대할수록 좁아져 정확해진다
      const pxPerUnit = (size.w / ISLAND_MAP_VIEWBOX.width) * transformRef.current.k;
      const slack = TAP_SLACK_PX / pxPerUnit;

      let bestId: string | null = null;
      let bestDist = Infinity;
      for (const [id, box] of boxes.islands) {
        const d = distanceToBox(point.x, point.y, box);
        if (d < bestDist) {
          bestDist = d;
          bestId = id;
        }
      }

      if (bestId && bestDist <= slack) {
        onSelect(bestId);
        return;
      }
      onBackgroundClick();
    },
    [boxes, onBackgroundClick, onSelect, size],
  );

  // ── 손가락 조작 ──
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gesture = useRef<{ dist: number; k: number; x: number; y: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(
    null,
  );
  const lastTap = useRef(0);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      stopAnimation();

      const current = transformRef.current;
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        gesture.current = {
          dist: Math.hypot(a.x - b.x, a.y - b.y),
          k: current.k,
          x: current.x,
          y: current.y,
        };
        panStart.current = null;
        return;
      }

      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        tx: current.x,
        ty: current.y,
        moved: false,
      };
    },
    [stopAnimation],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // 두 손가락 — 핀치 확대
      if (pointers.current.size === 2 && gesture.current) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const ratio = dist / gesture.current.dist;
        setTransformNow(
          clampTransform(
            { k: gesture.current.k * ratio, x: gesture.current.x, y: gesture.current.y },
            size.w,
            size.h,
          ),
        );
        return;
      }

      // 한 손가락 — 확대된 상태에서만 이동
      const start = panStart.current;
      if (!start || transformRef.current.k <= 1) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) start.moved = true;
      if (!start.moved) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setTransformNow(
        clampTransform(
          { ...transformRef.current, x: start.tx + dx, y: start.ty + dy },
          size.w,
          size.h,
        ),
      );
    },
    [setTransformNow, size],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) gesture.current = null;

      // 더블탭 — 확대/원위치 토글. 끌던 중이면 탭으로 치지 않는다
      const start = panStart.current;
      panStart.current = null;
      if (start?.moved) return;

      const now = Date.now();
      if (now - lastTap.current < 280) {
        lastTap.current = 0;
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return;

        if (transformRef.current.k > 1.05) {
          animateTo(IDENTITY);
        } else {
          // 누른 지점이 가운데로 오도록 확대
          const px = e.clientX - rect.left - rect.width / 2;
          const py = e.clientY - rect.top - rect.height / 2;
          const k = DOUBLE_TAP_ZOOM;
          animateTo(clampTransform({ k, x: -px * k, y: -py * k }, size.w, size.h));
        }
        return;
      }
      lastTap.current = now;
    },
    [animateTo, size],
  );

  // 데스크톱에서 확인할 때를 위한 휠 확대
  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
      const current = transformRef.current;
      setTransformNow(
        clampTransform({ ...current, k: current.k * (e.deltaY > 0 ? 0.92 : 1.08) }, size.w, size.h),
      );
    },
    [setTransformNow, size],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const current = transformRef.current;
      animateTo(clampTransform({ ...current, k: current.k * factor }, size.w, size.h));
    },
    [animateTo, size],
  );

  const zoomLabel = useMemo(() => `${transform.k.toFixed(1)}배`, [transform.k]);
  const zoomed = transform.k > 1.02;

  return (
    <div className="m-map">
      <div
        className={`m-map__viewport${zoomed ? " is-zoomed" : ""}`}
        ref={viewportRef}
        style={{ aspectRatio: `1 / ${MAP_RATIO}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="m-map__stage"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          }}
        >
          <IslandExplorerMap
            selectedId={selectedId}
            activeRegion={activeRegion}
            onSelect={onSelect}
            onBackgroundClick={handleBackground}
            viewScale={transform.k}
            tooltipAnchor="selection"
            tooltipHidden={moving || settledId !== selectedId}
          />
        </div>
      </div>

      <div className="m-map__controls">
        <span className="m-map__zoom">{zoomLabel}</span>
        <div className="m-map__btns">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.5)}
            aria-label="축소"
            disabled={transform.k <= MIN_SCALE}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.5)}
            aria-label="확대"
            disabled={transform.k >= MAX_SCALE}
          >
            ＋
          </button>
          <button
            type="button"
            className="m-map__reset"
            onClick={() => {
              reset();
              // 라벨대로 "전체" — 배율뿐 아니라 권역 선택도 같이 푼다
              if (activeRegion) onBackgroundClick();
            }}
            disabled={!zoomed && !activeRegion}
          >
            전체
          </button>
        </div>
      </div>
    </div>
  );
}
