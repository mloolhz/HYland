import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchFacilityById, type LeisureFacilityDetail } from "@/api/leisure";
import { activityKey } from "@/lib/activity-key";
import { SPORTS_CATEGORIES, SPORTS_DATA } from "@/data/sports";
import {
  resolveSportIslandAccent,
  resolveSportIslandRegion,
} from "@/lib/sports-region";
import { CONTAINER } from "@/constants/layout";

/**
 * 활동명으로 레저스포츠 탭의 종목을 찾는다.
 * 목록으로 돌아갈 때(id)와 활동명 표기를 맞출 때(name) 쓴다.
 * 수집 데이터는 "온천-스파", 탭은 "온천·스파" 처럼 표기가 다를 수 있어
 * 화면에는 탭 쪽 이름을 보여준다.
 */
function findSport(activity: string): { id: string; name: string } | null {
  for (const list of Object.values(SPORTS_DATA)) {
    const hit = list.find((s) => activityKey(s.name) === activityKey(activity));
    if (hit) return { id: hit.id, name: hit.name };
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

/** 시설을 못 찾았거나 조회에 실패했을 때 */
function FacilityMessage({ title, desc }: { title: string; desc: string }) {
  return (
    <main className="fd-page">
      <div className={`${CONTAINER} fd-missing`}>
        <h1 className="fd-missing-title">{title}</h1>
        <p className="fd-missing-desc">{desc}</p>
        <Link className="fd-list-btn" to="/sports">
          레저스포츠로 이동
        </Link>
      </div>
    </main>
  );
}

export function FacilityDetail() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const [facility, setFacility] = useState<LeisureFacilityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setImageFailed(false);
    fetchFacilityById(facilityId, ctrl.signal)
      .then((row) => {
        setFacility(row);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        console.error("[facility] 상세 조회 실패:", err);
        setFacility(null);
        setError("시설 정보를 불러오지 못했어요.");
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [facilityId]);

  if (loading) {
    return (
      <main className="fd-page">
        <div className={`${CONTAINER} fd-missing`}>
          <p className="fd-missing-desc">불러오는 중…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <FacilityMessage
        title="시설 정보를 불러오지 못했어요"
        desc="잠시 후 다시 시도하거나, 레저스포츠 목록에서 다시 들어와 주세요."
      />
    );
  }

  if (!facility) {
    return (
      <FacilityMessage
        title="시설을 찾을 수 없습니다"
        desc="주소가 잘못되었거나 삭제된 시설입니다. 레저스포츠 목록에서 다시 찾아보세요."
      />
    );
  }

  const categoryLabel =
    SPORTS_CATEGORIES.find((c) => c.key === facility.category)?.label ?? "";
  const sport = findSport(facility.activity);
  const listHref = `/sports?category=${facility.category}${sport ? `&sport=${sport.id}` : ""}`;
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
              <DetailRow label="활동" value={sport?.name ?? facility.activity} />
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
