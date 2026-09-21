import { useState } from "react";
import { Link } from "react-router-dom";
import type { LeisureFacility } from "@/api/leisure";
import { FACILITY_PLACEHOLDER } from "@/lib/facility-photo";

function FacilityThumb({ facility }: { facility: LeisureFacility }) {
  const [failed, setFailed] = useState(false);
  const placeholder = !facility.photo || failed;
  return (
    <img
      className="ai-facility__photo"
      src={placeholder ? FACILITY_PLACEHOLDER : (facility.photo ?? "")}
      alt=""
      loading="lazy"
      onError={placeholder ? undefined : () => setFailed(true)}
    />
  );
}

/**
 * AI 답변에 언급된 실제 시설 카드.
 * 서버가 AI 가 고른 시설 id 를 DB(한국관광공사 OpenAPI 로 수집한 레저 시설)와 대조해
 * 검증된 것만 내려준다. 누르면 시설 상세(주소·연락처·홈페이지)로 간다.
 */
export function AiFacilityCards({ facilities }: { facilities: LeisureFacility[] }) {
  if (facilities.length === 0) return null;
  const fromTourApi = facilities.some((f) => f.origin === "관광공사");

  return (
    <section className="ai-facility ai-fade-up" aria-label="답변에 나온 시설">
      <h4 className="ai-facility__title">여기서 즐길 수 있어요</h4>
      <ul className="ai-facility__list">
        {facilities.map((f) => (
          <li key={f.id}>
            <Link className="ai-facility__card" to={`/sports/facility/${f.id}`}>
              <FacilityThumb facility={f} />
              <span className="ai-facility__body">
                <span className="ai-facility__meta">
                  {f.islandName} · {f.activity}
                </span>
                <b className="ai-facility__name">{f.name}</b>
                {f.tel && <span className="ai-facility__tel">☎ {f.tel}</span>}
              </span>
              {f.origin === "관광공사" && (
                <span className="ai-facility__badge" title="한국관광공사 관광정보 OpenAPI 에서 수집한 시설">
                  관광공사
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {fromTourApi && (
        <p className="ai-facility__source">시설 정보 출처: 한국관광공사 관광정보 서비스(TourAPI)</p>
      )}
    </section>
  );
}
