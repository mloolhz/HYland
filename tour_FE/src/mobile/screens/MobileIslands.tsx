import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ISLANDS,
  ISLAND_MAP,
  ISLAND_REGIONS,
  parseIslandRegion,
  type IslandRegionName,
} from "@/lib/island-data";
import { useSession } from "@/store/session";
import { useVisitedIslands } from "@/store/visited-islands";
import { IslandWeatherPanel } from "@/components/island/IslandWeatherPanel";
import { MobileIslandMap } from "./MobileIslandMap";
import { MobileIslandSheet } from "./MobileIslandSheet";
import { useAuthSheet } from "../auth/AuthSheetProvider";
import { ChevronRightIcon } from "../MobileIcons";

type ViewMode = "list" | "map";

function readIslandId(param: string | null): string | null {
  if (!param || !ISLAND_MAP[param]) return null;
  return param;
}

/**
 * 모바일 섬 탐험
 *
 * 데스크톱은 큰 SVG 지도 옆에 상세 패널을 붙인 2단이다. 폰에서 18개 섬을
 * 지도에서 손가락으로 집는 건 어려워서, 검색·권역 칩이 붙은 목록을 기본으로
 * 두고 지도는 한 번 탭해서 여는 다른 보기로 뺐다.
 */
export function MobileIslands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useSession();
  const { isVisited } = useVisitedIslands();
  const { openAuth } = useAuthSheet();

  const [view, setView] = useState<ViewMode>("list");
  /** 같은 권역을 다시 눌러도 지도가 다시 확대되도록 하는 신호 */
  const [focusNonce, setFocusNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    readIslandId(searchParams.get("island")),
  );
  /**
   * 섬 상세 시트가 열려 있는지.
   * 목록에서는 섬을 누르면 바로 열리지만, 지도에서는 섬을 눌러 확대된 모습을 먼저 보여 주고
   * "섬 정보 보기" 버튼을 눌러야 열린다 (시트가 지도를 가리면 확대가 의미 없어서).
   */
  const [detailOpen, setDetailOpen] = useState(() => readIslandId(searchParams.get("island")) !== null);
  const [region, setRegion] = useState<IslandRegionName | null>(() =>
    parseIslandRegion(searchParams.get("region")),
  );

  // 주소로 바로 들어오거나(예: /islands?island=baek) 뒤로 가기 했을 때 맞춰 준다
  useEffect(() => {
    const islandId = readIslandId(searchParams.get("island"));
    setSelectedId(islandId);

    const fromParam = parseIslandRegion(searchParams.get("region"));
    if (fromParam) {
      setRegion(fromParam);
      return;
    }
    if (islandId) {
      setRegion((ISLAND_MAP[islandId]?.region as IslandRegionName) ?? null);
      return;
    }
    setRegion(null);
  }, [searchParams]);

  const syncParams = useCallback(
    (next: { region?: IslandRegionName | null; island?: string | null }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const nextRegion =
            next.region !== undefined ? next.region : parseIslandRegion(params.get("region"));
          const nextIsland =
            next.island !== undefined ? next.island : readIslandId(params.get("island"));

          params.delete("region");
          params.delete("island");
          if (nextRegion) params.set("region", nextRegion);
          if (nextIsland) params.set("island", nextIsland);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const selectIsland = useCallback(
    (id: string, openDetail: boolean) => {
      const islandRegion = (ISLAND_MAP[id]?.region as IslandRegionName) ?? null;
      setSelectedId(id);
      setDetailOpen(openDetail);
      setRegion(islandRegion);
      syncParams({ island: id, region: islandRegion });
    },
    [syncParams],
  );

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    // 지도에서는 시트만 닫고 선택·확대는 그대로 둔다 (다시 "섬 정보 보기"를 누를 수 있게)
    if (view === "map") return;
    setSelectedId(null);
    syncParams({ island: null });
  }, [syncParams, view]);

  const changeRegion = useCallback(
    (next: IslandRegionName | null) => {
      setRegion(next);
      setSelectedId(null);
      setDetailOpen(false);
      setFocusNonce((n) => n + 1);
      syncParams({ region: next, island: null });
    },
    [syncParams],
  );

  const visitedCount = useMemo(() => ISLANDS.filter((i) => isVisited(i.id)).length, [isVisited]);
  const percent = Math.round((visitedCount / ISLANDS.length) * 100);

  const list = useMemo(() => {
    const keyword = query.trim();
    return ISLANDS.filter((island) => {
      if (region && island.region !== region) return false;
      if (keyword && !island.name.includes(keyword) && !island.region.includes(keyword)) {
        return false;
      }
      return true;
    });
  }, [query, region]);

  /** 지도 탭 — 권역 칩 아래 가로 섬 목록 (지도 위 레이아웃) */
  const mapIslandList = useMemo(() => {
    return ISLANDS.filter((island) => !region || island.region === region);
  }, [region]);

  const selectedIsland = selectedId ? (ISLAND_MAP[selectedId] ?? null) : null;

  return (
    <div className="m-screen m-isl">
      {/* 방문 진행률 — 비로그인이면 기록이 없으니 로그인을 권한다 */}
      {isLoggedIn ? (
        <section className="m-card m-isl__progress">
          <div className="m-isl__progress-top">
            <b>섬 탐험 진행률</b>
            <span>
              {visitedCount} / {ISLANDS.length}곳
            </span>
          </div>
          <div className="m-passport__bar">
            <span style={{ width: `${percent}%` }} />
          </div>
        </section>
      ) : (
        <section className="m-card m-isl__progress m-isl__progress--guest">
          <div className="m-isl__progress-top">
            <b>섬 탐험 진행률</b>
          </div>
          <p>로그인하면 내가 다녀온 섬이 여기에 기록돼요</p>
          <button type="button" className="m-btn m-btn--primary" onClick={() => openAuth("login")}>
            로그인
          </button>
        </section>
      )}

      <div className="m-seg" role="tablist" aria-label="보기 방식">
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={`m-seg__btn${view === "list" ? " is-on" : ""}`}
          onClick={() => setView("list")}
        >
          목록
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "map"}
          className={`m-seg__btn${view === "map" ? " is-on" : ""}`}
          onClick={() => setView("map")}
        >
          지도
        </button>
      </div>

      <div className="m-chips" role="tablist" aria-label="권역">
        <button
          type="button"
          role="tab"
          aria-selected={region === null}
          className={`m-chip${region === null ? " is-on" : ""}`}
          onClick={() => changeRegion(null)}
        >
          전체
        </button>
        {ISLAND_REGIONS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={region === name}
            className={`m-chip${region === name ? " is-on" : ""}`}
            onClick={() => changeRegion(name)}
          >
            {name.replace("권역", "")}
          </button>
        ))}
      </div>

      {view === "map" ? (
        <>
          <div className="m-chips m-chips--islands" role="listbox" aria-label="섬 선택">
            {mapIslandList.map((island) => (
              <button
                key={island.id}
                type="button"
                role="option"
                aria-selected={selectedId === island.id}
                className={`m-chip${selectedId === island.id ? " is-on" : ""}`}
                onClick={() => selectIsland(island.id, false)}
              >
                {island.name}
              </button>
            ))}
          </div>

          <MobileIslandMap
            selectedId={selectedId}
            activeRegion={region}
            focusNonce={focusNonce}
            onSelect={(id) => selectIsland(id, false)}
            onBackgroundClick={() => changeRegion(null)}
          />
          {selectedIsland && !detailOpen && (
            <button type="button" className="m-btn m-btn--primary" onClick={() => setDetailOpen(true)}>
              {selectedIsland.name} 섬 정보 보기
            </button>
          )}
          {selectedId && <IslandWeatherPanel islandId={selectedId} />}
        </>
      ) : (
        <>
          <label className="m-search">
            <span className="m-search__icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.4" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              className="m-search__input"
              placeholder="섬 이름으로 찾기"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="섬 검색"
            />
          </label>

          <p className="m-isl__count">
            {list.length}곳
            {region ? ` · ${region}` : ""}
          </p>

          {list.length === 0 ? (
            <p className="m-empty">찾는 섬이 없어요. 다른 이름으로 검색해보세요.</p>
          ) : (
            <ul className="m-isl__list">
              {list.map((island) => {
                const visited = isVisited(island.id);
                return (
                  <li key={island.id}>
                    <button
                      type="button"
                      className="m-card m-isl__item"
                      onClick={() => selectIsland(island.id, true)}
                    >
                      <span className="m-isl__item-main">
                        <span className="m-isl__item-top">
                          <b>{island.name}</b>
                          <em className={`m-isl__flag${visited ? " is-done" : ""}`}>
                            {visited ? "방문" : "미방문"}
                          </em>
                        </span>
                        <span className="m-isl__item-region">{island.region}</span>
                        <span className="m-isl__item-ferry">
                          🚢 {island.ferryRoute} · {island.travelTime}
                        </span>
                      </span>
                      <ChevronRightIcon size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <MobileIslandSheet island={detailOpen ? selectedIsland : null} onClose={closeDetail} />
    </div>
  );
}
