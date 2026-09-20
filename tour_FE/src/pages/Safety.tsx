import { useMemo } from "react";
import { CONTAINER } from "@/constants/layout";
import {
  FACILITY_LABELS,
  SAFE_KOREA_URL,
  buildSafetyGroups,
  telHref,
} from "@/lib/safety-groups";

export function Safety() {
  const facilityGroups = useMemo(buildSafetyGroups, []);
  const facilityCount = facilityGroups.reduce((count, group) => count + group.facilities.length, 0);

  return (
    <main className="sf-page">
      <header className="sf-hero">
        <div className={`${CONTAINER} sf-hero-inner`}>
          <p className="sf-eyebrow">ISLAND SAFETY GUIDE</p>
          <h1>섬 안전정보</h1>
          <p>인천 섬별 안전시설 정보를 한눈에 확인하세요.</p>
        </div>
      </header>

      <div className={`${CONTAINER} sf-content`}>
        <section className="sf-result" aria-labelledby="sf-result-title">
          <div className="sf-result-head">
            <p className="sf-result-label">SAFETY FACILITIES</p>
            <h2 id="sf-result-title">섬별 안전시설 목록</h2>
          </div>

          <p className="sf-facility-count">총 {facilityCount}곳</p>

          <div className="sf-island-tables">
            {facilityGroups.map((group) => (
              <section key={group.id} className="sf-island-table" aria-labelledby={`sf-island-${group.id}`}>
                <header className="sf-island-table__head">
                  <p>{group.area}</p>
                  <h3 id={`sf-island-${group.id}`}>{group.name}</h3>
                  <span>{group.facilities.length}곳</span>
                </header>
                {group.facilities.length > 0 ? (
                  <div className="sf-table-wrap">
                    <table className="sf-table">
                      <caption className="sf-sr-only">{group.name} 안전시설 목록</caption>
                      <thead>
                        <tr>
                          <th scope="col">시설 유형</th>
                          <th scope="col">시설명</th>
                          <th scope="col">주소</th>
                          <th scope="col">연락처</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.facilities.map((facility, index) => (
                          <tr key={`${facility.type}-${facility.name}-${index}`}>
                            <td>{FACILITY_LABELS[facility.type]}</td>
                            <td>
                              <span className="sf-table__name">{facility.name}</span>
                            </td>
                            <td>
                              {facility.address}
                              {facility.note ? <span className="sf-table__note">{facility.note}</span> : null}
                            </td>
                            <td>
                              <a className="sf-table__tel" href={telHref(facility.phone!)}>
                                {facility.phone}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="sf-island-table__empty">표시할 안전시설 정보가 없습니다.</p>
                )}
              </section>
            ))}
          </div>

          <a
            className="sf-map-link sf-map-link--secondary"
            href={SAFE_KOREA_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            국민안전24 안전지도에서 위치 확인하기
            <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section className="sf-emergency" aria-labelledby="sf-emergency-title">
          <div>
            <p className="sf-result-label">EMERGENCY CONTACT</p>
            <h2 id="sf-emergency-title">긴급 상황 연락처</h2>
            <p>위급한 상황에서는 지도 검색보다 먼저 긴급기관에 연락하세요.</p>
          </div>
          <div className="sf-emergency-links">
            <a href="tel:119"><span>구급·소방</span><strong>119</strong></a>
            <a href="tel:112"><span>경찰</span><strong>112</strong></a>
            <a href="tel:122"><span>해양사고</span><strong>122</strong></a>
          </div>
        </section>
      </div>
    </main>
  );
}
