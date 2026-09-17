import { Link } from "react-router-dom";
import { TripDateRangePicker } from "@/components/ai-recommend/TripDateRangePicker";
import type { TripIntent } from "@/types/recommendation";

export type TripIntentFormValue = TripIntent;

type AiTripSettingsPanelProps = {
  value: TripIntentFormValue;
  onChange: (next: TripIntentFormValue) => void;
  onApply?: () => void;
  applying?: boolean;
  hasBtiResult?: boolean;
};

const COMPANION_OPTIONS = [
  { value: "solo", label: "혼자" },
  { value: "friend", label: "친구" },
  { value: "couple", label: "연인" },
  { value: "family", label: "가족" },
] as const;

const MOOD_OPTIONS = [
  { value: "healing", label: "힐링" },
  { value: "active", label: "활동" },
  { value: "nature", label: "자연" },
  { value: "social", label: "함께" },
  { value: "adventure", label: "모험" },
] as const;

/**
 * 관심 활동 선택지.
 *
 * 예전 8종으로는 수집된 레저시설 145곳 중 60곳(41%)을 아예 요청할 수 없었다.
 * 특히 캠핑은 36곳으로 가장 많은데 고를 방법이 없어서, 캠핑·온천이 강점인
 * 석모도 같은 섬은 조건을 어떻게 넣든 추천에 오를 수 없었다.
 * 시설이 실제로 있는 활동을 선택지로 열어준다.
 */
const ACTIVITY_OPTIONS = [
  "바다",
  "산책",
  "카페",
  "트레킹",
  "카약",
  "사이클",
  "낚시",
  "갯벌",
  "캠핑",
  "온천",
  "골프",
];

export function AiTripSettingsPanel({
  value,
  onChange,
  onApply,
  applying = false,
  hasBtiResult = false,
}: AiTripSettingsPanelProps) {
  const toggleActivity = (activity: string) => {
    const current = value.activities ?? [];
    const next = current.includes(activity)
      ? current.filter((item) => item !== activity)
      : [...current, activity];
    onChange({ ...value, activities: next });
  };

  return (
    <div className="ai-settings-panel">
      {!hasBtiResult ? (
        <div className="ai-settings-panel__bti">
          <span>섬BTI를 하면 더 정확한 추천을 받을 수 있어요.</span>
          <Link to="/island-bti/test">섬BTI 검사하기</Link>
        </div>
      ) : null}

      <TripDateRangePicker
        startDate={value.travelDate}
        endDate={value.travelEndDate ?? value.travelDate}
        onChange={({ travelDate, travelEndDate, duration }) =>
          onChange({ ...value, travelDate, travelEndDate, duration })
        }
      />

      <div className="ai-settings-panel__row">
        <label className="ai-trip-field">
          <span>동행</span>
          <select
            value={value.companion ?? "friend"}
            onChange={(event) =>
              onChange({ ...value, companion: event.target.value as TripIntentFormValue["companion"] })
            }
          >
            {COMPANION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="ai-trip-field">
          <span>분위기</span>
          <select
            value={value.travelMood ?? "healing"}
            onChange={(event) =>
              onChange({ ...value, travelMood: event.target.value as TripIntentFormValue["travelMood"] })
            }
          >
            {MOOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ai-trip-field">
        <span>관심 활동</span>
        <div className="ai-trip-chips">
          {ACTIVITY_OPTIONS.map((activity) => {
            const selected = value.activities?.includes(activity) ?? false;
            return (
              <button
                key={activity}
                type="button"
                className={`ai-trip-chip${selected ? " ai-trip-chip--active" : ""}`}
                onClick={() => toggleActivity(activity)}
              >
                {activity}
              </button>
            );
          })}
        </div>
      </div>

      {onApply ? (
        <button type="button" className="ai-settings-panel__apply" onClick={onApply} disabled={applying}>
          {applying ? "추천 준비 중…" : "적용하기"}
        </button>
      ) : null}
    </div>
  );
}
