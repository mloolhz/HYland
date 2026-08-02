import { useEffect, useMemo, useRef, useState } from "react";
import { COMMUNITY_ACTIVITY_OPTIONS } from "@/lib/community-activities";

type ActivityFilterProps = {
  selected: Set<string>;
  postCounts: Record<string, number>;
  onApply: (activities: Set<string>) => void;
};

export function ActivityFilter({ selected, postCounts, onApply }: ActivityFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(new Set(selected));
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(new Set(selected));
      setSearch("");
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, selected]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const filteredGroups = useMemo(() => {
    const q = search.trim();
    if (!q) return COMMUNITY_ACTIVITY_OPTIONS;
    return COMMUNITY_ACTIVITY_OPTIONS.map((group) => ({
      ...group,
      activities: group.activities.filter((name) => name.includes(q) || group.label.includes(q)),
    })).filter((group) => group.activities.length > 0);
  }, [search]);

  const toggle = (name: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const label = useMemo(() => {
    if (selected.size === 0) return "레저 종목";
    if (selected.size === 1) return [...selected][0];
    return `${[...selected][0]} 외 ${selected.size - 1}`;
  }, [selected]);

  return (
    <div className="cm-island-filter cm-activity-filter" ref={panelRef}>
      <button
        type="button"
        className={`cm-island-trigger${selected.size > 0 ? " has-selection" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🏄</span> {label} ▾
      </button>

      {open && (
        <div className="cm-island-panel" role="listbox" aria-multiselectable="true">
          <input
            ref={searchRef}
            type="search"
            className="cm-island-search"
            placeholder="종목 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="cm-island-options">
            {filteredGroups.map((group) => (
              <div key={group.key} className="cm-island-group">
                <div className="cm-island-group-title">{group.label}</div>
                {group.activities.map((activity) => (
                  <button
                    key={activity}
                    type="button"
                    role="option"
                    aria-selected={draft.has(activity)}
                    className="cm-island-option"
                    onClick={() => toggle(activity)}
                  >
                    <input
                      type="checkbox"
                      checked={draft.has(activity)}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="cm-island-option-name">{activity}</span>
                    <span className="cm-island-option-count">({postCounts[activity] ?? 0})</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="cm-island-panel-actions">
            <button type="button" className="cm-island-reset" onClick={() => setDraft(new Set())}>
              초기화
            </button>
            <button
              type="button"
              className="cm-island-apply"
              onClick={() => {
                onApply(new Set(draft));
                setOpen(false);
              }}
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
