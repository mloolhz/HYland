import { useState } from "react";
import { Link } from "react-router-dom";
import { SPORTS_CATEGORIES, SPORTS_DATA, type CategoryKey, type Sport } from "@/data/sports";

const CATEGORY_ICONS: Record<CategoryKey, string> = {
  water: "⛵",
  land: "🥾",
  exp: "🎯",
  heal: "🌿",
};

function SportPreviewCard({ sport, category }: { sport: Sport; category: CategoryKey }) {
  const islandLabel =
    sport.islands.length > 1
      ? `${sport.islands[0].n} 외 ${sport.islands.length - 1}곳`
      : sport.islands[0]?.n ?? "인천 섬";

  return (
    <Link className="sp-land-card" to={`/sports?category=${category}`}>
      <div className="sp-land-card__thumb">
        {sport.photo?.trim() ? (
          <img src={sport.photo} alt="" />
        ) : (
          <span className="sp-land-card__placeholder" aria-hidden="true">
            {CATEGORY_ICONS[category]}
          </span>
        )}
        <span className="sp-land-card__diff">{sport.diff}</span>
      </div>
      <div className="sp-land-card__body">
        <h4>{sport.name}</h4>
        <p className="sp-land-card__loc">📍 {islandLabel}</p>
      </div>
    </Link>
  );
}

export function SportsSection() {
  const [category, setCategory] = useState<CategoryKey>("water");
  const previewSports = SPORTS_DATA[category].slice(0, 3);

  return (
    <section className="sec" id="sports">
      <div className="container">
        <div className="sec-head reveal">
          <div className="sec-head-copy">
            <span className="eyebrow">LEISURE SPORTS</span>
            <h2>레저스포츠</h2>
          </div>
          <Link className="more" to={`/sports?category=${category}`}>
            자세히 보기 →
          </Link>
        </div>
        <p className="sec-sub reveal">
          해상·육상·체험·힐링, 네 가지 카테고리로 인천 섬에서 즐길 수 있는 레저를 만나보세요. 종목별 난이도·
          시즌·예약 정보까지 한곳에서 확인할 수 있습니다.
        </p>

        <div className="sp-land-toggle reveal" role="tablist" aria-label="레저 카테고리">
          {SPORTS_CATEGORIES.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={category === item.key}
              className={`sp-land-toggle__btn${category === item.key ? " is-active" : ""}`}
              onClick={() => setCategory(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="sp-land-grid">
          {previewSports.map((sport) => (
            <SportPreviewCard key={`${category}-${sport.id}`} sport={sport} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
