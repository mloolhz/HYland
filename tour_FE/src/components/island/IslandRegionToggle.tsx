import { ISLAND_REGIONS, type IslandRegionName } from "@/lib/island-data";

type IslandRegionToggleProps = {
  activeRegion: IslandRegionName | null;
  onChange: (region: IslandRegionName | null) => void;
};

export function IslandRegionToggle({ activeRegion, onChange }: IslandRegionToggleProps) {
  return (
    <div className="isl-region-toggle" role="tablist" aria-label="권역 필터">
      <button
        type="button"
        role="tab"
        aria-selected={activeRegion === null}
        className={`isl-region-toggle__btn${activeRegion === null ? " is-active" : ""}`}
        onClick={() => onChange(null)}
      >
        전체
      </button>
      {ISLAND_REGIONS.map((region) => (
        <button
          key={region}
          type="button"
          role="tab"
          aria-selected={activeRegion === region}
          className={`isl-region-toggle__btn${activeRegion === region ? " is-active" : ""}`}
          onClick={() => onChange(region)}
        >
          {region}
        </button>
      ))}
    </div>
  );
}
