import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMinPrice,
  getProducts,
  islandFilterColorName,
  RESERVATION_ISLAND_FILTER,
} from "@/api/reservation";
import { getIslandColors } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import type { CategoryKey, Product } from "@/types/reservation";

const CATEGORIES: { key: CategoryKey | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "water", label: "수상레저" },
  { key: "land", label: "육상레저" },
  { key: "exp", label: "체험" },
  { key: "heal", label: "힐링" },
];

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  water: "수상레저",
  land: "육상레저",
  exp: "체험",
  heal: "힐링",
};

type SortKey = "pop" | "low" | "high";
type OpenMenu = "island" | "sort" | null;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "pop", label: "인기순" },
  { key: "low", label: "가격 낮은순" },
  { key: "high", label: "가격 높은순" },
];

export function ReservationList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory =
    categoryParam && categoryParam !== "all" && categoryParam in CATEGORY_LABEL
      ? (categoryParam as CategoryKey)
      : "all";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryKey | "all">(initialCategory);
  const [islandId, setIslandId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("pop");
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextCategory =
      categoryParam && categoryParam !== "all" && categoryParam in CATEGORY_LABEL
        ? (categoryParam as CategoryKey)
        : "all";
    setCategory(nextCategory);
  }, [categoryParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProducts({
      category: category === "all" ? undefined : category,
      islandId: islandId ?? undefined,
      sort,
    })
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "상품을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, islandId, sort]);

  const [catalogIslandIds, setCatalogIslandIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getProducts().then((list) => {
      if (cancelled) return;
      setCatalogIslandIds(new Set(list.map((p) => p.islandId)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!filterRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const selectedIslandName = islandId
    ? RESERVATION_ISLAND_FILTER.find((i) => i.id === islandId)?.name
    : null;
  const sortLabel = SORT_OPTIONS.find((s) => s.key === sort)?.label ?? "인기순";

  return (
    <main className="rv-page">
      <div className="rv-banner-band">
        <section className="rv-banner" aria-label="레저 예약">
          <img
            className="rv-banner-img"
            src="/_Pngtree_progressive_leisure_jet_boat_aquatics_16900908.jpg"
            alt=""
            width={3504}
            height={805}
          />
          <div className="rv-banner-overlay" aria-hidden="true" />
          <div className={`${CONTAINER} rv-banner-inner`}>
            <span className="rv-banner-eyebrow">LEISURE RESERVATION</span>
            <h1>레저 예약</h1>
            <p>원하는 섬과 종목을 골라 레저스포츠를 예약하세요</p>
          </div>
        </section>
      </div>

      <div className="rv-body">
      <div className="rv-filter-line" ref={filterRef}>
        <div className="rv-chips" role="tablist" aria-label="카테고리">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={category === c.key}
              className={`rv-chip${category === c.key ? " is-active" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="rv-filter-right">
          <div className="rv-dd">
            <button
              type="button"
              className={`rv-dd-trigger${islandId ? " is-active" : ""}`}
              aria-expanded={openMenu === "island"}
              onClick={() => setOpenMenu((m) => (m === "island" ? null : "island"))}
            >
              {selectedIslandName ?? "섬 선택"} ▾
            </button>
            {openMenu === "island" && (
              <div className="rv-dd-panel rv-dd-panel--island" role="listbox">
                <button
                  type="button"
                  className={`rv-dd-item${!islandId ? " is-selected" : ""}`}
                  onClick={() => {
                    setIslandId(null);
                    setOpenMenu(null);
                  }}
                >
                  섬 전체
                </button>
                <div className="rv-dd-divider" />
                {RESERVATION_ISLAND_FILTER.map((island) => {
                  const active = catalogIslandIds.has(island.id);
                  const color = getIslandColors(islandFilterColorName(island.name)).accent;
                  return (
                    <button
                      key={island.id}
                      type="button"
                      className={`rv-dd-item${islandId === island.id ? " is-selected" : ""}`}
                      disabled={!active}
                      onClick={() => {
                        if (!active) return;
                        setIslandId(island.id);
                        setOpenMenu(null);
                      }}
                    >
                      {active ? (
                        <span className="rv-dd-dot" style={{ background: color }} aria-hidden />
                      ) : (
                        <span className="rv-dd-dot" style={{ background: "#CBD5E1" }} aria-hidden />
                      )}
                      {island.name}
                      {!active && <span className="rv-dd-badge">준비중</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rv-dd">
            <button
              type="button"
              className="rv-dd-trigger is-active"
              aria-expanded={openMenu === "sort"}
              onClick={() => setOpenMenu((m) => (m === "sort" ? null : "sort"))}
            >
              {sortLabel} ▾
            </button>
            {openMenu === "sort" && (
              <div className="rv-dd-panel" role="listbox">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`rv-dd-item${sort === opt.key ? " is-selected" : ""}`}
                    onClick={() => {
                      setSort(opt.key);
                      setOpenMenu(null);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="rv-loading">상품을 불러오는 중…</p>
      ) : error ? (
        <p className="rv-error">{error}</p>
      ) : (
        <>
          <p className="rv-count">예약 가능한 상품 {products.length}개</p>
          {products.length === 0 ? (
            <div className="rv-empty">선택한 조건에 예약 가능한 상품이 없습니다.</div>
          ) : (
            <div className="rv-grid">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="rv-card"
                  onClick={() => navigate(`/reservation/${product.id}`)}
                >
                  <div className="rv-card-photo">
                    {product.photo ? (
                      <img src={product.photo} alt="" />
                    ) : (
                      <span className="rv-card-photo-fallback">준비중</span>
                    )}
                    <span className="rv-card-badge">{CATEGORY_LABEL[product.category]}</span>
                  </div>
                  <div className="rv-card-body">
                    <span className="rv-card-island">
                      <span
                        className="rv-dd-dot"
                        style={{ background: product.regionColor }}
                        aria-hidden
                      />
                      {product.islandName}
                    </span>
                    <h2 className="rv-card-title">{product.name}</h2>
                    <p className="rv-card-meta">
                      {product.diff} · {product.season}
                    </p>
                    <div className="rv-card-footer">
                      <span className="rv-card-price">
                        1인 {getMinPrice(product).toLocaleString()}원~
                      </span>
                      <span className="rv-card-cta">예약하기 ›</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </main>
  );
}
