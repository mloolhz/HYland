import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAvailability, getMinPrice, getProduct } from "@/api/reservation";
import type { Product, ReservationDraft, TimeSlot } from "@/types/reservation";

const CATEGORY_LABEL = {
  water: "수상레저",
  land: "육상레저",
  exp: "체험",
  heal: "힐링",
} as const;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function todayStart(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function slotLabel(left: number): { text: string; className: string } {
  if (left <= 0) return { text: "예약마감", className: "rv-slot-left--closed" };
  if (left <= 2) return { text: `마감임박 ${left}`, className: "rv-slot-left--warn" };
  return { text: `예약가능 ${left}`, className: "rv-slot-left--ok" };
}

export function ReservationDetail() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProduct(productId)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        const init: Record<string, number> = {};
        for (const pt of p.personTypes) {
          init[pt.key] = pt.min;
        }
        setCounts(init);
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
  }, [productId]);

  useEffect(() => {
    if (!selectedDate || !productId) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSelectedTime(null);
    getAvailability(productId, selectedDate)
      .then((list) => {
        if (!cancelled) setSlots(list);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, selectedDate]);

  const availableSet = useMemo(
    () => new Set(product?.availableDates ?? []),
    [product],
  );

  const calendarCells = useMemo(() => {
    const first = startOfMonth(month);
    const startPad = first.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: ({ day: number; date: string } | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatYmd(new Date(month.getFullYear(), month.getMonth(), day));
      cells.push({ day, date });
    }
    return cells;
  }, [month]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.personTypes.reduce((sum, pt) => sum + pt.price * (counts[pt.key] ?? 0), 0);
  }, [product, counts]);

  const personTotal = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  const canProceed = Boolean(selectedDate && selectedTime && personTotal >= 1);

  const setCount = (key: string, next: number, min: number, max: number) => {
    setCounts((prev) => ({ ...prev, [key]: Math.min(max, Math.max(min, next)) }));
  };

  const goCheckout = () => {
    if (!product || !selectedDate || !selectedTime || !canProceed) return;
    const draft: ReservationDraft = {
      productId: product.id,
      date: selectedDate,
      time: selectedTime,
      persons: product.personTypes.map((pt) => ({
        key: pt.key,
        count: counts[pt.key] ?? 0,
      })),
      totalPrice: Math.round(totalPrice),
    };
    navigate(`/reservation/${product.id}/checkout`, { state: draft });
  };

  if (loading) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-loading">상품을 불러오는 중…</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="rv-page">
        <div className="rv-body">
          <p className="rv-error">{error ?? "상품을 찾을 수 없습니다."}</p>
        </div>
      </main>
    );
  }

  const today = todayStart();

  return (
    <main className="rv-page">
      <div className="rv-body">
      <header className="rv-product-head">
        <div className="rv-product-photo">
          {product.photo ? (
            <img src={product.photo} alt="" />
          ) : (
            <span className="rv-card-photo-fallback">준비중</span>
          )}
        </div>
        <div>
          <div className="rv-product-tags">
            <span className="rv-tag">{CATEGORY_LABEL[product.category]}</span>
            <span className="rv-tag rv-tag--island">
              <span
                className="rv-dd-dot"
                style={{ background: product.regionColor }}
                aria-hidden
              />
              {product.islandName}
            </span>
          </div>
          <h1>{product.name}</h1>
          <p className="rv-product-price">1인 {getMinPrice(product).toLocaleString()}원~</p>
          <p className="rv-product-meta">
            {product.diff} · {product.season}
          </p>
        </div>
      </header>

      <div className="rv-split">
        <div>
          <section className="rv-panel" aria-labelledby="rv-cal-title">
            <h2 id="rv-cal-title" className="rv-panel-title">
              ① 날짜 선택
            </h2>
            <div className="rv-cal-nav">
              <button
                type="button"
                aria-label="이전 달"
                onClick={() => setMonth((m) => addMonths(m, -1))}
              >
                ◀
              </button>
              <strong>
                {month.getFullYear()}년 {month.getMonth() + 1}월
              </strong>
              <button
                type="button"
                aria-label="다음 달"
                onClick={() => setMonth((m) => addMonths(m, 1))}
              >
                ▶
              </button>
            </div>
            <div className="rv-cal-week">
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="rv-cal-grid">
              {calendarCells.map((cell, idx) => {
                if (!cell) return <span key={`e-${idx}`} />;
                const dateObj = parseYmd(cell.date);
                const isPast = dateObj < today;
                const isAvailable = availableSet.has(cell.date) && !isPast;
                const isSelected = selectedDate === cell.date;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    className={`rv-cal-day${isAvailable ? " is-available" : ""}${isSelected ? " is-selected" : ""}`}
                    disabled={!isAvailable}
                    onClick={() => setSelectedDate(cell.date)}
                  >
                    {cell.day}
                    {isAvailable && <span className="rv-cal-dot" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rv-panel" style={{ marginTop: 12 }} aria-labelledby="rv-slot-title">
            <h2 id="rv-slot-title" className="rv-panel-title">
              ② 시간대 선택
            </h2>
            {!selectedDate ? (
              <p className="rv-summary-hint">날짜를 먼저 선택해 주세요.</p>
            ) : slotsLoading ? (
              <p className="rv-summary-hint">잔여석을 불러오는 중…</p>
            ) : slots.length === 0 ? (
              <p className="rv-summary-hint">선택한 날짜에 예약 가능한 시간이 없습니다.</p>
            ) : (
              <div className="rv-slots">
                {slots.map((slot) => {
                  const meta = slotLabel(slot.left);
                  const closed = slot.left <= 0;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      className={`rv-slot${selectedTime === slot.time ? " is-selected" : ""}`}
                      disabled={closed}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      <span>{slot.time}</span>
                      <span className={meta.className}>{meta.text}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="rv-summary" aria-label="예약 요약">
          <h2 className="rv-panel-title">예약 요약</h2>
          {!selectedDate || !selectedTime ? (
            <p className="rv-summary-hint">날짜와 시간을 선택하면 요약이 표시됩니다.</p>
          ) : (
            <>
              <div className="rv-summary-row">
                <span>날짜</span>
                <strong>{selectedDate}</strong>
              </div>
              <div className="rv-summary-row">
                <span>시간</span>
                <strong>{selectedTime}</strong>
              </div>
            </>
          )}

          <div className="rv-person-list">
            {product.personTypes.map((pt) => (
              <div key={pt.key} className="rv-person-row">
                <div className="rv-person-label">
                  <strong>{pt.label}</strong>
                  <span>{pt.price.toLocaleString()}원</span>
                </div>
                <div className="rv-counter">
                  <button
                    type="button"
                    aria-label={`${pt.label} 감소`}
                    disabled={(counts[pt.key] ?? 0) <= pt.min}
                    onClick={() => setCount(pt.key, (counts[pt.key] ?? 0) - 1, pt.min, pt.max)}
                  >
                    −
                  </button>
                  <span>{counts[pt.key] ?? 0}</span>
                  <button
                    type="button"
                    aria-label={`${pt.label} 증가`}
                    disabled={(counts[pt.key] ?? 0) >= pt.max}
                    onClick={() => setCount(pt.key, (counts[pt.key] ?? 0) + 1, pt.min, pt.max)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rv-total">
            <span>총 결제금액</span>
            <strong>{Math.round(totalPrice).toLocaleString()}원</strong>
          </div>

          <button type="button" className="rv-btn" disabled={!canProceed} onClick={goCheckout}>
            예약하기
          </button>
          <p className="rv-demo-note">실제 결제는 이루어지지 않는 데모입니다</p>
        </aside>
      </div>
      </div>
    </main>
  );
}
