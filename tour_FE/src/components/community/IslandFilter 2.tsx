import { useEffect, useMemo, useRef, useState } from "react";
import { ISLAND_CATALOG } from "@/constants/island";

type IslandFilterProps = {
  selected: Set<string>;
  postCounts: Record<string, number>;
  onApply: (islands: Set<string>) => void;
};

export function IslandFilter({ selected, postCounts, onApply }: IslandFilterProps) {
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

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return ISLAND_CATALOG;
    return ISLAND_CATALOG.filter((i) => i.name.includes(q) || i.region.includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof ISLAND_CATALOG>();
    for (const island of filtered) {
      const list = map.get(island.region) ?? [];
      list.push(island);
      map.set(island.region, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const toggle = (name: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const label = useMemo(() => {
    if (selected.size === 0) return "섬 선택";
    if (selected.size === 1) return [...selected][0];
    return `${[...selected][0]} 외 ${selected.size - 1}`;
  }, [selected]);

  return (
    <div className="cm-island-filter" ref={panelRef}>
      <button
        type="button"
        className={`cm-island-trigger${selected.size > 0 ? " has-selection" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🏝</span> {label} ▾
      </button>

      {open && (
        <div className="cm-island-panel" role="listbox" aria-multiselectable="true">
          <input
            ref={searchRef}
            type="search"
            className="cm-island-search"
            placeholder="섬 이름 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="cm-island-options">
            {grouped.map(([region, islands]) => (
              <div key={region} className="cm-island-group">
                <div className="cm-island-group-title">{region}</div>
                {islands.map((island) => (
                  <button
                    key={island.name}
                    type="button"
                    role="option"
                    aria-selected={draft.has(island.name)}
                    className="cm-island-option"
                    onClick={() => toggle(island.name)}
                  >
                    <input
                      type="checkbox"
                      checked={draft.has(island.name)}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span
                      className="cm-island-dot"
                      style={{ background: island.accent }}
                      aria-hidden="true"
                    />
                    <span className="cm-island-option-name">{island.name}</span>
                    <span className="cm-island-option-count">({postCounts[island.name] ?? 0})</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="cm-island-panel-actions">
            <button
              type="button"
              className="cm-island-reset"
              onClick={() => setDraft(new Set())}
            >
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
