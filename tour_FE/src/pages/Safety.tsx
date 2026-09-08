import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";
import { ISLANDS, ISLAND_REGIONS } from "@/lib/island-data";
import { getSafetyFacilities, isNoFacilityIsland } from "@/data/safety-facilities";

const SAFE_KOREA_URL =
  "https://www.safekorea.go.kr/safekorea-kor/flsm/flsm/facilitiesSafteyMap.do";

const FACILITIES = [
  { id: "hospital", label: "일반병원", icon: "🏥", title: "일반병원" },
  { id: "health-center", label: "보건소", icon: "🩺", title: "보건소" },
  { id: "pharmacy", label: "약국", icon: "💊", title: "약국" },
  { id: "fire-station", label: "소방서", icon: "🚒", title: "소방서" },
  { id: "police", label: "경찰서", icon: "🚓", title: "경찰서" },
  { id: "coast-guard", label: "해양경찰서", icon: "⚓", title: "해양경찰서" },
] as const;

type FacilityId = (typeof FACILITIES)[number]["id"];

const GANGHWA_ISLANDS = new Set(["gangh", "gyo", "seok"]);
const YEONGJONG_ISLANDS = new Set(["yeongj", "muui"]);

function districtOf(islandId: string) {
  if (GANGHWA_ISLANDS.has(islandId)) return "강화군";
  if (YEONGJONG_ISLANDS.has(islandId)) return "영종구";
  return "옹진군";
}

function isFacilityId(value: string | null): value is FacilityId {
  return FACILITIES.some((facility) => facility.id === value);
}

/** tel: 링크용 — 하이픈·공백을 뺀 숫자만 남긴다. */
function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
}

/** 시설별로 우선 안내할 긴급번호 — 구체적 시설 정보가 없을 때의 폴백. */
const FALLBACK_EMERGENCY: Partial<Record<FacilityId, { label: string; number: string }>> = {
  hospital: { label: "구급·소방", number: "119" },
  "fire-station": { label: "구급·소방", number: "119" },
  police: { label: "경찰", number: "112" },
  "coast-guard": { label: "해양사고", number: "122" },
};

export function Safety() {
  const [searchParams, setSearchParams] = useSearchParams();
  const islandId = ISLANDS.some((island) => island.id === searchParams.get("island"))
    ? searchParams.get("island")!
    : "gangh";
  const facilityId = isFacilityId(searchParams.get("facility"))
    ? searchParams.get("facility")!
    : "hospital";

  const selectedIsland = ISLANDS.find((island) => island.id === islandId) ?? ISLANDS[0];
  const selectedFacility =
    FACILITIES.find((facility) => facility.id === facilityId) ?? FACILITIES[0];
  const district = districtOf(selectedIsland.id);

  const officialMapUrl = useMemo(() => {
    const params = new URLSearchParams({
      menuSn: "235",
      title: selectedFacility.title,
      baseMapNm: "naver",
      focus: "Y",
    });
    return `${SAFE_KOREA_URL}?${params.toString()}`;
  }, [selectedFacility.title]);

  const facilities = useMemo(
    () => getSafetyFacilities(selectedIsland.id, district, selectedFacility.id),
    [selectedIsland.id, district, selectedFacility.id],
  );
  const fallbackEmergency = FALLBACK_EMERGENCY[selectedFacility.id];
  const noFacilityIsland = isNoFacilityIsland(selectedIsland.id);

  const updateSelection = (key: "island" | "facility", value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="sf-page">
      <header className="sf-hero">
        <div className={`${CONTAINER} sf-hero-inner`}>
          <p className="sf-eyebrow">ISLAND SAFETY GUIDE</p>
          <h1>섬별 안전정보</h1>
          <p>여행할 섬과 필요한 시설을 선택하면 주소·연락처를 바로 확인할 수 있어요.</p>
        </div>
      </header>

      <div className={`${CONTAINER} sf-content`}>
        <section className="sf-panel" aria-labelledby="sf-island-title">
          <div className="sf-section-head">
            <span className="sf-step">1</span>
            <div>
              <h2 id="sf-island-title">섬 선택</h2>
              <p>선택한 섬이 속한 행정구역을 기준으로 안전시설을 찾습니다.</p>
            </div>
          </div>

          <div className="sf-region-list">
            {ISLAND_REGIONS.map((region) => (
              <div className="sf-region" key={region}>
                <h3>{region}</h3>
                <div className="sf-island-options">
                  {ISLANDS.filter((island) => island.region === region).map((island) => {
                    const active = island.id === selectedIsland.id;
                    return (
                      <button
                        type="button"
                        key={island.id}
                        className={`sf-choice${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => updateSelection("island", island.id)}
                      >
                        {island.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sf-panel" aria-labelledby="sf-facility-title">
          <div className="sf-section-head">
            <span className="sf-step">2</span>
            <div>
              <h2 id="sf-facility-title">안전시설 선택</h2>
              <p>확인하고 싶은 시설 종류를 선택하세요.</p>
            </div>
          </div>

          <div className="sf-facility-grid">
            {FACILITIES.map((facility) => {
              const active = facility.id === selectedFacility.id;
              return (
                <button
                  type="button"
                  key={facility.id}
                  className={`sf-facility${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => updateSelection("facility", facility.id)}
                >
                  <span aria-hidden="true">{facility.icon}</span>
                  {facility.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="sf-result" aria-labelledby="sf-result-title">
          <div className="sf-result-head">
            <p className="sf-result-label">선택한 안전정보</p>
            <h2 id="sf-result-title">
              {selectedIsland.name} · {selectedFacility.label}
            </h2>
          </div>

          {facilities.length > 0 ? (
            <div className="sf-table-wrap">
              <table className="sf-table">
                <caption className="sf-sr-only">
                  {selectedIsland.name} {selectedFacility.label} 목록 ({facilities.length}곳)
                </caption>
                <thead>
                  <tr>
                    <th scope="col">시설명</th>
                    <th scope="col">주소</th>
                    <th scope="col">연락처</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={`${facility.name}-${facility.phone ?? ""}`}>
                      <td>
                        <span className="sf-table__name">{facility.name}</span>
                        {facility.verified === false ? (
                          <span className="sf-table__badge" title="공식 출처 기준 초안 — 확인 필요">
                            확인 필요
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {facility.address ? (
                          facility.address
                        ) : (
                          <span className="sf-table__muted">—</span>
                        )}
                        {facility.note ? (
                          <span className="sf-table__note">{facility.note}</span>
                        ) : null}
                      </td>
                      <td>
                        {facility.phone ? (
                          <a className="sf-table__tel" href={telHref(facility.phone)}>
                            {facility.phone}
                          </a>
                        ) : (
                          <span className="sf-table__muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sf-result-empty">
              <p className="sf-result-empty__msg">
                {noFacilityIsland ? (
                  <>
                    {selectedIsland.name}에는 병원·약국·파출소 같은 안전시설이 없어요. 위급 시
                    {fallbackEmergency
                      ? ` 아래 ${fallbackEmergency.label} 번호로 연락하고,`
                      : " 119·112·122로 연락하고,"}{" "}
                    가까운 거점 섬이나 육지의 시설을 이용하세요.
                  </>
                ) : (
                  <>
                    {selectedIsland.name}의 {selectedFacility.label} 정보는 아직 정리 중이에요.
                    {fallbackEmergency
                      ? ` 위급하면 아래 ${fallbackEmergency.label} 번호로 먼저 연락하세요.`
                      : " 아래 국민안전24 지도에서 위치를 확인하세요."}
                  </>
                )}
              </p>
              {fallbackEmergency ? (
                <a className="sf-facility-card__tel" href={telHref(fallbackEmergency.number)}>
                  <span aria-hidden="true">📞</span>
                  {fallbackEmergency.label} {fallbackEmergency.number}
                </a>
              ) : null}
            </div>
          )}

          <a
            className="sf-map-link sf-map-link--secondary"
            href={officialMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`국민안전24에서 ${selectedIsland.name} ${selectedFacility.label} 위치 확인하기 (새 창)`}
          >
            국민안전24 안전지도에서 위치 보기
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
