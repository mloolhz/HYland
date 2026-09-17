import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationEmpty } from "@/components/notification/NotificationEmpty";
import { NotificationItem } from "@/components/notification/NotificationItem";
import { navigateToLink } from "@/lib/navigation";
import { CONTAINER } from "@/constants/layout";
import { NOTI_FILTERS, type NotificationFilter } from "@/constants/notification";
import { useNotifications, type Notification } from "@/store/notifications";

const PAGE_SIZE = 6;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const today = startOfDay(now);
  const target = startOfDay(date);
  const dayDiff = Math.round((today - target) / 86_400_000);

  if (dayDiff === 0) return "오늘";
  if (dayDiff === 1) return "어제";

  const weekStart = today - ((now.getDay() + 6) % 7) * 86_400_000;
  if (target >= weekStart) return "이번 주";

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function matchesFilter(n: Notification, filter: NotificationFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "unread":
      return !n.read;
    case "activity":
      return (
        n.type === "comment" ||
        n.type === "like" ||
        n.type === "reply" ||
        n.type === "badge" ||
        n.type === "review"
      );
    case "notice":
      return n.type === "notice";
    default:
      return true;
  }
}

export function Notifications() {
  const { items, markAsRead, remove } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => items.filter((n) => matchesFilter(n, filter)),
    [items, filter],
  );

  const shown = filtered.slice(0, visible);

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of shown) {
      const label = groupLabel(n.createdAt);
      const list = map.get(label) ?? [];
      list.push(n);
      map.set(label, list);
    }
    return [...map.entries()];
  }, [shown]);

  const onItemClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.link) navigateToLink(navigate, n.link);
  };

  return (
    <main className="noti-page">
      <div className={`${CONTAINER} noti-page-inner`}>
        <header className="noti-page-head">
          <h1>알림</h1>
        </header>

        <div className="noti-filters" role="tablist" aria-label="알림 필터">
          {NOTI_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={`noti-filter${filter === f.id ? " is-active" : ""}`}
              onClick={() => {
                setFilter(f.id);
                setVisible(PAGE_SIZE);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="noti-page-empty">
            <NotificationEmpty />
          </div>
        ) : (
          <div className="noti-page-list">
            {groups.map(([label, groupItems]) => (
              <section key={label} className="noti-group">
                <h2 className="noti-group-label">{label}</h2>
                <div className="noti-group-items" role="menu">
                  {groupItems.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      variant="page"
                      onClick={onItemClick}
                      onRemove={remove}
                    />
                  ))}
                </div>
              </section>
            ))}

            {visible < filtered.length && (
              <button
                type="button"
                className="noti-load-more"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                더 보기
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
