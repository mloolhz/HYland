import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  calcCancelFee,
  cancelReservation,
  getMyReservations,
  getProducts,
} from "@/api/reservation";
import { getIslandColors } from "@/constants/island";
import type { CategoryKey, Product, Reservation } from "@/types/reservation";

type DisplayStatus = "upcoming" | "completed" | "cancelled";
type FilterKey = "all" | DisplayStatus;

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  water: "수상레저",
  land: "육상레저",
  exp: "체험",
  heal: "힐링",
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "upcoming", label: "이용예정" },
  { key: "completed", label: "이용완료" },
  { key: "cancelled", label: "취소됨" },
];

function parseReservationDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}

function getDisplayStatus(r: Reservation, now = new Date()): DisplayStatus {
  if (r.status === "cancelled") return "cancelled";
  if (parseReservationDateTime(r.date, r.time) < now) return "completed";
  return "upcoming";
}

function formatDateTimeLabel(date: string, time: string): string {
  const [, m, d] = date.split("-").map(Number);
  const dt = new Date(Number(date.slice(0, 4)), m - 1, d);
  return `${m}월 ${d}일 (${WEEKDAYS[dt.getDay()]}) ${time}`;
}

function formatPersonSummary(
  reservation: Reservation,
  product: Product | undefined,
): string {
  return reservation.persons
    .filter((p) => p.count > 0)
    .map((p) => {
      const label =
        product?.personTypes.find((pt) => pt.key === p.key)?.label ?? p.key;
      return `${label} ${p.count}`;
    })
    .join(" · ");
}

function statusBadgeClass(status: DisplayStatus): string {
  if (status === "upcoming") return "mp-rsv-badge mp-rsv-badge--upcoming";
  if (status === "completed") return "mp-rsv-badge mp-rsv-badge--completed";
  return "mp-rsv-badge mp-rsv-badge--cancelled";
}

function statusLabel(status: DisplayStatus): string {
  if (status === "upcoming") return "이용예정";
  if (status === "completed") return "이용완료";
  return "취소됨";
}

export function MyPageReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, products] = await Promise.all([getMyReservations(), getProducts()]);
      setReservations(list);
      const map: Record<string, Product> = {};
      for (const p of products) map[p.id] = p;
      setProductsById(map);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = useMemo(() => new Date(), [reservations]);

  const withStatus = useMemo(
    () =>
      reservations.map((r) => ({
        reservation: r,
        status: getDisplayStatus(r, now),
        product: productsById[r.productId],
      })),
    [reservations, productsById, now],
  );

  const counts = useMemo(() => {
    const c = { all: withStatus.length, upcoming: 0, completed: 0, cancelled: 0 };
    for (const item of withStatus) c[item.status] += 1;
    return c;
  }, [withStatus]);

  const filtered = useMemo(() => {
    if (filter === "all") return withStatus;
    return withStatus.filter((item) => item.status === filter);
  }, [withStatus, filter]);

  const cancelFeePreview = cancelTarget
    ? calcCancelFee(cancelTarget.date, cancelTarget.totalPrice)
    : null;

  const openCancel = (r: Reservation) => {
    setCancelError(null);
    setCancelTarget(r);
  };

  const closeCancel = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelError(null);
  };

  const confirmCancel = async () => {
    if (!cancelTarget || !cancelFeePreview?.cancelable) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelReservation(cancelTarget.reservationId);
      setCancelTarget(null);
      setFilter("cancelled");
      await load();
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : "취소에 실패했습니다.");
    } finally {
      setCancelling(false);
    }
  };

  const goDetail = (id: string) => {
    navigate(`/reservation/complete/${id}`);
  };

  const goReview = (r: Reservation, product: Product | undefined) => {
    navigate("/community/write", {
      state: {
        type: "review" as const,
        island: r.islandName,
        activity: product?.name ?? r.productName,
      },
    });
  };

  return (
    <>
      <div className="mp-section-head">
        <div>
          <p className="mp-section-label">예약 내역</p>
          <h2 id="mp-reservation-title" className="mp-section-title">
            나의 레저 예약
          </h2>
        </div>
      </div>

      <div className="mp-rsv-filters" role="tablist" aria-label="예약 상태 필터">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`mp-rsv-filter${filter === f.key ? " is-active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="mp-rsv-filter-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mp-rsv-empty">예약 내역을 불러오는 중…</p>
      ) : error ? (
        <p className="mp-rsv-empty">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="mp-rsv-empty">해당하는 예약이 없습니다.</p>
      ) : (
        <ul className="mp-rsv-list">
          {filtered.map(({ reservation: r, status, product }) => {
            const regionColor =
              product?.regionColor ?? getIslandColors(r.islandName).accent;
            const persons = formatPersonSummary(r, product);
            const canCancel =
              status === "upcoming" && calcCancelFee(r.date, r.totalPrice).cancelable;

            return (
              <li key={r.reservationId} className="mp-rsv-card">
                <div className="mp-rsv-thumb">
                  {product?.photo ? (
                    <img src={product.photo} alt="" />
                  ) : (
                    <span className="mp-rsv-thumb-fallback">준비중</span>
                  )}
                </div>

                <div className="mp-rsv-body">
                  <div className="mp-rsv-top">
                    <div className="mp-rsv-meta-line">
                      <span className="mp-rsv-island">
                        <span
                          className="mp-rsv-dot"
                          style={{ background: regionColor }}
                          aria-hidden
                        />
                        {r.islandName}
                      </span>
                      <span className="mp-rsv-sep">·</span>
                      <span>
                        {product ? CATEGORY_LABEL[product.category] : "레저"}
                      </span>
                    </div>
                    <span className={statusBadgeClass(status)}>{statusLabel(status)}</span>
                  </div>

                  <h3 className="mp-rsv-name">{r.productName}</h3>

                  <p className="mp-rsv-info">
                    <span>{r.reservationId}</span>
                    <span className="mp-rsv-sep">·</span>
                    <span>{formatDateTimeLabel(r.date, r.time)}</span>
                    <span className="mp-rsv-sep">·</span>
                    <span>{persons || "—"}</span>
                  </p>

                  <div className="mp-rsv-foot">
                    {status === "upcoming" && (
                      <>
                        <span className="mp-rsv-price">
                          {r.totalPrice.toLocaleString()}원
                        </span>
                        <div className="mp-rsv-actions">
                          <button
                            type="button"
                            className="mp-rsv-btn"
                            onClick={() => goDetail(r.reservationId)}
                          >
                            상세보기
                          </button>
                          {canCancel && (
                            <button
                              type="button"
                              className="mp-rsv-btn mp-rsv-btn--danger"
                              onClick={() => openCancel(r)}
                            >
                              예약취소
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {status === "completed" && (
                      <>
                        <span className="mp-rsv-note">이용이 완료된 예약입니다</span>
                        <div className="mp-rsv-actions">
                          <button
                            type="button"
                            className="mp-rsv-btn"
                            onClick={() => goDetail(r.reservationId)}
                          >
                            상세보기
                          </button>
                          <button
                            type="button"
                            className="mp-rsv-btn mp-rsv-btn--primary"
                            onClick={() => goReview(r, product)}
                          >
                            후기 작성
                          </button>
                        </div>
                      </>
                    )}

                    {status === "cancelled" && (
                      <>
                        <span className="mp-rsv-note">
                          {r.cancelledAt
                            ? `${new Date(r.cancelledAt).getMonth() + 1}월 ${new Date(r.cancelledAt).getDate()}일 취소`
                            : "취소됨"}
                          {typeof r.refundAmount === "number"
                            ? ` · ${r.refundAmount.toLocaleString()}원 환불 완료`
                            : ""}
                        </span>
                        <div className="mp-rsv-actions">
                          <button
                            type="button"
                            className="mp-rsv-btn"
                            onClick={() => goDetail(r.reservationId)}
                          >
                            상세보기
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {cancelTarget && cancelFeePreview && (
        <div
          className="mp-rsv-modal-backdrop"
          role="presentation"
          onClick={closeCancel}
        >
          <div
            className="mp-rsv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mp-rsv-cancel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-rsv-modal-head">
              <h3 id="mp-rsv-cancel-title">예약 취소</h3>
              <button
                type="button"
                className="mp-rsv-modal-close"
                aria-label="닫기"
                onClick={closeCancel}
              >
                ×
              </button>
            </div>

            <p className="mp-rsv-modal-product">{cancelTarget.productName}</p>
            <p className="mp-rsv-modal-sub">
              {formatDateTimeLabel(cancelTarget.date, cancelTarget.time)}
              {" · "}
              {formatPersonSummary(cancelTarget, productsById[cancelTarget.productId]) || "—"}
            </p>

            <div className="mp-rsv-fee-box">
              <div className="mp-rsv-fee-row">
                <span>결제금액</span>
                <b>{cancelTarget.totalPrice.toLocaleString()}원</b>
              </div>
              <div className="mp-rsv-fee-row">
                <span>
                  취소 수수료
                  {cancelFeePreview.cancelable
                    ? ` (${Math.round(cancelFeePreview.feeRate * 100)}%)`
                    : ""}
                </span>
                <b>
                  {cancelFeePreview.cancelable
                    ? `${cancelFeePreview.feeAmount.toLocaleString()}원`
                    : "—"}
                </b>
              </div>
              <div className="mp-rsv-fee-row mp-rsv-fee-row--total">
                <span>환불 예정 금액</span>
                <b>
                  {cancelFeePreview.cancelable
                    ? `${cancelFeePreview.refundAmount.toLocaleString()}원`
                    : "취소 불가"}
                </b>
              </div>
            </div>

            <p className="mp-rsv-modal-warn">
              이용일 3일 전부터 취소 수수료가 부과됩니다. 취소 후에는 되돌릴 수 없습니다.
            </p>

            {cancelError && <p className="mp-rsv-modal-error">{cancelError}</p>}

            <div className="mp-rsv-modal-actions">
              <button type="button" className="mp-rsv-btn" onClick={closeCancel} disabled={cancelling}>
                돌아가기
              </button>
              <button
                type="button"
                className="mp-rsv-btn mp-rsv-btn--danger"
                disabled={!cancelFeePreview.cancelable || cancelling}
                onClick={() => void confirmCancel()}
              >
                {cancelling ? "취소 중…" : "취소하기"}
              </button>
            </div>
            <p className="mp-rsv-demo-note">실제 취소·환불은 이루어지지 않는 데모입니다</p>
          </div>
        </div>
      )}
    </>
  );
}
