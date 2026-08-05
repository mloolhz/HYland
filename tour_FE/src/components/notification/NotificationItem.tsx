import { useEffect, useRef, useState, type ReactNode } from "react";
import { NOTI_STYLE } from "@/constants/notification";
import type { Notification } from "@/store/notifications";
import { relativeTime } from "@/utils/relativeTime";

function renderMessage(n: Notification) {
  const parts: ReactNode[] = [];
  let remaining = n.message;

  if (n.actor && remaining.includes("{actor}")) {
    const [before, after] = remaining.split("{actor}");
    if (before) parts.push(before);
    parts.push(
      <strong key="actor" className="noti-em">
        {n.actor}
      </strong>,
    );
    remaining = after ?? "";
  }

  if (n.highlight && remaining.includes("{highlight}")) {
    const [before, after] = remaining.split("{highlight}");
    if (before) parts.push(before);
    parts.push(
      <strong key="hl" className="noti-em">
        {n.highlight}
      </strong>,
    );
    remaining = after ?? "";
  }

  if (remaining) parts.push(remaining);
  return parts.length > 0 ? parts : n.message;
}

interface NotificationItemProps {
  notification: Notification;
  variant?: "dropdown" | "page";
  onClick: (n: Notification) => void;
  onRemove?: (id: string) => void;
}

export function NotificationItem({
  notification,
  variant = "dropdown",
  onClick,
  onRemove,
}: NotificationItemProps) {
  const style = NOTI_STYLE[notification.type];
  const unread = !notification.read;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      className={`noti-item noti-item--${variant}${unread ? " is-unread" : " is-read"}`}
      role="menuitem"
      tabIndex={-1}
      onClick={() => onClick(notification)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(notification);
        }
      }}
    >
      {unread && <span className="noti-item-dot" aria-hidden="true" />}
      <span
        className="noti-item-icon"
        style={{ background: style.bg, color: style.color }}
        aria-hidden="true"
      >
        <i className={`ti ${style.icon}`} />
      </span>
      <div className="noti-item-body">
        <p className="noti-item-msg">{renderMessage(notification)}</p>
        <time className="noti-item-time" dateTime={notification.createdAt}>
          {relativeTime(notification.createdAt)}
        </time>
      </div>
      {variant === "dropdown" && onRemove && (
        <button
          type="button"
          className="noti-item-remove"
          aria-label="알림 삭제"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(notification.id);
          }}
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      )}
      {variant === "page" && onRemove && (
        <div className="noti-item-menu" ref={menuRef}>
          <button
            type="button"
            className="noti-item-more"
            aria-label="더보기"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
          >
            <i className="ti ti-dots" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="noti-item-actions is-open">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRemove(notification.id);
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
