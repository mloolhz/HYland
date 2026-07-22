import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SPORTS_CATEGORIES,
  SPORTS_DATA,
  type CategoryKey,
  type Sport,
  type SportIsland,
} from "@/data/sports";
import { ISLAND_MAP } from "@/lib/island-data";
import {
  resolveSportIslandAccent,
  resolveSportIslandRegion,
} from "@/lib/sports-region";

const HERO_IMAGE = "/_Pngtree_progressive_leisure_jet_boat_aquatics_16900908.jpg";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sp-meta-row">
      <span className="sp-meta-label">{label}</span>
      <span className="sp-meta-value">{value}</span>
    </div>
  );
}

function SportPhoto({ sport }: { sport: Sport }) {
  const src = sport.photo?.trim();
  if (src) {
    return (
      <img
        className="sp-photo"
        src={src}
        alt={`${sport.name} 대표 이미지`}
        width={640}
        height={260}
      />
    );
  }

  return (
    <div className="sp-photo sp-photo--placeholder" aria-label={`${sport.name} 대표 이미지 자리`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" stroke="#64748B" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="1.6" fill="#64748B" />
        <path d="M3 16l5-4 3 2 4-5 6 7" stroke="#64748B" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span>《{sport.name}》 대표 이미지 (사진 삽입 영역)</span>
    </div>
  );
}

export function Sports() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryKey>("water");
  const [selectedId, setSelectedId] = useState<string>(SPORTS_DATA.water[0].id);

  const categoryLabel = SPORTS_CATEGORIES.find((c) => c.key === category)?.label ?? "";
  const sports = SPORTS_DATA[category];
  const selected = useMemo(
    () => sports.find((s) => s.id === selectedId) ?? sports[0],
    [sports, selectedId],
  );

  const selectCategory = (key: CategoryKey) => {
    setCategory(key);
    setSelectedId(SPORTS_DATA[key][0].id);
  };

  const openIsland = useCallback(
    (island: SportIsland) => {
      if (island.id && ISLAND_MAP[island.id]) {
        navigate("/islands", { state: { islandId: island.id } });
        return;
      }
      console.warn("[sports] IslandExplorer에 없는 섬 — 목록으로 이동:", island.n, island.id);
      navigate("/islands");
    },
    [navigate],
  );

  return (
    <main className="sp-page">
      <section
        className="sp-hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-label="레저스포츠"
      >
        <div className="sp-hero-overlay" aria-hidden="true" />
        <h1 className="sp-hero-title">레저스포츠</h1>
      </section>

      <div className="sp-tabs" role="tablist" aria-label="레저 카테고리">
        {SPORTS_CATEGORIES.map((item) => {
          const active = category === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              className={`sp-tab${active ? " is-active" : ""}`}
              aria-selected={active}
              onClick={() => selectCategory(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="sp-cat-title-wrap">
        <h2 className="sp-cat-title">{categoryLabel}</h2>
      </div>

      <div className="container sp-content">
        <div className="sp-sport-grid" role="listbox" aria-label={`${categoryLabel} 종목`}>
          {sports.map((sport) => {
            const active = selected.id === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                role="option"
                className={`sp-sport-btn${active ? " is-active" : ""}`}
                aria-selected={active}
                onClick={() => setSelectedId(sport.id)}
              >
                {sport.name}
              </button>
            );
          })}
        </div>

        <section className="sp-detail" aria-label={`${selected.name} 상세`}>
          <SportPhoto sport={selected} />
          <div className="sp-detail-info">
            <p className="sp-detail-cat">{categoryLabel}</p>
            <h3 className="sp-detail-name">{selected.name}</h3>
            <p className="sp-detail-desc">{selected.desc}</p>
            <div className="sp-meta" aria-label="종목 정보">
              <MetaRow label="난이도" value={selected.diff} />
              <MetaRow label="가격" value={selected.price} />
              <MetaRow label="가능 시기" value={selected.season} />
            </div>
            <span className={`sp-badge${selected.pay ? " sp-badge--pay" : ""}`}>
              {selected.pay ? "예약/시설 이용" : "자유 활동"}
            </span>
          </div>
        </section>

        <section className="sp-section" aria-labelledby="sp-islands-heading">
          <h3 id="sp-islands-heading" className="sp-section-title">
            이용 가능한 섬 ({selected.islands.length})
          </h3>
          <ul className="sp-island-cards">
            {selected.islands.map((island) => (
              <li key={`${selected.id}-${island.n}`}>
                <button
                  type="button"
                  className="sp-island-card"
                  onClick={() => openIsland(island)}
                >
                  <span
                    className="sp-island-bar"
                    style={{ background: resolveSportIslandAccent(island.n) }}
                    aria-hidden="true"
                  />
                  <span className="sp-island-text">
                    <span className="sp-island-name">{island.n}</span>
                    <span className="sp-island-region">{resolveSportIslandRegion(island.n)}</span>
                  </span>
                  <span className="sp-island-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="sp-section" aria-labelledby="sp-booking-heading">
          <h3 id="sp-booking-heading" className="sp-section-title">
            예약
          </h3>
          {selected.pay ? (
            /* TODO: 예약 UI */
            <div className="sp-booking-box">
              <strong>예약 기능 준비 중</strong>
              {" · "}
              강습·시설 이용은 각 섬 상세 페이지에서 예약할 수 있습니다.
            </div>
          ) : (
            <div className="sp-booking-box sp-booking-box--free">
              <strong>별도 예약이 필요 없는 자유 활동입니다.</strong>
              {" · "}
              각 섬의 코스·물때 정보를 확인하고 자유롭게 즐기세요.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
