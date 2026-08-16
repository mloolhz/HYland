import {
  AiTripSettingsPanel,
  type TripIntentFormValue,
} from "@/components/ai-recommend/AiTripSettingsPanel";
import { AiTripConditionsSummary } from "@/components/ai-recommend/AiTripConditionsSummary";
import { FilterIcon } from "@/components/ai-recommend/AiRecommendIcons";

type AiRecommendComposerProps = {
  variant: "intro" | "chat";
  value: TripIntentFormValue;
  onChange: (next: TripIntentFormValue) => void;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onApplyConditions?: () => void;
  loading?: boolean;
  hasBtiResult?: boolean;
  settingsOpen: boolean;
  onSettingsOpenChange: (open: boolean) => void;
  showConditionsSummary?: boolean;
  onConditionsSummaryChange?: (show: boolean) => void;
};

export function AiRecommendComposer({
  variant,
  value,
  onChange,
  input,
  onInputChange,
  onSubmit,
  onApplyConditions,
  loading = false,
  hasBtiResult = false,
  settingsOpen,
  onSettingsOpenChange,
  showConditionsSummary = false,
  onConditionsSummaryChange,
}: AiRecommendComposerProps) {
  const isIntro = variant === "intro";
  const placeholder = isIntro ? "무엇을 도와드릴까요?" : "이어서 질문하기";
  const showSummary = !isIntro && showConditionsSummary && !settingsOpen;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const toggleSettings = () => {
    onSettingsOpenChange(!settingsOpen);
  };

  return (
    <div className={`ai-composer-wrap${isIntro ? " ai-composer-wrap--intro" : ""}`}>
      {showSummary ? (
        <AiTripConditionsSummary
          trip={value}
          onClose={() => onConditionsSummaryChange?.(false)}
          onOpenSettings={() => onSettingsOpenChange(true)}
        />
      ) : null}

      <form className="ai-composer-row" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`ai-composer-filter${settingsOpen ? " ai-composer-filter--active" : ""}`}
          onClick={toggleSettings}
          aria-label="상세 조건 설정"
          aria-expanded={settingsOpen}
          aria-controls="ai-trip-settings-panel"
        >
          <FilterIcon />
        </button>

        <input
          className="ai-composer-input"
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={loading}
        />

        <button type="submit" className="ai-composer-send" disabled={loading || !input.trim()} aria-label="전송">
          전송
        </button>
      </form>

      <div
        id="ai-trip-settings-panel"
        className={`ai-settings-panel-wrap${settingsOpen ? " ai-settings-panel-wrap--open" : ""}`}
        aria-hidden={!settingsOpen}
      >
        <div className="ai-settings-panel-wrap__inner">
          <AiTripSettingsPanel
            value={value}
            onChange={onChange}
            onApply={onApplyConditions}
            applying={loading}
            hasBtiResult={hasBtiResult}
          />
        </div>
      </div>
    </div>
  );
}
