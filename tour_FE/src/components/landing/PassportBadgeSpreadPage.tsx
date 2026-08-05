import type { PassportBadge } from "./passport-book-data";
import { PassportStampGrid } from "./PassportStamp";

type PassportBadgeSpreadPageProps = {
  badges: PassportBadge[];
  spreadIndex: number;
  totalSpreads: number;
  side: "left" | "right";
};

export function PassportBadgeSpreadPage({
  badges,
  spreadIndex,
  totalSpreads,
  side,
}: PassportBadgeSpreadPageProps) {
  const showBanner = side === "right" && spreadIndex === 0;

  return (
    <div className={`passport-page passport-page--badges passport-page--${side}`}>
      <div className="passport-page__paper-texture" aria-hidden="true" />
      <div
        className={`passport-page__paper-edge passport-page__paper-edge--${side}`}
        aria-hidden="true"
      />

      <div className="passport-badge-layout">
        <header className="passport-badge-layout__head">
          <h3 className="passport-page__section-label">획득한 배지</h3>
          {side === "right" && (
            <p className="passport-page__page-count">
              {spreadIndex + 1} / {totalSpreads}
            </p>
          )}
        </header>

        <div className="passport-badge-layout__stamps">
          <PassportStampGrid badges={badges} />
        </div>

        {showBanner ? (
          <div className="passport-page__badge-banner" aria-hidden="true">
            <span className="passport-page__badge-banner-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                <path
                  d="M12 4V12L16 14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M12 3L13.2 6.2H16.6L13.8 8.2L14.8 11.4L12 9.4L9.2 11.4L10.2 8.2L7.4 6.2H10.8L12 3Z"
                  fill="currentColor"
                  opacity=".55"
                />
              </svg>
            </span>
          <p className="passport-page__badge-banner-text">
            더 많은 섬을 탐험하고 배지를 모아보세요!
          </p>
            <div className="passport-page__badge-banner-watermark" aria-hidden="true">
              <svg viewBox="0 0 84 52" fill="currentColor">
                <path d="M8 38 L18 22 L28 38 Z" opacity="0.55" />
                <path
                  d="M0 44 C10 40 18 46 28 42 C38 38 48 44 58 40 C68 36 76 42 84 38"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.45"
                />
                <path d="M62 8 C64 14 68 18 72 22 C68 20 64 18 62 8Z" opacity="0.5" />
                <path
                  d="M72 22 V38"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="passport-badge-layout__spacer" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
