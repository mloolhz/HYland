import { useTabIndicator } from "@/hooks/useTabIndicator";

export type ActivityTab = "posts" | "comments" | "liked";

type ActivityTabsProps = {
  active: ActivityTab;
  counts: { posts: number; comments: number; liked: number };
  onChange: (tab: ActivityTab) => void;
};

const TABS: { key: ActivityTab; label: string }[] = [
  { key: "posts", label: "작성한 글" },
  { key: "comments", label: "작성한 댓글" },
  { key: "liked", label: "내가 누른 좋아요" },
];

export function ActivityTabs({ active, counts, onChange }: ActivityTabsProps) {
  const { listRef, setTabRef, ind } = useTabIndicator(active);

  return (
    <div className="cm-activity-tabs" role="tablist" aria-label="내 활동 탭" ref={listRef}>
      {TABS.map((tab) => {
        const count = counts[tab.key];
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            ref={setTabRef(tab.key)}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`cm-activity-tab${selected ? " is-active" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label} <span className="cm-activity-tab-count">{count}</span>
          </button>
        );
      })}
      <span
        className="cm-tab-indicator"
        aria-hidden="true"
        style={{
          width: ind.width,
          transform: `translateX(${ind.left}px)`,
        }}
      />
    </div>
  );
}
