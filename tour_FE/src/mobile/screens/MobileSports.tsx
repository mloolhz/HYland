import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SPORTS_CATEGORIES,
  SPORTS_DATA,
  type CategoryKey,
  type Sport,
} from "@/data/sports";
import { ISLAND_MAP } from "@/lib/island-data";
import { resolveSportIslandAccent, resolveSportIslandRegion } from "@/lib/sports-region";
import {
  BOOKING_EMPTY_TEXT,
  BOOKING_LEAD_TEXT,
  BOOKING_SECTION_TITLE,
  sourceButtonLabel,
} from "@/lib/sport-booking-resolve";
import { fetchFacilitiesByActivity, islandsOf, type LeisureFacility } from "@/api/leisure";
import { FacilityGrid } from "@/components/sports/FacilityGrid";
import { SportCommunityLink } from "@/components/sports/SportCommunityLink";
import { ChevronLeftIcon, ChevronRightIcon } from "../MobileIcons";

const CATEGORY_EMOJI: Record<CategoryKey, string> = {
  water: "⛵",
  land: "🥾",
  exp: "🎯",
  heal: "🌿",
};

function readCategory(value: string | null): CategoryKey {
  return value && value in SPORTS_DATA ? (value as CategoryKey) : "water";
}

function SportDetail({
  sport,
  category,
  onBack,
}: {
  sport: Sport;
  category: CategoryKey;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<LeisureFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchFacilitiesByActivity(sport.name, ctrl.signal)
      .then((rows) => {
        setFacilities(rows);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        console.error("[sports] 시설 목록 조회 실패:", err);
        setFacilities([]);
        setError("시설 정보를 불러오지 못했어요.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [sport.name]);

  const islands = useMemo(() => islandsOf(facilities), [facilities]);
  const categoryLabel = SPORTS_CATEGORIES.find((c) => c.key === category)?.label ?? "";

  const openIsland = (id: string, name: string) => {
    if (ISLAND_MAP[id]) {
      navigate(`/islands?island=${encodeURIComponent(id)}`);
      return;
    }
    console.warn("[sports] IslandExplorer에 없는 섬 — 목록으로 이동:", name, id);
    navigate("/islands");
  };

  return (
    <div className="m-sport-detail">
      <button type="button" className="m-backlink" onClick={onBack}>
        <ChevronLeftIcon size={18} />
        {categoryLabel} 목록
      </button>

      <div className="m-sport-detail__hero">
        {sport.photo?.trim() ? (
          <img src={sport.photo} alt="" />
        ) : (
          <span className="m-sport-detail__emoji" aria-hidden="true">
            {CATEGORY_EMOJI[category]}
          </span>
        )}
        <span className="m-rail__tag">{sport.diff}</span>
      </div>

      <h2 className="m-sport-detail__name">{sport.name}</h2>
      <p className="m-sport-detail__desc">{sport.desc}</p>

      <dl className="m-sport-detail__meta">
        <div>
          <dt>난이도</dt>
          <dd>{sport.diff}</dd>
        </div>
        <div>
          <dt>이용료</dt>
          <dd>{sport.price}</dd>
        </div>
        <div>
          <dt>시즌</dt>
          <dd>{sport.season}</dd>
        </div>
      </dl>

      <div className="m-sport-detail__actions">
        <SportCommunityLink sportName={sport.name} />
      </div>

      {islands.length > 0 && (
        <section className="m-sec">
          <div className="m-sec__head">
            <h2>이용 가능한 섬 {islands.length}곳</h2>
          </div>
          <ul className="m-isl__list">
            {islands.map((island) => (
              <li key={island.id}>
                <button
                  type="button"
                  className="m-card m-isl__item"
                  onClick={() => openIsland(island.id, island.name)}
                >
                  <span
                    className="m-isl__accent"
                    style={{ background: resolveSportIslandAccent(island.name) }}
                    aria-hidden="true"
                  />
                  <span className="m-isl__item-main">
                    <span className="m-isl__item-top">
                      <b>{island.name}</b>
                    </span>
                    <span className="m-isl__item-region">
                      {resolveSportIslandRegion(island.name)}
                    </span>
                  </span>
                  <ChevronRightIcon size={18} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <FacilityGrid
        sportName={sport.name}
        facilities={facilities}
        loading={loading}
        error={error}
      />

      <section className="m-sec">
        <div className="m-sec__head">
          <h2>{BOOKING_SECTION_TITLE}</h2>
        </div>
        {sport.sources.length > 0 ? (
          <div className="m-card m-booking">
            <p className="m-booking__lead">{BOOKING_LEAD_TEXT}</p>
            {sport.sources.map((source) =>
              source.url ? (
                <a
                  key={`${source.provider}-${source.url}`}
                  className="m-booking__btn"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <b>{sourceButtonLabel(source, sport.reservationType)}</b>
                    {source.tel && <em>전화 문의: {source.tel}</em>}
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null,
            )}
            {sport.reservationType === "reservable" && (
              <p className="m-booking__note">
                외부 예약처로 이동합니다. 결제·예약은 해당 사이트에서 진행됩니다.
              </p>
            )}
          </div>
        ) : (
          <div className="m-card m-booking">
            <p className="m-booking__lead">{BOOKING_EMPTY_TEXT}</p>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * 모바일 레저스포츠
 *
 * 데스크톱은 종목 이름 버튼을 줄줄이 늘어놓고 그 아래에 상세를 붙인다.
 * 폰에서는 사진이 있는 종목 카드를 2열로 깔고, 고르면 상세 화면으로 넘어간다.
 * 고른 종목은 ?sport= 로 남겨 뒤로가기와 링크 공유가 그대로 된다.
 */
export function MobileSports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = readCategory(searchParams.get("category"));
  const sportParam = searchParams.get("sport");

  const selected = useMemo(() => {
    if (!sportParam) return null;
    return SPORTS_DATA[category].find((s) => s.id === sportParam) ?? null;
  }, [category, sportParam]);

  const setParams = useCallback(
    (next: { category?: CategoryKey; sport?: string | null }) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (next.category) params.set("category", next.category);
        if (next.sport === null) params.delete("sport");
        else if (next.sport) params.set("sport", next.sport);
        return params;
      });
    },
    [setSearchParams],
  );

  if (selected) {
    return (
      <div className="m-screen">
        <SportDetail
          sport={selected}
          category={category}
          onBack={() => setParams({ sport: null })}
        />
      </div>
    );
  }

  const list = SPORTS_DATA[category];

  return (
    <div className="m-screen">
      <div className="m-chips" role="tablist" aria-label="레저 카테고리">
        {SPORTS_CATEGORIES.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={category === item.key}
            className={`m-chip${category === item.key ? " is-on" : ""}`}
            onClick={() => setParams({ category: item.key, sport: null })}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="m-isl__count">{list.length}개 종목</p>

      <ul className="m-tiles">
        {list.map((sport) => (
          <li key={sport.id}>
            <button
              type="button"
              className="m-tile"
              onClick={() => setParams({ sport: sport.id })}
            >
              <span className="m-tile__thumb">
                {sport.photo?.trim() ? (
                  <img src={sport.photo} alt="" loading="lazy" />
                ) : (
                  <span className="m-tile__emoji" aria-hidden="true">
                    {CATEGORY_EMOJI[category]}
                  </span>
                )}
                <span className="m-rail__tag">{sport.diff}</span>
              </span>
              <b className="m-tile__title">{sport.name}</b>
              <span className="m-tile__sub">
                📍 {sport.islands[0]?.n ?? "인천 섬"}
                {sport.islands.length > 1 ? ` 외 ${sport.islands.length - 1}곳` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
