import { Link } from "react-router-dom";
import { SportCommunityLink } from "@/components/sports/SportCommunityLink";
import type { RecItem, RecItemBooking } from "@/types/ai-recommend";

type AiRecCardProps = {
  item: RecItem;
};

function SourceButton({ source }: { source: RecItemBooking }) {
  if (source.url) {
    return (
      <a
        className="ai-rec-btn ai-rec-btn--external"
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="ai-rec-btn-copy">
          <span>{source.label}</span>
          {source.note && <span className="ai-rec-phone">{source.note}</span>}
          {source.tel && <span className="ai-rec-phone">전화 문의: {source.tel}</span>}
        </span>
        <span className="ai-rec-external" aria-hidden="true">
          ↗
        </span>
      </a>
    );
  }

  if (source.tel) {
    return (
      <a className="ai-rec-btn ai-rec-btn--primary" href={`tel:${source.tel.replace(/[^\d+]/g, "")}`}>
        {source.label}
        <span className="ai-rec-phone">({source.tel})</span>
      </a>
    );
  }

  return null;
}

export function AiRecCard({ item }: AiRecCardProps) {
  const sources = item.sources ?? [];
  const isCommunityOnly = item.reservationType === "community";

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
        {sources.map((source) => (
          <SourceButton key={`${source.label}-${source.url ?? source.tel}`} source={source} />
        ))}
        {isCommunityOnly && (
          <p className="ai-rec-community-note">예약처 없음 · 커뮤니티에서 후기와 정보를 확인해 보세요.</p>
        )}
        <Link className="ai-rec-btn ai-rec-btn--ghost" to={`/sports?category=${item.categoryKey}`}>
          종목 상세
        </Link>
        <SportCommunityLink sportName={item.name} className="ai-rec-btn ai-rec-btn--community" />
      </div>
    </article>
  );
}
