import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createReservation, getProduct, payReservation } from "@/api/reservation";
import { ReservationStepBar } from "@/components/reservation/ReservationStepBar";
import type {
  PayMethod,
  Product,
  ReservationDraft,
} from "@/types/reservation";

const PAY_OPTIONS: { key: PayMethod; label: string }[] = [
  { key: "card", label: "신용/체크카드" },
  { key: "transfer", label: "계좌이체" },
  { key: "phone", label: "휴대폰 결제" },
];

const CATEGORY_LABEL = {
  water: "수상레저",
  land: "육상레저",
  exp: "체험",
  heal: "힐링",
} as const;

export function ReservationCheckout() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state as ReservationDraft | null;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [agreeRequired1, setAgreeRequired1] = useState(false);
  const [agreeRequired2, setAgreeRequired2] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  useEffect(() => {
    if (!draft || draft.productId !== productId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getProduct(productId)
      .then((p) => {
        if (!cancelled) setProduct(p);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "상품을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draft, productId]);

  const allRequiredAgreed = agreeRequired1 && agreeRequired2;
  const allAgreed = allRequiredAgreed && agreeMarketing;

  const setAllAgreed = (checked: boolean) => {
    setAgreeRequired1(checked);
    setAgreeRequired2(checked);
    setAgreeMarketing(checked);
  };

  const canPay =
    Boolean(name.trim()) &&
    Boolean(phone.trim()) &&
    Boolean(payMethod) &&
    allRequiredAgreed &&
    !submitting;

  const lineItems = useMemo(() => {
    if (!product || !draft) return [];
    return draft.persons
      .map((p) => {
        const pt = product.personTypes.find((x) => x.key === p.key);
        if (!pt || p.count <= 0) return null;
        return {
          label: pt.label,
          count: p.count,
          unit: pt.price,
          subtotal: pt.price * p.count,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [product, draft]);

  const onPay = async () => {
    if (!draft || !product || !payMethod || !canPay) return;
    setSubmitting(true);
    setError(null);
    try {
      const { reservationId } = await createReservation({
        productId: draft.productId,
        date: draft.date,
        time: draft.time,
        persons: draft.persons,
        booker: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          request: request.trim() || undefined,
        },
      });
      await payReservation(reservationId, payMethod);
      navigate(`/reservation/complete/${reservationId}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "결제에 실패했습니다.");
      setSubmitting(false);
    }
  };

  if (!draft || draft.productId !== productId) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-error">예약 정보가 없습니다. 날짜·인원부터 다시 선택해 주세요.</p>
          <p style={{ textAlign: "center" }}>
            <Link to={`/reservation/${productId}`}>예약 상세로 돌아가기</Link>
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-loading">불러오는 중…</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-error">{error ?? "상품을 찾을 수 없습니다."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="rv-page">
      <div className="rv-body">
      <ReservationStepBar current="checkout" />

      <div className="rv-split">
        <div>
          <section className="rv-panel" aria-labelledby="rv-booker-title">
            <h2 id="rv-booker-title" className="rv-panel-title">
              예약자 정보
            </h2>
            <div className="rv-form-group">
              <label htmlFor="rv-name">이름 *</label>
              <input
                id="rv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="rv-form-group">
              <label htmlFor="rv-phone">연락처 *</label>
              <input
                id="rv-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="010-0000-0000"
                required
              />
            </div>
            <div className="rv-form-group">
              <label htmlFor="rv-email">이메일 (선택)</label>
              <input
                id="rv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="rv-form-group">
              <label htmlFor="rv-request">요청사항 (선택)</label>
              <textarea
                id="rv-request"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
              />
            </div>
          </section>

          <section className="rv-panel" style={{ marginTop: 12 }} aria-labelledby="rv-pay-title">
            <h2 id="rv-pay-title" className="rv-panel-title">
              결제 수단
            </h2>
            <div className="rv-pay-options" role="radiogroup" aria-label="결제 수단">
              {PAY_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`rv-pay-option${payMethod === opt.key ? " is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={payMethod === opt.key}
                    onChange={() => setPayMethod(opt.key)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </section>

          <section className="rv-panel" style={{ marginTop: 12 }} aria-labelledby="rv-terms-title">
            <h2 id="rv-terms-title" className="rv-panel-title">
              약관 동의
            </h2>
            <div className="rv-terms">
              <label className="rv-term rv-term--all">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(e) => setAllAgreed(e.target.checked)}
                />
                전체 동의
              </label>
              <label className="rv-term">
                <input
                  type="checkbox"
                  checked={agreeRequired1}
                  onChange={(e) => setAgreeRequired1(e.target.checked)}
                />
                [필수] 예약·취소·환불 규정
              </label>
              <label className="rv-term">
                <input
                  type="checkbox"
                  checked={agreeRequired2}
                  onChange={(e) => setAgreeRequired2(e.target.checked)}
                />
                [필수] 개인정보 수집·이용
              </label>
              <label className="rv-term">
                <input
                  type="checkbox"
                  checked={agreeMarketing}
                  onChange={(e) => setAgreeMarketing(e.target.checked)}
                />
                [선택] 마케팅 정보 수신
              </label>
            </div>
          </section>
        </div>

        <aside className="rv-summary" aria-label="예약 내역 요약">
          <h2 className="rv-panel-title">예약 내역</h2>
          <div className="rv-thumb-row">
            <div className="rv-thumb">
              {product.photo ? (
                <img src={product.photo} alt="" />
              ) : (
                <span className="rv-card-photo-fallback" style={{ fontSize: 12 }}>
                  준비중
                </span>
              )}
            </div>
            <div>
              <strong style={{ color: "var(--rv-navy)" }}>{product.name}</strong>
              <p className="rv-card-meta" style={{ margin: "4px 0 0" }}>
                {product.islandName} · {CATEGORY_LABEL[product.category]}
              </p>
            </div>
          </div>

          <div className="rv-summary-row">
            <span>날짜</span>
            <strong>{draft.date}</strong>
          </div>
          <div className="rv-summary-row">
            <span>시간</span>
            <strong>{draft.time}</strong>
          </div>
          <div className="rv-summary-row">
            <span>인원</span>
            <strong>
              {lineItems.map((i) => `${i.label} ${i.count}`).join(", ") || "—"}
            </strong>
          </div>

          <div className="rv-line-items">
            {lineItems.map((item) => (
              <div key={item.label} className="rv-summary-row">
                <span>
                  {item.label} {item.unit.toLocaleString()}원 × {item.count}
                </span>
                <strong>{item.subtotal.toLocaleString()}원</strong>
              </div>
            ))}
          </div>

          <div className="rv-total">
            <span>총 결제금액</span>
            <strong>{Math.round(draft.totalPrice).toLocaleString()}원</strong>
          </div>

          {error && (
            <p className="rv-error" style={{ padding: "0 0 10px" }}>
              {error}
            </p>
          )}

          <button type="button" className="rv-btn" disabled={!canPay} onClick={onPay}>
            {submitting
              ? "결제 중…"
              : `${Math.round(draft.totalPrice).toLocaleString()}원 결제하기`}
          </button>
          <p className="rv-demo-note">실제 결제는 이루어지지 않는 데모입니다</p>
        </aside>
      </div>
      </div>
    </main>
  );
}
