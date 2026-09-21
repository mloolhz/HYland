import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IslandInfo } from "@/lib/island-data";
import { IslandDetailContent } from "@/components/island/IslandDetailPanel";

/** 닫히는 애니메이션 시간 — CSS(.m-isl-sheet transition)와 맞춘다 */
const CLOSE_MS = 340;
/** 이만큼(px) 끌어내리면 닫는다 — 시트가 낮으면 높이의 1/4 */
const CLOSE_DISTANCE = 120;
/** 빠르게 튕겨 내리면 거리가 짧아도 닫는다 (px/ms) */
const CLOSE_VELOCITY = 0.6;
/** 튕기기로 닫을 때도 최소 이만큼은 내려와야 한다 — 손가락 떨림으로 닫히지 않게 */
const FLICK_MIN = 24;
/** 이만큼 움직여야 "끌기"로 본다 — 그 전엔 탭·스크롤과 구분이 안 된다 */
const DRAG_SLOP = 6;

/**
 * 모바일 섬 상세 바텀시트
 *
 * 데스크톱 패널(IslandDetailPanel)은 열리는 순간 is-open 으로 그려져
 * 아래에서 올라오는 움직임 없이 툭 나타났고, 닫을 때도 바로 사라졌다.
 * - 닫힌 자리(translateY 100%)를 먼저 계산시킨 뒤 열어 트랜지션이 돌게 한다
 * - 닫을 때는 내려가는 애니메이션이 끝날 때까지 마지막 섬을 들고 있는다
 * - 손잡이·머리글을 끌거나, 본문이 맨 위일 때 아래로 쓸어내리면 닫힌다
 */
export function MobileIslandSheet({
  island,
  onClose,
}: {
  island: IslandInfo | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState<IslandInfo | null>(island);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (island) {
      setShown(island);
      // 닫히던 중에 다시 열리면 끌기에서 남은 인라인 값을 치운다
      clearDragStyle(panelRef.current, backdropRef.current);
      return;
    }

    setOpen(false);
    const t = window.setTimeout(() => setShown(null), CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [island]);

  // 닫힌 자리(translateY 100%)를 브라우저가 한 번 계산하게 한 뒤 연다 — 그래야
  // 올라오는 트랜지션이 시작된다. rAF 는 탭이 가려지면 멈춰 시트가 안 열릴 수 있어
  // 레이아웃을 강제로 읽는 쪽을 쓴다.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!island || !shown || !panel || open) return;
    void panel.offsetHeight;
    setOpen(true);
  }, [island, shown, open]);

  // 시트가 떠 있는 동안 뒤 화면이 같이 스크롤되지 않게
  useEffect(() => {
    if (!island) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [island]);

  /**
   * 아래로 쓸어내려 닫기.
   *
   * 본문이 스크롤되는 시트라 React 의 onTouchMove(passive)로는 브라우저 스크롤을
   * 막을 수 없다. 네이티브 리스너를 passive:false 로 달아, "맨 위에서 아래로"
   * 끄는 경우에만 스크롤 대신 시트를 끌어내린다.
   * 끄는 동안은 매 프레임 React 렌더 없이 style 을 직접 바꾼다.
   */
  const hasSheet = shown !== null;
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    let startY = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let offset = 0;
    let tracking = false;
    let dragging = false;
    /** 손잡이·머리글에서 시작했으면 본문 스크롤 위치와 상관없이 끈다 */
    let fromHandle = false;

    const begin = (y: number, target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      fromHandle = Boolean(el?.closest(".m-isl-sheet__grip, .isl-detail-head"));
      startY = y;
      lastY = y;
      lastT = performance.now();
      velocity = 0;
      offset = 0;
      tracking = true;
      dragging = false;
    };

    /** true 를 돌려주면 이 움직임은 시트가 가져간다 (스크롤 막기) */
    const move = (y: number): boolean => {
      if (!tracking) return false;
      const dy = y - startY;

      if (!dragging) {
        if (Math.abs(dy) < DRAG_SLOP) return false;
        // 위로 밀거나, 본문이 스크롤돼 있으면 평소처럼 스크롤한다
        if (dy < 0 || (!fromHandle && panel.scrollTop > 0)) {
          tracking = false;
          return false;
        }
        dragging = true;
        startY = y;
        panel.style.transition = "none";
        backdrop.style.transition = "none";
      }

      const now = performance.now();
      if (now > lastT) velocity = (y - lastY) / (now - lastT);
      lastY = y;
      lastT = now;

      offset = Math.max(0, y - startY);
      panel.style.transform = `translateY(${offset}px)`;
      const ratio = Math.min(1, offset / Math.max(panel.offsetHeight, 1));
      backdrop.style.opacity = String(1 - ratio);
      return true;
    };

    const end = () => {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      dragging = false;

      const threshold = Math.min(CLOSE_DISTANCE, panel.offsetHeight / 4);
      // 트랜지션을 되살린 채로 목표값을 넣어, 지금 자리에서 이어서 움직이게 한다
      panel.style.transition = "";
      backdrop.style.transition = "";
      if (offset > threshold || (velocity > CLOSE_VELOCITY && offset > FLICK_MIN)) {
        panel.style.transform = "translateY(100%)";
        backdrop.style.opacity = "0";
        onCloseRef.current();
        return;
      }
      clearDragStyle(panel, backdrop);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false;
        return;
      }
      begin(e.touches[0].clientY, e.target);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (move(e.touches[0].clientY) && e.cancelable) e.preventDefault();
    };

    // 마우스로도 손잡이·머리글을 끌 수 있게 (좁힌 데스크톱 창에서 확인할 때)
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      const el = e.target instanceof Element ? e.target : null;
      if (!el?.closest(".m-isl-sheet__grip, .isl-detail-head") || el.closest("button, a")) return;
      begin(e.clientY, e.target);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp, { once: true });
    };
    const onPointerMove = (e: PointerEvent) => {
      move(e.clientY);
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      end();
    };

    panel.addEventListener("touchstart", onTouchStart, { passive: true });
    panel.addEventListener("touchmove", onTouchMove, { passive: false });
    panel.addEventListener("touchend", end);
    panel.addEventListener("touchcancel", end);
    panel.addEventListener("pointerdown", onPointerDown);
    return () => {
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", end);
      panel.removeEventListener("touchcancel", end);
      panel.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [hasSheet]);

  if (!shown) return null;

  return (
    <>
      <div
        ref={backdropRef}
        className={`isl-detail-backdrop${open ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`isl-detail m-isl-sheet${open ? " is-open" : ""}`}
        aria-label={`${shown.name} 상세 정보`}
        role="dialog"
        aria-modal="true"
      >
        <div className="m-isl-sheet__grip" aria-hidden="true">
          <span />
        </div>
        <IslandDetailContent island={shown} onClose={onClose} />
      </aside>
    </>
  );
}

function clearDragStyle(panel: HTMLElement | null, backdrop: HTMLElement | null) {
  if (panel) {
    panel.style.transform = "";
    panel.style.transition = "";
  }
  if (backdrop) {
    backdrop.style.opacity = "";
    backdrop.style.transition = "";
  }
}
