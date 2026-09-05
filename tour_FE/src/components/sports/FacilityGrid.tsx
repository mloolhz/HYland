import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getFacilitiesByActivity,
  type LeisureFacility,
} from "@/data/leisure-facilities";
import { resolveSportIslandAccent } from "@/lib/sports-region";

/** 한 번에 보여줄 카드 수 — 넘치면 "더 보기"로 펼친다 */
const PAGE_SIZE = 8;

function FacilityPhoto({ facility }: { facility: LeisureFacility }) {
  const [failed, setFailed] = useState(false);

  if (!facility.photo || failed) {
    return (
      <div className="fc-photo fc-photo--empty" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="9" cy="10" r="1.6" fill="currentColor" />
          <path
            d="M3 16l5-4 3 2 4-5 6 7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      className="fc-photo"
      src={facility.photo}
      alt={`${facility.name} 사진`}
      loading="lazy"
      onError={() => setFailed(true)}
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

/** 종목(활동)에 해당하는 실제 레저스포츠 시설 목록 */
export function FacilityGrid({ sportName }: { sportName: string }) {
  const [expanded, setExpanded] = useState(false);
  const facilities = getFacilitiesByActivity(sportName);

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
