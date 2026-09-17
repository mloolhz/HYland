import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFacilitiesByIsland, type LeisureFacility } from "@/api/leisure";
import { useVisitedIslands } from "@/store/visited-islands";
import type { IslandInfo } from "@/lib/island-data";
import { getIslandPortalUrl } from "@/lib/island-portal-links";
import { serializeIslandsQuery } from "@/lib/query";
import { IslandBadgeList } from "./IslandBadgeList";

type IslandDetailPanelProps = {
  island: IslandInfo | null;
  onClose: () => void;
};

export function IslandDetailPanel({ island, onClose }: IslandDetailPanelProps) {
  // 훅은 조기 반환보다 앞에서 부른다
  const { isVisited } = useVisitedIslands();
  const visited = isVisited(island?.id);

  /**
   * 이 섬에 실제로 있는 레저 시설.
   * 예전에는 island-data 의 leisureCourses("두무진 해안 트레킹" 같은 문구)를
   * 보여줬는데, 그건 지어낸 코스 이름이라 눌러도 갈 곳이 없었다.
   */
  const [facilities, setFacilities] = useState<LeisureFacility[]>([]);

  useEffect(() => {
    if (!island) return;
    const ac = new AbortController();
    fetchFacilitiesByIsland(island.id, ac.signal)
      .then(setFacilities)
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") {
          console.error("[islands] 시설 조회 실패:", err);
        }
        setFacilities([]);
      });
    return () => ac.abort();
  }, [island]);

  if (!island) {
    return (
      <aside className="isl-detail isl-detail--empty" aria-label="섬 상세 정보">
        <div className="isl-detail-empty">
          <div className="isl-detail-empty-icon" aria-hidden="true">
            🏝️
          </div>
          <h3>섬을 선택해 주세요</h3>
          <p>지도에서 섬을 클릭하면 상세 정보를 확인할 수 있어요</p>
        </div>
      </aside>
    );
  }

  const portalUrl = getIslandPortalUrl(island.id);

  return (
    <>
      <div className="isl-detail-backdrop is-open" onClick={onClose} aria-hidden="true" />
      <aside
        className="isl-detail is-open"
        aria-label={`${island.name} 상세 정보`}
        role="dialog"
        aria-modal="true"
      >
        <div className="isl-detail-head">
          <div className="isl-detail-head-top">
            <span className="isl-detail-region">{island.region}</span>
            <span className={`isl-detail-badge ${visited ? "done" : "todo"}`}>
              {visited ? "방문 완료" : "미방문"}
            </span>
            <button type="button" className="isl-detail-close" onClick={onClose} aria-label="닫기">
              ×
            </button>
          </div>
          <h2>{island.name}</h2>
          <p className="isl-detail-intro">{island.intro}</p>
          <p className="isl-detail-meta">
            <span>{island.ferryRoute}</span>
            <span aria-hidden="true">·</span>
            <span>{island.travelTime}</span>
          </p>
        </div>

        <div className="isl-detail-body">
          <IslandBadgeList island={island} />

          <section className="isl-detail-block">
            <h4>추천 시설</h4>
            {facilities.length > 0 ? (
              <ul className="isl-facility-list">
                {facilities.slice(0, 6).map((f) => (
                  <li key={f.id}>
                    <Link to={`/sports/facility/${f.id}`} className="isl-facility-item">
                      <span className="isl-facility-name">{f.name}</span>
                      <span className="isl-facility-activity">{f.activity}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="isl-facility-empty">아직 등록된 시설이 없어요.</p>
            )}
            {facilities.length > 6 && (
              <Link className="isl-facility-more" to={`/sports?island=${island.id}`}>
                {island.name} 시설 {facilities.length}곳 모두 보기 →
              </Link>
            )}
          </section>

          {portalUrl && (
            <a
              className="isl-detail-portal"
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="isl-detail-portal__text">
                <span className="isl-detail-portal__label">자세히 보기</span>
                <span className="isl-detail-portal__hint">인천 섬포털 섬정보</span>
              </span>
              <span className="isl-detail-portal__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          )}

          <div className="isl-detail-actions">
            <Link
              className="isl-detail-link"
              to={`/community?islands=${serializeIslandsQuery(new Set([island.name]))}`}
            >
              탐험 후기 보기 →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
