import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ISLANDS } from "@/lib/island-data";
import { useVisitedIslands } from "@/store/visited-islands";
import { RollingNumber } from "./RollingNumber";

type PanelPos = { top: number; left: number; width: number };

export function IslandVisitProgressCard() {
  // 방문 여부는 서버 기록(user_island_visits)이 정답이다.
  // 예전에는 lib/island-data 의 고정 visited 플래그를 봤다.
  const { isVisited } = useVisitedIslands();
  const visitedIslands = ISLANDS.filter((i) => isVisited(i.id));
  const unvisitedIslands = ISLANDS.filter((i) => !isVisited(i.id));
  const visited = visitedIslands.length;
  const total = ISLANDS.length;
  const percent = total > 0 ? Math.round((visited / total) * 100) : 0;

  const [listOpen, setListOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const closeList = useCallback(() => setListOpen(false), []);

  const updatePanelPos = useCallback(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;

    const rect = toggle.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);

    setPanelPos({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!listOpen) return;

    updatePanelPos();
    window.addEventListener("resize", updatePanelPos);
    window.addEventListener("scroll", updatePanelPos, true);
    return () => {
      window.removeEventListener("resize", updatePanelPos);
      window.removeEventListener("scroll", updatePanelPos, true);
    };
  }, [listOpen, updatePanelPos]);

  useEffect(() => {
    if (!listOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (document.getElementById(listId)?.contains(target)) return;
      closeList();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeList();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeList, listId, listOpen]);

  const panel =
    listOpen && panelPos
      ? createPortal(
          <div
            id={listId}
            className="isl-visit-list-panel isl-visit-list-panel--floating"
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              width: panelPos.width,
            }}
            role="dialog"
            aria-label="섬 방문 기록"
          >
            <div className="isl-visit-list-panel__scroll">
              <section className="isl-visit-list-section">
                <h3 className="isl-visit-list-section__title">
                  <span aria-hidden="true">✅</span> 방문한 섬
                  <span className="isl-visit-list-section__count">{visitedIslands.length}</span>
                </h3>
                {visitedIslands.length ? (
                  <ul className="isl-visit-list">
                    {visitedIslands.map((island) => (
                      <li key={island.id} className="isl-visit-list__item is-visited">
                        {island.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="isl-visit-list-empty">아직 방문한 섬이 없어요</p>
                )}
              </section>

              <section className="isl-visit-list-section">
                <h3 className="isl-visit-list-section__title">
                  <span aria-hidden="true">🌫</span> 미방문 섬
                  <span className="isl-visit-list-section__count">{unvisitedIslands.length}</span>
                </h3>
                {unvisitedIslands.length ? (
                  <ul className="isl-visit-list">
                    {unvisitedIslands.map((island) => (
                      <li key={island.id} className="isl-visit-list__item is-unvisited">
                        {island.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="isl-visit-list-empty">모든 섬을 방문했어요!</p>
                )}
              </section>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="isl-progress-card" ref={rootRef}>
      <div className="isl-progress-card__head">
        <span className="isl-progress-card__icon" aria-hidden="true">
          🏝
        </span>
        <span className="isl-progress-card__title">섬 탐험 진행률</span>
      </div>

      <p className="isl-progress-card__percent" aria-label={`탐험 진행률 ${percent}%`}>
        <RollingNumber value={percent} delay={0} suffix="%" />
      </p>

      <div
        className="isl-progress-card__bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="섬 탐험 진행률"
      >
        <span className="isl-progress-card__bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <p className="isl-progress-card__meta">
        방문한 섬 <strong>{visited}</strong>
        <span aria-hidden="true"> / </span>
        전체 섬 <strong>{total}</strong>
      </p>

      <button
        ref={toggleRef}
        type="button"
        className={`isl-progress-card__toggle${listOpen ? " is-open" : ""}`}
        aria-expanded={listOpen}
        aria-controls={listId}
        onClick={() => {
          if (listOpen) {
            setListOpen(false);
            return;
          }
          updatePanelPos();
          setListOpen(true);
        }}
      >
        방문한 섬 리스트 보기
      </button>

      {panel}
    </div>
  );
}
