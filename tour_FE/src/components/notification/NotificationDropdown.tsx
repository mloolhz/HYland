import { Link } from "react-router-dom";
import { NotificationEmpty } from "./NotificationEmpty";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/store/notifications";

interface NotificationDropdownProps {
  items: Notification[];
  unreadCount: number;
  onItemClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  listRef?: React.RefObject<HTMLDivElement | null>;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
}

export function NotificationDropdown({
  items,
  unreadCount,
  onItemClick,
  onMarkAllRead,
  onClose,
  listRef,
  dropdownRef,
}: NotificationDropdownProps) {
  return (
    <div
      className="noti-dropdown"
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
            disabled={unreadCount === 0}
            onClick={onMarkAllRead}
          >
            모두 읽음
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
