import { useState } from "react";
import { Link } from "react-router-dom";
import type { LeisureFacility } from "@/api/leisure";
import { FACILITY_PLACEHOLDER } from "@/lib/facility-photo";
import { resolveSportIslandAccent } from "@/lib/sports-region";

/** 한 번에 보여줄 카드 수 — 넘치면 "더 보기"로 펼친다 */
const PAGE_SIZE = 8;

function FacilityPhoto({ facility }: { facility: LeisureFacility }) {
  const [failed, setFailed] = useState(false);
  /** 사진이 없거나 로딩에 실패하면 자리표시로 떨어진다 */
  const placeholder = !facility.photo || failed;

  return (
    <img
      className={`fc-photo${placeholder ? " fc-photo--placeholder" : ""}`}
      src={placeholder ? FACILITY_PLACEHOLDER : (facility.photo ?? "")}
      alt={placeholder ? "" : `${facility.name} 사진`}
      aria-hidden={placeholder || undefined}
      loading="lazy"
      /* 자리표시까지 실패하면 되돌릴 곳이 없으므로 실제 사진일 때만 감시한다 */
      onError={placeholder ? undefined : () => setFailed(true)}
    />
  );
}

function FacilityCard({ facility }: { facility: LeisureFacility }) {
  return (
    <li>
      <Link className="fc-card" to={`/sports/facility/${facility.id}`}>
        <FacilityPhoto facility={facility} />
        <div className="fc-body">
          <p className="fc-name">{facility.name}</p>
          <p className="fc-island">
            <span
              className="fc-island-dot"
              style={{ background: resolveSportIslandAccent(facility.islandName) }}
              aria-hidden="true"
            />
            {facility.islandName}
          </p>
          {facility.address && (
            <p className="fc-line">
              <span className="fc-icon" aria-hidden="true">
                ◎
              </span>
              {facility.address}
            </p>
          )}
          {facility.tel && (
            <p className="fc-line">
              <span className="fc-icon" aria-hidden="true">
                ✆
              </span>
              {facility.tel}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

/**
 * 종목(활동)에 해당하는 실제 레저스포츠 시설 목록.
 * 데이터는 Sports 페이지가 한 번만 불러와 내려준다 (섬 목록과 같은 응답을 쓴다).
 */
export function FacilityGrid({
  sportName,
  facilities,
  loading,
  error,
}: {
  sportName: string;
  facilities: LeisureFacility[];
  loading: boolean;
  error: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <section className="sp-section" aria-labelledby="sp-facilities-heading">
        <h3 id="sp-facilities-heading" className="sp-section-title">
          {sportName} 시설
        </h3>
        <p className="fc-state">불러오는 중…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="sp-section" aria-labelledby="sp-facilities-heading">
        <h3 id="sp-facilities-heading" className="sp-section-title">
          {sportName} 시설
        </h3>
        <p className="fc-state fc-state--error">{error}</p>
      </section>
    );
  }

  if (facilities.length === 0) return null;

  const shown = expanded ? facilities : facilities.slice(0, PAGE_SIZE);
  const rest = facilities.length - shown.length;

  return (
    <section className="sp-section" aria-labelledby="sp-facilities-heading">
      <h3 id="sp-facilities-heading" className="sp-section-title">
        {sportName} 시설 ({facilities.length})
      </h3>
      <ul className="fc-grid">
        {shown.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </ul>
      {rest > 0 && (
        <button type="button" className="fc-more" onClick={() => setExpanded(true)}>
          {rest}곳 더 보기
        </button>
      )}
    </section>
  );
}
