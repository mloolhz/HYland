import { Link } from "react-router-dom";
import { buildCommunitySportHref } from "@/lib/community-activities";
import type { RecItem } from "@/types/ai-recommend";

type AiRecCardProps = {
  item: RecItem;
};

export function AiRecCard({ item }: AiRecCardProps) {
  const booking = item.booking;

  return (
    <article className="ai-rec-card">
      <div className="ai-rec-card-head">
        <span className="ai-rec-island">
          <span className="ai-rec-dot" style={{ background: item.regionColor }} aria-hidden="true" />
          {item.islandName}
        </span>
        <span className="ai-rec-category">{item.category}</span>
      </div>
      <h5 className="ai-rec-name">{item.name}</h5>
      <div className="ai-rec-actions">
        {booking?.url && (
          <button type="button" className="ai-rec-btn ai-rec-btn--external">
            {booking.label}
            <span className="ai-rec-external" aria-hidden="true">
              ↗
            </span>
          </button>
        )}
        {booking?.tel && !booking.url && (
          <a className="ai-rec-btn ai-rec-btn--primary" href={`tel:${booking.tel.replace(/[^\d+]/g, "")}`}>
            {booking.label}
            <span className="ai-rec-phone">({booking.tel})</span>
          </a>
        )}
        <Link className="ai-rec-btn ai-rec-btn--community" to={buildCommunitySportHref(item.name)}>
          {item.name} 후기 보기
        </Link>
        <Link className="ai-rec-btn ai-rec-btn--ghost" to={`/sports?category=${item.categoryKey}`}>
          종목 상세
        </Link>
      </div>
    </article>
  );
}
