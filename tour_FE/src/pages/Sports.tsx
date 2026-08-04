import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SPORTS_CATEGORIES,
  SPORTS_DATA,
  type BookingMethod,
  type CategoryKey,
  type InfoSource,
  type ReservationType,
  type Sport,
  type SportIsland,
} from "@/data/sports";
import { ISLAND_MAP } from "@/lib/island-data";
import {
  resolveSportIslandAccent,
  resolveSportIslandRegion,
} from "@/lib/sports-region";
import { CONTAINER } from "@/constants/layout";
import { LEISURE_SPORTS_HERO } from "@/lib/landing-images";

const HERO_IMAGE = LEISURE_SPORTS_HERO;

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sp-meta-row">
      <span className="sp-meta-label">{label}</span>
      <span className="sp-meta-value">{value}</span>
    </div>
  );
}

function SportPhoto({ sport }: { sport: Sport }) {
  const src = sport.photo?.trim();

  return (
    <div className="sp-photo-frame">
      {src ? (
        <img
          className="sp-photo-img"
          src={src}
          alt={`${sport.name} 대표 이미지`}
        />
      ) : (
        <div className="sp-photo-placeholder" aria-label={`${sport.name} 대표 이미지 자리`}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" stroke="#64748B" strokeWidth="1.6" />
            <circle cx="9" cy="10" r="1.6" fill="#64748B" />
            <path d="M3 16l5-4 3 2 4-5 6 7" stroke="#64748B" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span>《{sport.name}》 대표 이미지 (사진 삽입 영역)</span>
        </div>
      )}
    </div>
  );
}

function BookingMethodLink({
  method,
  primary = false,
}: {
  method: BookingMethod;
  primary?: boolean;
}) {
  if (method.type === "phone" && method.tel) {
    const telHref = `tel:${method.tel.replace(/[^\d+]/g, "")}`;
    return (
      <a className={`sp-booking-btn${primary ? " sp-booking-btn--primary" : " sp-booking-btn--secondary"}`} href={telHref}>
        <span className="sp-booking-btn-label">{method.label}</span>
        <span className="sp-booking-btn-sub">전화 문의: {method.tel}</span>
      </a>
    );
  }

  if (!method.url) return null;

  return (
    <a
      className="sp-booking-btn sp-booking-btn--external"
      href={method.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="sp-booking-btn-label">{method.label}</span>
      <span className="sp-booking-btn-external" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

function SportBookingSection({ sport }: { sport: Sport }) {
  const { booking } = sport;
  const hasBooking = booking.length > 0;
  const infoOnly = hasBooking && booking.every((method) => method.type === "info");

  return (
    <section className="sp-section" aria-labelledby="sp-booking-heading">
      <h3 id="sp-booking-heading" className="sp-section-title">
        예약
      </h3>
      {hasBooking ? (
        <div className="sp-booking-box">
          <p className="sp-booking-lead">
            {infoOnly
              ? "예약 없이 즐기는 활동입니다. 코스·이용 정보를 확인하세요."
              : "이 활동은 아래 예약처에서 예약할 수 있습니다."}
          </p>
          <div className="sp-booking-actions">
            {booking.map((method, index) => (
              <BookingMethodLink key={`${method.type}-${method.label}`} method={method} primary={index === 0} />
            ))}
          </div>
          {!infoOnly && (
            <p className="sp-booking-note">외부 예약처로 이동합니다. 결제·예약은 해당 사이트에서 진행됩니다.</p>
          )}
        </div>
      ) : (
        <div className="sp-booking-box sp-booking-box--free">
          <strong>별도 예약이 필요 없는 자유 활동입니다.</strong>
          {" · "}
          각 섬의 코스·물때 정보를 확인하고 자유롭게 즐기세요.
        </div>
      )}
    </section>
  );
}

export function Sports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const categoryFromUrl =
    initialCategory && initialCategory in SPORTS_DATA
      ? (initialCategory as CategoryKey)
      : "water";
  const [category, setCategory] = useState<CategoryKey>(categoryFromUrl);
  const [selectedId, setSelectedId] = useState<string>(SPORTS_DATA[categoryFromUrl][0].id);

  useEffect(() => {
    const nextCategory =
      initialCategory && initialCategory in SPORTS_DATA
        ? (initialCategory as CategoryKey)
        : "water";
    setCategory(nextCategory);
    setSelectedId(SPORTS_DATA[nextCategory][0].id);
  }, [initialCategory]);

  const categoryLabel = SPORTS_CATEGORIES.find((c) => c.key === category)?.label ?? "";
  const sports = SPORTS_DATA[category];
  const selected = useMemo(() => {
    const list = SPORTS_DATA[category];
    return list.find((s) => s.id === selectedId) ?? list[0] ?? null;
  }, [category, selectedId]);

  const selectCategory = (key: CategoryKey) => {
    setCategory(key);
    setSelectedId(SPORTS_DATA[key][0].id);
  };

  const openIsland = useCallback(
    (island: SportIsland) => {
      if (island.id && ISLAND_MAP[island.id]) {
        navigate("/islands", { state: { islandId: island.id } });
        return;
      }
      console.warn("[sports] IslandExplorer에 없는 섬 — 목록으로 이동:", island.n, island.id);
      navigate("/islands");
    },
    [navigate],
  );

  return (
    <main className="sp-page">
      <div className="sp-hero-band">
        <header className="sp-hero" aria-label="레저스포츠">
          <img
            className="sp-hero-img"
            src={HERO_IMAGE}
            alt=""
            width={3504}
            height={805}
          />
          <div className="sp-hero-overlay" aria-hidden="true" />
          <div className={`${CONTAINER} sp-hero-inner`}>
            <span className="sp-hero-eyebrow">LEISURE SPORTS</span>
            <h1 className="sp-hero-title">레저스포츠</h1>
            <p className="sp-hero-desc">인천의 섬에서 즐길 수 있는 레저 종목을 카테고리별로 만나보세요</p>
          </div>
        </header>
      </div>

      <div className="sp-tabs" role="tablist" aria-label="레저 카테고리">
        {SPORTS_CATEGORIES.map((item) => {
          const active = category === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              className={`sp-tab${active ? " is-active" : ""}`}
              aria-selected={active}
              onClick={() => selectCategory(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {selected && (
        <>
          <div className="sp-cat-title-wrap">
            <h2 className="sp-cat-title">{categoryLabel}</h2>
          </div>

          <div className="container sp-content">
            <div className="sp-sport-grid" role="listbox" aria-label={`${categoryLabel} 종목`}>
              {sports.map((sport) => {
                const active = selected.id === sport.id;
                return (
                  <button
                    key={sport.id}
                    type="button"
                    role="option"
                    className={`sp-sport-btn${active ? " is-active" : ""}`}
                    aria-selected={active}
                    onClick={() => setSelectedId(sport.id)}
                  >
                    {sport.name}
                  </button>
                );
              })}
            </div>

            <section className="sp-detail" aria-label={`${selected.name} 상세`}>
              <SportPhoto sport={selected} />
              <div className="sp-detail-info">
                <p className="sp-detail-cat">{categoryLabel}</p>
                <h3 className="sp-detail-name">{selected.name}</h3>
                <p className="sp-detail-desc">{selected.desc}</p>
                <div className="sp-meta" aria-label="종목 정보">
                  <MetaRow label="난이도" value={selected.diff} />
                  <MetaRow label="가격" value={selected.price} />
                  <MetaRow label="가능 시기" value={selected.season} />
                </div>
                <div className="sp-detail-actions">
                  {selected.pay ? (
                    <span className="sp-badge sp-badge--pay">예약/시설 이용</span>
                  ) : (
                    <span className="sp-badge">자유 활동</span>
                  )}
                  <SportCommunityLink sportName={selected.name} />
                </div>
              </div>
            </section>

            <section className="sp-section" aria-labelledby="sp-islands-heading">
              <h3 id="sp-islands-heading" className="sp-section-title">
                이용 가능한 섬 ({selected.islands.length})
              </h3>
              <ul className="sp-island-cards">
                {selected.islands.map((island) => (
                  <li key={`${selected.id}-${island.n}`}>
                    <button
                      type="button"
                      className="sp-island-card"
                      onClick={() => openIsland(island)}
                    >
                      <span
                        className="sp-island-bar"
                        style={{ background: resolveSportIslandAccent(island.n) }}
                        aria-hidden="true"
                      />
                      <span className="sp-island-text">
                        <span className="sp-island-name">{island.n}</span>
                        <span className="sp-island-region">{resolveSportIslandRegion(island.n)}</span>
                      </span>
                      <span className="sp-island-arrow" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <SportBookingSection sport={selected} />
          </div>
        </>
      )}
    </main>
  );
}
