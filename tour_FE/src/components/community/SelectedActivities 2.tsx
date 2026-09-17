type SelectedActivitiesProps = {
  activities: Set<string>;
  onRemove: (name: string) => void;
  onClear: () => void;
};

export function SelectedActivities({ activities, onRemove, onClear }: SelectedActivitiesProps) {
  if (activities.size === 0) return null;

  return (
    <div className="cm-selected-islands cm-selected-activities">
      <span className="cm-selected-label">선택한 종목:</span>
      <div className="cm-selected-chips">
        {[...activities].map((name) => (
          <span key={name} className="cm-selected-chip cm-selected-chip--activity">
            {name}
            <button type="button" aria-label={`${name} 선택 해제`} onClick={() => onRemove(name)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <button type="button" className="cm-selected-clear" onClick={onClear}>
        전체 해제
      </button>
    </div>
  );
}
