import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getFacilityById, activityKey } from "@/data/leisure-facilities";
import { SPORTS_CATEGORIES, SPORTS_DATA } from "@/data/sports";
import {
  resolveSportIslandAccent,
  resolveSportIslandRegion,
} from "@/lib/sports-region";
import { CONTAINER } from "@/constants/layout";

/** 활동명으로 레저스포츠 탭의 종목 id를 찾는다 (목록으로 돌아갈 때 사용) */
function findSportId(activity: string): string | null {
  for (const list of Object.values(SPORTS_DATA)) {
    const hit = list.find((s) => activityKey(s.name) === activityKey(activity));
    if (hit) return hit.id;
  }
  return null;
}

/** 값이 아직 없는 칸은 자리를 유지하고 "-"로 표시한다 (나중에 채울 항목) */
function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className={empty ? "fd-empty" : undefined}>{empty ? "-" : value}</td>
    </tr>
  );
}

export function FacilityDetail() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const facility = facilityId ? getFacilityById(facilityId) : undefined;

  if (!facility) {
    return (
      <main className="fd-page">
        <div className={`${CONTAINER} fd-missing`}>
          <h1 className="fd-missing-title">시설을 찾을 수 없습니다</h1>
          <p className="fd-missing-desc">
            주소가 잘못되었거나 삭제된 시설입니다. 레저스포츠 목록에서 다시 찾아보세요.
          </p>
          <Link className="fd-list-btn" to="/sports">
            레저스포츠로 이동
          </Link>
        </div>
      </main>
    );
  }

  const categoryLabel =
    SPORTS_CATEGORIES.find((c) => c.key === facility.category)?.label ?? "";
  const sportId = findSportId(facility.activity);
  const listHref = `/sports?category=${facility.category}${sportId ? `&sport=${sportId}` : ""}`;
  const showImage = Boolean(facility.photo) && !imageFailed;

  return (
    <main className="fd-page">
      <header className="fd-hero" aria-label={facility.name}>
        <span
          className="fd-hero-bar"
          style={{ background: resolveSportIslandAccent(facility.islandName) }}
          aria-hidden="true"
        />
        <p className="fd-hero-eyebrow">{categoryLabel}</p>
        <h1 className="fd-hero-title">{facility.name}</h1>
      </header>

      <div className={`${CONTAINER} fd-body`}>
        <div className="fd-figure">
          {showImage ? (
            <img
              className="fd-photo"
              src={facility.photo ?? ""}
              alt={`${facility.name} 사진`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="fd-photo fd-photo--empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="9" cy="10" r="1.6" fill="currentColor" />
                <path
                  d="M3 16l5-4 3 2 4-5 6 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span>등록된 사진이 없습니다</span>
            </div>
          )}
        </div>

        <section className="fd-section" aria-labelledby="fd-detail-heading">
          <h2 id="fd-detail-heading" className="fd-section-title">
            상세정보
          </h2>
          <table className="fd-table">
            <tbody>
              <DetailRow label="권역" value={resolveSportIslandRegion(facility.islandName)} />
              <DetailRow label="섬" value={facility.islandName} />
              <DetailRow label="주소" value={facility.address} />
              <DetailRow
                label="연락처"
                value={
                  facility.tel && (
                    <a className="fd-link" href={`tel:${facility.tel.replace(/[^0-9+]/g, "")}`}>
                      {facility.tel}
                    </a>
                  )
                }
              />
              <DetailRow label="분류" value={categoryLabel} />
              <DetailRow label="활동" value={facility.activity} />
              <DetailRow
                label="홈페이지"
                value={
                  facility.homepage && (
                    <a
                      className="fd-link"
                      href={facility.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {facility.homepage}
                    </a>
                  )
                }
              />
            </tbody>
          </table>
        </section>

        <div className="fd-actions">
          <button type="button" className="fd-list-btn" onClick={() => navigate(listHref)}>
            목록
          </button>
        </div>
      </div>
    </main>
  );
}
