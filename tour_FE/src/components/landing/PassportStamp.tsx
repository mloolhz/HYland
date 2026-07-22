import type { ReactNode } from "react";
import type { PassportBadge } from "./passport-book-data";
import { isBadgeAcquired } from "./passport-book-data";

const STAMP_ICONS: Record<PassportBadge["icon"], ReactNode> = {
  compass: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4L14 12L12 20L10 12L12 4Z" fill="currentColor" />
    </svg>
  ),
  hike: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="14" cy="6" r="2" fill="currentColor" />
      <path d="M8 20L11 12L14 14L18 8L20 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  camp: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20L12 6L20 20H4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 14V20" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  cycle: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="16" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 16H14M14 16L16 10H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  kayak: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14C8 10 16 10 20 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  wave: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 14C6 10 9 18 12 14C15 10 18 18 21 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  fish: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12C7 8 13 8 16 12C13 16 7 16 4 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="13" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  lighthouse: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 20H14M11 20V8L12 6L13 8V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12H15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  anchor: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8V18M8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4V6M12 18V20M4 12H6M18 12H20M6.3 6.3L7.7 7.7M16.3 16.3L17.7 17.7M17.7 6.3L16.3 7.7M7.7 16.3L6.3 17.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

type PassportStampProps = {
  badge: PassportBadge;
};

export function PassportStamp({ badge }: PassportStampProps) {
  const acquired = isBadgeAcquired(badge);

  return (
    <div className="passport-stamp-wrap" role="listitem">
      <div
        className={`passport-stamp${acquired ? ` passport-stamp--${badge.color}` : " passport-stamp--locked"}`}
        style={{ ["--stamp-rotate" as string]: `${badge.rotate}deg` }}
      >
        <div className="passport-stamp__ink" aria-hidden="true" />
        <div className="passport-stamp__ring" aria-hidden="true" />
        <div className="passport-stamp__icon">{STAMP_ICONS[badge.icon]}</div>
        <p className="passport-stamp__island">{badge.island}</p>
        <p className="passport-stamp__activity">{badge.activity}</p>
        {!acquired && (
          <span className="passport-stamp__lock" aria-label="미획득">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M9 10V8C9 6.3 10.3 5 12 5C13.7 5 15 6.3 15 8V10" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        )}
      </div>
      {acquired && badge.acquiredAt && <p className="passport-stamp__date">{badge.acquiredAt}</p>}
    </div>
  );
}

type PassportBadgeGridProps = {
  badges: PassportBadge[];
};

export function PassportBadgeGrid({ badges }: PassportBadgeGridProps) {
  return (
    <div className="passport-stamps" role="list">
      {badges.map((badge) => (
        <PassportStamp key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
