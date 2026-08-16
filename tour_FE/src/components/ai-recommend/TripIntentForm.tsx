import { Link } from "react-router-dom";
import { TripDateRangePicker } from "@/components/ai-recommend/TripDateRangePicker";
import type { TripIntent } from "@/types/recommendation";

export type TripIntentFormValue = TripIntent;

type TripIntentFormProps = {
  value: TripIntentFormValue;
  onChange: (next: TripIntentFormValue) => void;
  onSubmit: () => void;
  loading?: boolean;
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

const ACTIVITY_OPTIONS = ["바다", "산책", "카페", "트레킹", "카약", "사이클", "낚시", "갯벌"];

export function TripIntentForm({
  value,
  onChange,
  onSubmit,
  loading = false,
  hasBtiResult = false,
}: TripIntentFormProps) {
  const toggleActivity = (activity: string) => {
    const current = value.activities ?? [];
    const next = current.includes(activity)
      ? current.filter((item) => item !== activity)
      : [...current, activity];
    onChange({ ...value, activities: next });
  };

  return (
    <form
      className="ai-trip-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="ai-trip-form__head">
        <h2>어떤 섬 여행을 떠나볼까요?</h2>
      </div>

      {!hasBtiResult ? (
        <div className="ai-trip-bti-nudge">
          <p>섬BTI를 하면 나에게 더 잘 맞는 섬을 골라줄 수 있어요.</p>
          <Link to="/island-bti/test" className="ai-trip-bti-nudge__link">
            섬BTI 검사하러 가기
          </Link>
        </div>
      ) : null}

      <div className="ai-trip-form__grid">
        <TripDateRangePicker
          startDate={value.travelDate}
          endDate={value.travelEndDate ?? value.travelDate}
          onChange={({ travelDate, travelEndDate, duration }) =>
            onChange({ ...value, travelDate, travelEndDate, duration })
          }
        />

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
          <span>여행 분위기</span>
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

      <fieldset className="ai-trip-fieldset">
        <legend>관심 활동</legend>
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
      </fieldset>

      <button type="submit" className="ai-trip-submit" disabled={loading}>
        {loading ? "추천 계산 중…" : "TOP 3 섬 추천 받기"}
      </button>
    </form>
  );
}
