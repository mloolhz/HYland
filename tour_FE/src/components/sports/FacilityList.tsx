import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CategoryKey } from "@/data/sports";
import { FACILITIES_BY_CATEGORY, type LeisureFacility } from "@/data/leisure-facilities";

function FacilityPhoto({ facility }: { facility: LeisureFacility }) {
  if (facility.photo) {
    return <img className="fc-card-img" src={facility.photo} alt={facility.name} loading="lazy" />;
  }
  return (
    <div className="fc-card-img fc-card-img--empty" aria-label={`${facility.name} 이미지 준비 중`}>
      <span aria-hidden="true">🏝️</span>
    </div>
  );
}

function FacilityCard({
  facility,
  onIslandClick,
}: {
  facility: LeisureFacility;
  onIslandClick: (islandId: string) => void;
}) {
  return (
    <li className="fc-card">
      <FacilityPhoto facility={facility} />
      <div className="fc-card-body">
        <div className="fc-card-head">
          <h4 className="fc-card-name">{facility.name}</h4>
          <button
            type="button"
            className="fc-card-island"
            onClick={() => onIslandClick(facility.islandId)}
            title={`${facility.islandName} 상세 보기`}
          >
            {facility.islandName}
          </button>
        </div>
        {facility.address && <p className="fc-card-addr">{facility.address}</p>}
        <div className="fc-card-foot">
          {facility.tel && <span className="fc-card-tel">{facility.tel}</span>}
          <span className="fc-card-sources" title={`출처: ${facility.sources.join(", ")}`}>
            {facility.sources.length > 1 ? `출처 ${facility.sources.length}곳` : facility.sources[0]}
          </span>
        </div>
      </div>
    </li>
  );
}

/** 관광공사 API로 수집한 실제 시설 목록 (카테고리별) */
export function FacilityList({ category }: { category: CategoryKey }) {
  const navigate = useNavigate();
  const [islandFilter, setIslandFilter] = useState<string | null>(null);

  const all = FACILITIES_BY_CATEGORY[category] ?? [];

  const islands = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    for (const f of all) {
      const cur = map.get(f.islandId);
      if (cur) cur.count += 1;
      else map.set(f.islandId, { id: f.islandId, name: f.islandName, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [all]);

  const shown = islandFilter ? all.filter((f) => f.islandId === islandFilter) : all;

  if (all.length === 0) return null;

  return (
    <section className="sp-section fc-section" aria-labelledby="fc-heading">
      <div className="fc-head">
        <h3 id="fc-heading" className="sp-section-title">
          이 카테고리의 섬 시설 ({all.length})
        </h3>
        <p className="fc-sub">한국관광공사 관광정보 API에서 수집한 인천 섬 레저 시설이에요.</p>
      </div>

      {islands.length > 1 && (
        <div className="fc-filters" role="group" aria-label="섬 필터">
          <button
            type="button"
            className={`fc-filter${islandFilter === null ? " is-active" : ""}`}
            onClick={() => setIslandFilter(null)}
          >
            전체 {all.length}
          </button>
          {islands.map((i) => (
            <button
              key={i.id}
              type="button"
              className={`fc-filter${islandFilter === i.id ? " is-active" : ""}`}
              onClick={() => setIslandFilter(islandFilter === i.id ? null : i.id)}
            >
              {i.name} {i.count}
            </button>
          ))}
        </div>
      )}

      <ul className="fc-grid">
        {shown.map((f) => (
          <FacilityCard
            key={`${f.id}-${f.name}`}
            facility={f}
            onIslandClick={(islandId) => navigate(`/islands?island=${islandId}`)}
          />
        ))}
      </ul>
    </section>
  );
}
