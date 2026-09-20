import { useMemo, useState } from "react";
import type { SafetyFacilityType } from "@/data/safety-facilities";
import {
  FACILITY_LABELS,
  SAFE_KOREA_URL,
  buildSafetyGroups,
  telHref,
} from "@/lib/safety-groups";

const FACILITY_TYPES = Object.keys(FACILITY_LABELS) as SafetyFacilityType[];

type TypeFilter = SafetyFacilityType | "all";

/**
 * 모바일 섬 안전정보
 *
 * 데스크톱은 14개 섬의 표를 한 페이지에 다 늘어놓는다. 폰에서는 그걸 끝까지
 * 내려야 해서, 위에 「섬 / 시설 유형」 드롭다운 두 개를 두고 고른 조건의 시설만 보여 준다.
 */
export function MobileSafety() {
  const groups = useMemo(buildSafetyGroups, []);
  const [islandId, setIslandId] = useState<string | null>(() => groups[0]?.id ?? null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const selected = groups.find((group) => group.id === islandId) ?? null;

  /** 고른 섬에 실제로 있는 시설 유형과 개수 (드롭다운 항목) */
  const typeCounts = useMemo(() => {
    const counts = new Map<SafetyFacilityType, number>();
    for (const facility of selected?.facilities ?? []) {
      counts.set(facility.type, (counts.get(facility.type) ?? 0) + 1);
    }
    return counts;
  }, [selected]);

  // 섬을 바꿨을 때 그 섬에 없는 유형이 골라져 있으면 "전체"로 본다
  const activeType: TypeFilter =
    typeFilter !== "all" && typeCounts.has(typeFilter) ? typeFilter : "all";

  const visible = useMemo(
    () =>
      (selected?.facilities ?? []).filter(
        (facility) => activeType === "all" || facility.type === activeType,
      ),
    [selected, activeType],
  );

  return (
    <div className="m-screen m-sf">
      <div className="m-sf__filters">
        <label className="m-sf__field">
          <span className="m-sf__label">섬</span>
          <span className="m-sf__select">
            <select value={islandId ?? ""} onChange={(e) => setIslandId(e.target.value)}>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="m-sf__field">
          <span className="m-sf__label">안전 시설</span>
          <span className="m-sf__select">
            <select
              value={activeType}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              disabled={typeCounts.size === 0}
            >
              <option value="all">전체 ({selected?.facilities.length ?? 0})</option>
              {FACILITY_TYPES.filter((type) => typeCounts.has(type)).map((type) => (
                <option key={type} value={type}>
                  {FACILITY_LABELS[type]} ({typeCounts.get(type)})
                </option>
              ))}
            </select>
          </span>
        </label>
      </div>

      <section className="m-card m-sf__result" aria-live="polite">
        {selected ? (
          <>
            <header className="m-sf__head">
              <div>
                <p>{selected.area}</p>
                <h2>
                  {selected.name}
                  {activeType !== "all" ? ` · ${FACILITY_LABELS[activeType]}` : ""}
                </h2>
              </div>
              <span>{visible.length}곳</span>
            </header>

            {visible.length > 0 ? (
              <ul className="m-sf__list">
                {visible.map((facility, index) => (
                  <li key={`${facility.type}-${facility.name}-${index}`} className="m-sf__item">
                    <span className="m-sf__type">{FACILITY_LABELS[facility.type]}</span>
                    <b className="m-sf__name">{facility.name}</b>
                    <span className="m-sf__addr">{facility.address}</span>
                    {facility.note ? <span className="m-sf__note">{facility.note}</span> : null}
                    <a className="m-sf__tel" href={telHref(facility.phone!)}>
                      {facility.phone}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-sf__empty">표시할 안전시설 정보가 없습니다.</p>
            )}
          </>
        ) : (
          <p className="m-sf__empty">섬을 선택해 주세요.</p>
        )}
      </section>

      <a className="m-sf__map-link" href={SAFE_KOREA_URL} target="_blank" rel="noopener noreferrer">
        국민안전24 안전지도에서 위치 확인하기
        <span aria-hidden="true">↗</span>
      </a>

      <section className="m-sf__emergency" aria-labelledby="m-sf-emergency-title">
        <h2 id="m-sf-emergency-title">긴급 상황 연락처</h2>
        <div className="m-sf__emergency-links">
          <a href="tel:119">
            <span>구급·소방</span>
            <strong>119</strong>
          </a>
          <a href="tel:112">
            <span>경찰</span>
            <strong>112</strong>
          </a>
          <a href="tel:122">
            <span>해양사고</span>
            <strong>122</strong>
          </a>
        </div>
      </section>
    </div>
  );
}
