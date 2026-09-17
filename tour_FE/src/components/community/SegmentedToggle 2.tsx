type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type SegmentedToggleProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
};

export function SegmentedToggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedToggleProps<T>) {
  return (
    <div className="cm-segment" role="radiogroup" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`cm-segment-btn${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
          aria-label={opt.label}
          title={opt.label}
        >
          {opt.icon ?? opt.label}
        </button>
      ))}
    </div>
  );
}
