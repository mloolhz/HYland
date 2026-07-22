import { useEffect, useMemo, useState } from "react";
import {
  SPORTS_CATEGORIES,
  SPORTS_DATA,
  type CategoryKey,
  type Sport,
} from "@/data/sports";
import {
  resolveSportIslandAccent,
  resolveSportIslandRegion,
} from "@/lib/sports-region";

const HERO_IMAGE = "/_Pngtree_progressive_leisure_jet_boat_aquatics_16900908.jpg";

function useSportsColumns() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setCols(mq.matches ? 2 : 4);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return cols;
}

function PhotoPlaceholder({ name }: { name: string }) {
  return (
    <div className="sp-photo sp-photo--placeholder" aria-label={`${name} 대표 이미지 자리`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" stroke="#64748B" strokeWidth="1.6" />
        <circle cx="9" cy="10" r="1.6" fill="#64748B" />
        <path d="M3 16l5-4 3 2 4-5 6 7" stroke="#64748B" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span>《{name}》 대표 이미지</span>
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
        width={960}
        height={180}
      />
    );
  }
  return <PhotoPlaceholder name={sport.name} />;
}

function handleIslandClick(islandLabel: string) {
  // TODO: 섬 상세 라우트 연결
  console.log("island-detail-todo", islandLabel);
}

function SportDetailPanel({ sport }: { sport: Sport | null }) {
  if (!sport) {
    return (
      <div className="sp-detail sp-detail--empty" role="status">
        종목 버튼을 누르면 상세 정보가 표시됩니다
      </div>
    );
  }

  return (
    <article className="sp-detail" aria-label={`${sport.name} 상세`}>
      <header className="sp-detail-head">
        <h2 className="sp-detail-name">{sport.name}</h2>
        <span className={`sp-badge${sport.pay ? " sp-badge--pay" : ""}`}>
          {sport.pay ? "예약/시설 이용" : "자유 활동"}
        </span>
      </header>

      <p className="sp-detail-desc">{sport.desc}</p>

      <SportPhoto sport={sport} />

      <section className="sp-section" aria-labelledby="sp-islands-heading">
        <h3 id="sp-islands-heading" className="sp-section-title">
          이용 가능한 섬 ({sport.islands.length})
        </h3>
        <ul className="sp-island-cards">
          {sport.islands.map((island) => (
            <li key={island.n}>
              <button
                type="button"
                className="sp-island-card"
                onClick={() => handleIslandClick(island.n)}
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

      {sport.pay && (
        <section className="sp-section" aria-labelledby="sp-booking-heading">
          <h3 id="sp-booking-heading" className="sp-section-title">
            예약
          </h3>
          {/* TODO: 예약 UI */}
          <div className="sp-booking-placeholder">
            예약 기능 준비 중 — 각 섬 상세에서 예약 예정
          </div>
        </section>
      )}

      <p className="sp-guide">
        <strong>이용 안내</strong>
        {sport.pay
          ? " · 강습·시설 이용은 각 섬 상세 페이지에서 예약할 수 있습니다."
          : " · 별도 예약 없이 자유롭게 즐길 수 있는 활동입니다. 각 섬의 코스·물때 정보를 확인하세요."}
      </p>
    </article>
  );
}

export function Sports() {
  const [category, setCategory] = useState<CategoryKey>("water");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cols = useSportsColumns();

  const sports = SPORTS_DATA[category];
  const selected = useMemo(
    () => sports.find((s) => s.id === selectedId) ?? null,
    [sports, selectedId],
  );

  const spacerCount = (cols - (sports.length % cols)) % cols;

  const selectCategory = (key: CategoryKey) => {
    setCategory(key);
    setSelectedId(null);
  };

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

      <div className="container sp-shell">
        <div className="sp-category-grid" role="tablist" aria-label="레저 카테고리">
          {SPORTS_CATEGORIES.map((item) => {
            const active = category === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                className={`sp-category${active ? " is-active" : ""}`}
                aria-selected={active}
                onClick={() => selectCategory(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="sp-bd">
          <div
            className="sp-sport-grid"
            role="listbox"
            aria-label={`${SPORTS_CATEGORIES.find((c) => c.key === category)?.label} 종목`}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {sports.map((sport) => {
              const active = selectedId === sport.id;
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
            {Array.from({ length: spacerCount }, (_, i) => (
              <div key={`spacer-${i}`} className="sp-sport-spacer" aria-hidden="true" />
            ))}
          </div>

          <SportDetailPanel sport={selected} />
        </div>
      </div>
    </main>
  );
}
