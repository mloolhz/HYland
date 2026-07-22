import { useEffect, useMemo, useState } from "react";
import { CategoryIcon, SportIcon } from "@/components/sports/SportIcons";
import {
  getInfoCtaLabel,
  isFreeSport,
  SPORTS_CATEGORIES,
  SPORTS_DATA,
  type CategoryKey,
  type Sport,
} from "@/data/sports";
import { resolveSportIslandAccent } from "@/lib/sports-region";

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

function MetaIcon({ kind }: { kind: "price" | "season" | "diff" }) {
  if (kind === "price") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v10M9.5 9.5c.8-1 2-1.5 2.5-1.5s1.7.4 1.7 1.5-1 1.5-2.2 1.8S9.5 13 9.5 14.5 11 16 12.5 16s2.2-.6 2.5-1.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "season") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="0" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18l5-8 3 4 3-5 5 9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function SportDetailPanel({
  sport,
  category,
}: {
  sport: Sport | null;
  category: CategoryKey;
}) {
  if (!sport) {
    return (
      <div className="sp-detail sp-detail--empty" role="status">
        종목 버튼을 누르면 상세 정보가 표시됩니다
      </div>
    );
  }

  const free = isFreeSport(sport.price);
  const handleCta = () => {
    // TODO: 예약 라우트 연결
    console.log(free ? "info-cta" : "booking-cta", sport.id);
  };

  return (
    <article className="sp-detail" aria-label={`${sport.name} 상세`}>
      <header className="sp-detail-head">
        <span className="sp-detail-icon">
          <SportIcon name={sport.icon} size={24} />
        </span>
        <div className="sp-detail-titles">
          <h2 className="sp-detail-name">{sport.name}</h2>
          <p className="sp-detail-sub">
            {sport.diff} · {sport.season}
          </p>
        </div>
      </header>

      <p className="sp-detail-desc">{sport.desc}</p>

      <p className="sp-detail-islands-label">이용 가능한 섬 ({sport.islands.length})</p>
      <ul className="sp-island-tags">
        {sport.islands.map((island) => (
          <li key={island.n} className="sp-island-tag">
            <span
              className="sp-island-dot"
              style={{ background: resolveSportIslandAccent(island.n) }}
              aria-hidden="true"
            />
            {island.n}
          </li>
        ))}
      </ul>

      <div className="sp-detail-meta" aria-label="종목 정보">
        <span className="sp-meta-item">
          <MetaIcon kind="price" />
          {sport.price}
        </span>
        <span className="sp-meta-item">
          <MetaIcon kind="season" />
          {sport.season}
        </span>
        <span className="sp-meta-item">
          <MetaIcon kind="diff" />
          {sport.diff}
        </span>
      </div>

      <div className="sp-detail-actions">
        <button type="button" className="sp-cta" onClick={handleCta}>
          {free ? getInfoCtaLabel(category) : "예약하기"}
        </button>
      </div>
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
              <CategoryIcon category={item.key} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sp-body container">
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

        <SportDetailPanel sport={selected} category={category} />
      </div>
    </main>
  );
}
