import { Link } from "react-router-dom";
import type { IslandInfo } from "@/lib/island-data";
import { serializeIslandsQuery } from "@/lib/query";

const COURSE_ICONS = ["⛵", "🏃", "🥾", "🎣", "🏕️", "📸"];

type IslandDetailPanelProps = {
  island: IslandInfo | null;
  isOpen: boolean;
  onClose: () => void;
};

export function IslandDetailPanel({ island, isOpen, onClose }: IslandDetailPanelProps) {
  if (!island) {
    return (
      <aside className="isl-detail" aria-label="섬 상세 정보">
        <div className="isl-detail-empty">
          <div className="isl-detail-empty-icon" aria-hidden="true">
            🗺️
          </div>
          <h3>섬을 선택해 주세요</h3>
          <p>
            지도에서 섬을 클릭하면
            <br />
            레저 코스와 뱃길 정보를 확인할 수 있어요
          </p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <div
        className={`isl-detail-backdrop${isOpen ? " is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`isl-detail${isOpen ? " is-open" : ""}`}
        aria-label={`${island.name} 상세 정보`}
        role="dialog"
        aria-modal="true"
      >
        <div className="isl-detail-head">
          <span className="isl-detail-region">{island.region}</span>
          <div className="isl-detail-title-row">
            <h2>{island.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`isl-detail-badge ${island.visited ? "done" : "todo"}`}>
                {island.visited ? "방문 완료" : "미방문"}
              </span>
              <button type="button" className="isl-detail-close" onClick={onClose} aria-label="닫기">
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="isl-detail-body">
          <section className="isl-detail-section">
            <h4>섬 소개</h4>
            <p>{island.intro}</p>
          </section>

          <section className="isl-detail-section">
            <h4>추천 레저 코스</h4>
            <ul className="isl-course-list">
              {island.leisureCourses.map((course, index) => (
                <li className="isl-course-item" key={course}>
                  <i aria-hidden="true">{COURSE_ICONS[index % COURSE_ICONS.length]}</i>
                  {course}
                </li>
              ))}
            </ul>
          </section>

          <section className="isl-detail-section">
            <h4>뱃길 · 이동 정보</h4>
            <div className="isl-ferry-grid">
              <div className="isl-ferry-item">
                <span>뱃길</span>
                <b>{island.ferryRoute}</b>
              </div>
              <div className="isl-ferry-item">
                <span>이동 시간</span>
                <b>{island.travelTime}</b>
              </div>
            </div>
          </section>

          <div className="isl-detail-actions">
            <Link className="btn btn-navy" to="/sports">
              {island.bookingLabel ?? "레저스포츠 보기"}
            </Link>
            <Link
              className="btn btn-white"
              to={`/community?islands=${serializeIslandsQuery(new Set([island.name]))}`}
            >
              탐험 후기 보기
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
