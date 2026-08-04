import { Link } from "react-router-dom";
import { IslandExplorerMap } from "@/components/island/IslandExplorerMap";

export function MapSection() {
  return (
    <section className="sec" id="map">
      <div className="container map-wrap">
        <div className="map-info reveal rv-l">
          <span className="eyebrow">ISLAND MAP</span>
          <h2>섬 지도 탐험</h2>
          <p>
            인천의 섬을 한눈에 살펴보세요. 권역별로 섬을 골라 클릭하면 레저 코스와 뱃길 정보를 확인할 수
            있습니다. 지도에서 마음에 드는 섬을 찾아 다음 여행을 계획해 보세요!
          </p>
          <Link to="/islands" className="btn btn-navy">
            지도 탐험하기
          </Link>
        </div>
        <div className="map-card map-card--preview reveal rv-r">
          <IslandExplorerMap readonly />
        </div>
      </div>
    </section>
  );
}
