import IslandMap from "./IslandMap";
import { demoProps } from "./ToastProvider";

export function MapSection() {
  return (
    <section className="sec" id="map">
      <div className="container map-wrap">
        <div className="map-info reveal rv-l">
          <span className="eyebrow">ISLAND MAP</span>
          <h2>섬 지도 탐험</h2>
          <p>
            방문한 섬은 초록빛으로 물들고 아직 가보지 못한 섬은 안개 낀 회색으로 남아 있어요. 섬을 클릭하면 레저
            코스와 뱃길 정보를 확인할 수 있습니다. 회색 섬이 당신의 다음 목적지!
          </p>
          <div className="legend">
            <span className="lg">
              <span className="dot done" />
              방문 완료
            </span>
            <span className="lg">
              <span className="dot todo" />
              미방문
            </span>
          </div>
          <a className="btn btn-navy" href="#" {...demoProps("지도 탐험 상세 페이지는 준비 중이에요 🗺️")}>
            지도 탐험하기
          </a>
        </div>
        <div className="map-card reveal rv-r">
          <IslandMap />
        </div>
      </div>
    </section>
  );
}
