import { getTripConditionChips } from "@/lib/ai-trip-labels";
import type { TripIntent } from "@/types/recommendation";
import { FilterIcon } from "./AiRecommendIcons";

type AiTripConditionsSummaryProps = {
  trip: TripIntent;
  onClose: () => void;
  onOpenSettings: () => void;
};

export function AiTripConditionsSummary({
  trip,
  onClose,
  onOpenSettings,
}: AiTripConditionsSummaryProps) {
  const chips = getTripConditionChips(trip);

  return (
    <div className="ai-conditions-bar">
      <div className="ai-conditions-bar__head">
        <button type="button" className="ai-conditions-bar__title" onClick={onOpenSettings}>
          <FilterIcon />
          <span>여행 조건</span>
        </button>
        <button type="button" className="ai-conditions-bar__close" onClick={onClose} aria-label="여행 조건 닫기">
          ×
        </button>
      </div>
      <div className="ai-conditions-bar__chips">
        {chips.map((chip) => (
          <span key={chip} className="ai-conditions-chip">
            {chip}
          </span>
        ))}
        <button type="button" className="ai-conditions-chip ai-conditions-chip--add" onClick={onOpenSettings}>
          + 활동
        </button>
      </div>
    </div>
  );
}
