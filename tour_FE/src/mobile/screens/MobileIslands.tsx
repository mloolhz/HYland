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
import { IslandDetailPanel } from "@/components/island/IslandDetailPanel";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";
import { IslandWeatherPanel } from "@/components/island/IslandWeatherPanel";
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
 * 데스크톱은 큰 SVG 지도 옆에 상세 패널을 붙인 2단이다. 폰에서 168개 섬을
 * 지도에서 손가락으로 집는 건 어려워서, 검색·권역 칩이 붙은 목록을 기본으로
 * 두고 지도는 한 번 탭해서 여는 다른 보기로 뺐다.
 */
export function MobileIslands() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useSession();
  const { isVisited } = useVisitedIslands();
  const { openAuth } = useAuthSheet();

  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    readIslandId(searchParams.get("island")),
  );
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
    (id: string) => {
      const islandRegion = (ISLAND_MAP[id]?.region as IslandRegionName) ?? null;
      setSelectedId(id);
      setRegion(islandRegion);
      syncParams({ island: id, region: islandRegion });
    },
    [syncParams],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    syncParams({ island: null });
  }, [syncParams]);

  const changeRegion = useCallback(
    (next: IslandRegionName | null) => {
      setRegion(next);
      setSelectedId(null);
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
          <p className="m-isl__hint">지도에서 섬을 누르면 상세 정보가 열려요</p>
          <div className="m-card m-isl__map">
            <IslandExplorerMap
              selectedId={selectedId}
              activeRegion={region}
              onSelect={selectIsland}
              onBackgroundClick={() => changeRegion(null)}
            />
          </div>
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
                      onClick={() => selectIsland(island.id)}
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

      <IslandDetailPanel island={selectedIsland} onClose={closeDetail} />
    </div>
  );
}
