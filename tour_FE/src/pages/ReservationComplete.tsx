import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct, getReservation } from "@/api/reservation";
import { ReservationStepBar } from "@/components/reservation/ReservationStepBar";
import type { PayMethod, Product, Reservation } from "@/types/reservation";

const PAY_LABEL: Record<PayMethod, string> = {
  card: "신용/체크카드",
  transfer: "계좌이체",
  phone: "휴대폰 결제",
};

const DEFAULT_GUIDE = {
  place: "상품 상세 페이지 또는 예약 확정 문자로 안내됩니다.",
  items: "편한 복장과 개인 물품을 준비해 주세요.",
  cancelPolicy: "이용 2일 전까지 무료 취소, 이후는 상품별 규정을 따릅니다.",
  contact: "문의 032-000-0000",
};

export function ReservationComplete() {
  const { reservationId = "" } = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReservation(reservationId)
      .then(async (r) => {
        if (cancelled) return;
        setReservation(r);
        try {
          const p = await getProduct(r.productId);
          if (!cancelled) setProduct(p);
        } catch {
          /* guide optional */
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "예약 정보를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  if (loading) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-loading">예약 정보를 불러오는 중…</p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-error">{error ?? "예약을 찾을 수 없습니다."}</p>
          <p style={{ textAlign: "center" }}>
            <Link to="/reservation">예약 목록으로</Link>
          </p>
        </div>
      </main>
    );
  }

  const guide = product?.guide ?? DEFAULT_GUIDE;
  const personSummary = reservation.persons
    .filter((p) => p.count > 0)
    .map((p) => {
      const label =
        product?.personTypes.find((pt) => pt.key === p.key)?.label ?? p.key;
      return `${label} ${p.count}`;
    })
    .join(", ");

  return (
    <main className="rv-page">
      <div className="rv-body">
      <ReservationStepBar current="complete" />

      <div className="rv-complete-hero">
        <div className="rv-complete-check" aria-hidden>
          {reservation.status === "cancelled" ? "!" : "✓"}
        </div>
        <h1>
          {reservation.status === "cancelled"
            ? "취소된 예약입니다"
            : "예약이 완료되었습니다"}
        </h1>
        <p>
          {reservation.status === "cancelled"
            ? "취소·환불 내역은 마이페이지 예약 내역에서 확인할 수 있습니다."
            : "예약 내역은 마이페이지에서 확인할 수 있습니다."}
        </p>
      </div>

      <div className="rv-id-box">예약번호 {reservation.reservationId}</div>

      <section className="rv-card-box" aria-labelledby="rv-detail-title">
        <h2 id="rv-detail-title">예약 상세</h2>
        <div className="rv-summary-row">
          <span>상품</span>
          <strong>{reservation.productName}</strong>
        </div>
        <div className="rv-summary-row">
          <span>섬</span>
          <strong>{reservation.islandName}</strong>
        </div>
        <div className="rv-summary-row">
          <span>예약자</span>
          <strong>{reservation.booker.name}</strong>
        </div>
        <div className="rv-summary-row">
          <span>연락처</span>
          <strong>{reservation.booker.phone}</strong>
        </div>
        <div className="rv-summary-row">
          <span>일시</span>
          <strong>
            {reservation.date} {reservation.time}
          </strong>
        </div>
        <div className="rv-summary-row">
          <span>인원</span>
          <strong>{personSummary || "—"}</strong>
        </div>
        <div className="rv-summary-row">
          <span>결제수단</span>
          <strong>{PAY_LABEL[reservation.payMethod]}</strong>
        </div>
        <div className="rv-summary-row">
          <span>결제금액</span>
          <strong>{reservation.totalPrice.toLocaleString()}원</strong>
        </div>
      </section>

      <section className="rv-card-box" aria-labelledby="rv-guide-title">
        <h2 id="rv-guide-title">이용 안내</h2>
        <div className="rv-summary-row">
          <span>집합 장소</span>
          <strong>{guide.place}</strong>
        </div>
        <div className="rv-summary-row">
          <span>준비물</span>
          <strong>{guide.items}</strong>
        </div>
        <div className="rv-summary-row">
          <span>취소 규정</span>
          <strong>{guide.cancelPolicy}</strong>
        </div>
        <div className="rv-summary-row">
          <span>문의</span>
          <strong>{guide.contact}</strong>
        </div>
      </section>

      <div className="rv-actions">
        <Link to="/reservation" className="rv-btn rv-btn--ghost" style={{ textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box" }}>
          다른 레저 둘러보기
        </Link>
        {/* TODO: 마이페이지 예약 내역 라우트 연결 — /mypage 예약 내역 탭 */}
        <Link
          to="/mypage"
          className="rv-btn"
          style={{ textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box" }}
        >
          예약 내역 확인
        </Link>
      </div>
      </div>
    </main>
  );
}
