import type { PassportBadge } from "./passport-book-data";
import { PassportBadgeGrid } from "./PassportStamp";

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
  return (
    <div className={`passport-page passport-page--${side}`}>
      <div className="passport-page__badge-head">
        <h3 className="passport-page__section-label">획득한 배지</h3>
        {side === "right" && (
          <p className="passport-page__page-count">
            {spreadIndex + 1} / {totalSpreads}
          </p>
        )}
      </div>
      <PassportBadgeGrid badges={badges} />
    </div>
  );
}
