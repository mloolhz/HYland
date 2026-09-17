import { useMemo } from "react";
import { CONTAINER } from "@/constants/layout";
import {
  DISTRICT_SAFETY,
  ISLAND_SAFETY,
  type SafetyFacility,
  type SafetyFacilityType,
} from "@/data/safety-facilities";
import { ISLANDS } from "@/lib/island-data";

const SAFE_KOREA_URL =
  "https://www.safekorea.go.kr/safekorea-kor/flsm/flsm/facilitiesSafteyMap.do";

const FACILITY_LABELS: Record<SafetyFacilityType, string> = {
  hospital: "일반병원",
  "health-center": "보건소·보건지소",
  pharmacy: "약국",
  "fire-station": "소방서·119안전센터",
  police: "경찰서·파출소",
  "coast-guard": "해양경찰·출장소",
};

type SafetyFacilityGroup = {
  id: string;
  area: string;
  name: string;
  facilities: SafetyFacility[];
};

function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
}

/** 화면에는 주소와 연락처가 모두 확인된 시설만 표시한다. 원본 데이터는 보존한다. */
function canDisplayFacility(facility: SafetyFacility): boolean {
  return Boolean(facility.address?.trim()) && Boolean(facility.phone?.trim());
}

/** 같은 시설 유형·명칭·주소·전화가 반복된 경우, 표에서는 한 번만 보인다. */
function uniqueFacilities(facilities: SafetyFacility[]): SafetyFacility[] {
  const seen = new Set<string>();
  return facilities.filter((facility) => {
    const key = [facility.type, facility.name, facility.address, facility.phone].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSafetyGroups(): SafetyFacilityGroup[] {
  const islandGroups = ISLANDS.map((island) => ({
    id: island.id,
    area: island.region,
    name: island.name,
    facilities: uniqueFacilities((ISLAND_SAFETY[island.id] ?? []).filter(canDisplayFacility)),
    hasSourceData: (ISLAND_SAFETY[island.id] ?? []).length > 0,
  })).filter((group) => group.facilities.length > 0 || group.hasSourceData);

  const islandsWithInfo = islandGroups.filter((group) => group.facilities.length > 0);
  const islandsWithoutInfo = islandGroups.filter((group) => group.facilities.length === 0);

  const districtGroups = Object.entries(DISTRICT_SAFETY).map(([district, facilities]) => ({
    id: `district-${district}`,
    area: "행정구역 거점",
    name: district,
    facilities: uniqueFacilities(facilities.filter(canDisplayFacility)),
    hasSourceData: facilities.length > 0,
  })).filter((group) => group.facilities.length > 0 || group.hasSourceData);

  // 표시 가능한 시설이 있는 섬을 먼저, 정보가 없는 섬은 맨 뒤로 보낸다.
  return [...islandsWithInfo, ...districtGroups, ...islandsWithoutInfo];
}

export function Safety() {
  const facilityGroups = useMemo(buildSafetyGroups, []);
  const facilityCount = facilityGroups.reduce((count, group) => count + group.facilities.length, 0);

  return (
    <main className="sf-page">
      <header className="sf-hero">
        <div className={`${CONTAINER} sf-hero-inner`}>
          <p className="sf-eyebrow">ISLAND SAFETY GUIDE</p>
          <h1>섬 안전정보</h1>
          <p>인천 섬과 행정구역 거점의 안전시설 정보를 한눈에 확인하세요.</p>
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
