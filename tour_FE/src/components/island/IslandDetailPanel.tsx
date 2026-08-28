import { Link } from "react-router-dom";
import type { IslandInfo } from "@/lib/island-data";
import { getIslandPortalUrl } from "@/lib/island-portal-links";
import { serializeIslandsQuery } from "@/lib/query";
import { IslandBadgeList } from "./IslandBadgeList";

type IslandDetailPanelProps = {
  island: IslandInfo | null;
  onClose: () => void;
};

export function IslandDetailPanel({ island, onClose }: IslandDetailPanelProps) {
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
            <span className={`isl-detail-badge ${island.visited ? "done" : "todo"}`}>
              {island.visited ? "방문 완료" : "미방문"}
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
            <h4>추천 코스</h4>
            <ul className="isl-course-tags">
              {island.leisureCourses.map((course) => (
                <li key={course}>{course}</li>
              ))}
            </ul>
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
            {island.bookingLabel && (
              <a className="btn btn-navy" href="/#booking">
                {island.bookingLabel}
              </a>
            )}
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
