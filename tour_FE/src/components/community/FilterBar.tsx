import { SegmentedToggle } from "./SegmentedToggle";
import type { PostType } from "@/types/community";
import type { SortKey } from "@/lib/posts";
import { IslandFilter } from "./IslandFilter";

export type FilterValue = "all" | PostType;
export type ViewKey = "list" | "gallery";

type FilterBarProps = {
  active: FilterValue;
  view: ViewKey;
  sort: SortKey;
  selectedIslands: Set<string>;
  islandPostCounts: Record<string, number>;
  onFilterChange: (value: FilterValue) => void;
  onViewChange: (value: ViewKey) => void;
  onSortChange: (value: SortKey) => void;
  onIslandsApply: (islands: Set<string>) => void;
};

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "review", label: "후기" },
  { value: "photo", label: "인증샷" },
  { value: "question", label: "질문" },
];

function IconList() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function FilterBar({
  active,
  view,
  sort,
  selectedIslands,
  islandPostCounts,
  onFilterChange,
  onViewChange,
  onSortChange,
  onIslandsApply,
}: FilterBarProps) {
  return (
    <div className="cm-filter-bar">
      <div className="cm-filter-left">
        <div className="cm-filter-pills" role="tablist" aria-label="게시글 필터">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active === f.value}
              className={`cm-filter-pill${active === f.value ? " is-active" : ""}`}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <IslandFilter
          selected={selectedIslands}
          postCounts={islandPostCounts}
          onApply={onIslandsApply}
        />
      </div>
      <div className="cm-filter-controls">
        <SegmentedToggle
          label="보기 방식"
          value={view}
          options={[
            { value: "list", label: "목록", icon: <IconList /> },
            { value: "gallery", label: "갤러리", icon: <IconGrid /> },
          ]}
          onChange={onViewChange}
        />
        <SegmentedToggle
          label="정렬"
          value={sort}
          options={[
            { value: "latest", label: "최신순" },
            { value: "popular", label: "인기순" },
          ]}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
