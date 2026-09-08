import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";
import { ISLANDS, ISLAND_REGIONS } from "@/lib/island-data";

const SAFE_KOREA_URL =
  "https://www.safekorea.go.kr/safekorea-kor/flsm/flsm/facilitiesSafteyMap.do";

const FACILITIES = [
  { id: "hospital", label: "일반병원", icon: "🏥", title: "일반병원" },
  { id: "emergency", label: "응급의료센터", icon: "🚑", title: "응급의료센터" },
  { id: "health-center", label: "보건소", icon: "🩺", title: "보건소" },
  { id: "pharmacy", label: "약국", icon: "💊", title: "약국" },
  { id: "fire-station", label: "소방서", icon: "🚒", title: "소방서" },
  { id: "police", label: "경찰서", icon: "🚓", title: "경찰서" },
  { id: "coast-guard", label: "해양경찰서", icon: "⚓", title: "해양경찰서" },
  { id: "aed", label: "자동심장충격기", icon: "❤️", title: "자동심장충격기" },
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
          <p>여행할 섬과 필요한 시설을 선택하고 국민안전24 안전지도에서 위치를 확인하세요.</p>
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
              <p>공식 안전지도에서 바로 확인할 시설 종류를 선택하세요.</p>
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
          <div className="sf-result-main">
            <p className="sf-result-label">선택한 안전정보</p>
            <h2 id="sf-result-title">
              {selectedIsland.name} · {selectedFacility.label}
            </h2>
            <div className="sf-route" aria-label="국민안전24에서 선택할 지역">
              <span>인천광역시</span>
              <b aria-hidden="true">›</b>
              <span>{district}</span>
              <b aria-hidden="true">›</b>
              <strong>{selectedFacility.label}</strong>
            </div>
            <p className="sf-map-note">
              국민안전24는 외부 링크에 시·군·구 값을 전달하는 기능을 제공하지 않습니다. 지도에서
              <strong> 인천광역시 → {district}</strong>를 선택하면 {selectedIsland.name} 권역이 확대되고,
              <strong> {selectedFacility.label}</strong>은 자동으로 표시됩니다.
            </p>
          </div>
          <a
            className="sf-map-link"
            href={officialMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`국민안전24에서 ${selectedIsland.name} ${selectedFacility.label} 확인하기 (새 창)`}
          >
            국민안전24 안전지도 열기
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
