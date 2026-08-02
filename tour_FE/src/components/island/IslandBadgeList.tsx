import { PassportStamp } from "@/components/landing/PassportStamp";
import { toPassportBadgeView, type IslandCollectibleBadge } from "@/lib/island-badges";

type IslandBadgeListProps = {
  islandName: string;
  badges: IslandCollectibleBadge[];
};

export function IslandBadgeList({ islandName, badges }: IslandBadgeListProps) {
  if (badges.length === 0) return null;

  const earnedCount = badges.filter((badge) => badge.earned).length;

  return (
    <section className="isl-detail-block isl-badge-section">
      <div className="isl-badge-section-head">
        <h4>수집 배지</h4>
        <span className="isl-badge-count">
          {earnedCount}/{badges.length}
        </span>
      </div>
      <div className="isl-badge-stamps" role="list">
        {badges.map((badge, index) => (
          <PassportStamp
            key={badge.id}
            badge={toPassportBadgeView(badge, islandName, index)}
          />
        ))}
      </div>
    </section>
  );
}
