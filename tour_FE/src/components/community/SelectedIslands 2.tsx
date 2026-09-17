import { getIslandColors } from "@/constants/island";

type SelectedIslandsProps = {
  islands: Set<string>;
  onRemove: (name: string) => void;
  onClear: () => void;
};

export function SelectedIslands({ islands, onRemove, onClear }: SelectedIslandsProps) {
  if (islands.size === 0) return null;

  return (
    <div className="cm-selected-islands">
      <span className="cm-selected-label">선택한 섬:</span>
      <div className="cm-selected-chips">
        {[...islands].map((name) => {
          const colors = getIslandColors(name);
          return (
            <span key={name} className="cm-selected-chip" style={{ background: colors.bg, color: colors.text }}>
              {name}
              <button
                type="button"
                aria-label={`${name} 선택 해제`}
                onClick={() => onRemove(name)}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <button type="button" className="cm-selected-clear" onClick={onClear}>
        전체 해제
      </button>
    </div>
  );
}
