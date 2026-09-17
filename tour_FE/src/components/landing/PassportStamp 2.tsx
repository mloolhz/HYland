import type { PassportBadge } from "./passport-book-data";
import { isBadgeAcquired } from "./passport-book-data";
import { getBadgeStampVariant } from "./passport-badge-display";
import { PassportStampArt } from "./PassportStampArt";

type PassportStampProps = {
  badge: PassportBadge;
};

export function PassportStamp({ badge }: PassportStampProps) {
  const variant = getBadgeStampVariant(badge);
  const acquired = variant === "ink";

  return (
    <div className="passport-stamp-wrap" role="listitem">
      <div
        className={`passport-stamp passport-stamp--${variant}`}
        style={{ ["--stamp-rotate" as string]: `${badge.rotate}deg` }}
      >
        <PassportStampArt badge={badge} acquired={acquired} />
      </div>
      {acquired && isBadgeAcquired(badge) && badge.acquiredAt ? (
        <p className="passport-stamp__date">{badge.acquiredAt}</p>
      ) : null}
    </div>
  );
}

type PassportStampGridProps = {
  badges: PassportBadge[];
};

export function PassportStampGrid({ badges }: PassportStampGridProps) {
  return (
    <div className="passport-stamps" role="list">
      {badges.map((badge) => (
        <PassportStamp key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
