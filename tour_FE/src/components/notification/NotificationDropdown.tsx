import { Link } from "react-router-dom";
import { NotificationEmpty } from "./NotificationEmpty";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/store/notifications";

interface NotificationDropdownProps {
  items: Notification[];
  unreadCount: number;
  onItemClick: (n: Notification) => void;
  onRemoveAll: () => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  listRef?: React.RefObject<HTMLDivElement | null>;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  style?: React.CSSProperties;
}

export function NotificationDropdown({
  items,
  unreadCount,
  onItemClick,
  onRemoveAll,
  onRemove,
  onClose,
  listRef,
  dropdownRef,
  className,
  style,
}: NotificationDropdownProps) {
  return (
    <div
      className={["noti-dropdown", className].filter(Boolean).join(" ")}
      style={style}
      role="menu"
      aria-label="알림 목록"
      ref={dropdownRef}
    >
      <div className="noti-dropdown-tail" aria-hidden="true" />
      <div className="noti-dropdown-panel">
        <header className="noti-dropdown-head">
          <div className="noti-dropdown-title">
            <span>알림</span>
            {unreadCount > 0 && (
              <span className="noti-count-badge" aria-label={`읽지 않은 알림 ${unreadCount}개`}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            className="noti-mark-all"
            disabled={items.length === 0}
            onClick={onRemoveAll}
          >
            모두 삭제
          </button>
        </header>

        <div className="noti-dropdown-list" ref={listRef}>
          {items.length === 0 ? (
            <NotificationEmpty />
          ) : (
            items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                variant="dropdown"
                onClick={onItemClick}
                onRemove={onRemove}
              />
            ))
          )}
        </div>

        <div className="noti-dropdown-foot">
          <Link to="/notifications" onClick={onClose}>
            전체 알림 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
