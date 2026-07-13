import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNotifications } from "@/store/notifications";
import type { Notification } from "@/store/notifications";

function isScrollbarClick(el: HTMLElement, e: PointerEvent) {
  const rect = el.getBoundingClientRect();
  const sbW = el.offsetWidth - el.clientWidth;
  const sbH = el.offsetHeight - el.clientHeight;
  if (sbW > 0 && e.clientX >= rect.right - sbW && e.clientX <= rect.right) {
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) return true;
  }
  if (sbH > 0 && e.clientY >= rect.bottom - sbH && e.clientY <= rect.bottom) {
    if (e.clientX >= rect.left && e.clientX <= rect.right) return true;
  }
  return false;
}

export function NotificationBell() {
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const liveId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const list = listRef.current;
      if (list && isScrollbarClick(list, e)) return;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const menuItems = listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!menuItems?.length) return;
      e.preventDefault();
      const list = [...menuItems];
      const idx = list.indexOf(document.activeElement as HTMLElement);
      const next =
        e.key === "ArrowDown"
          ? list[(idx + 1 + list.length) % list.length]
          : list[(idx - 1 + list.length) % list.length];
      next?.focus();
    };

    const onScroll = (e: Event) => {
      const t = e.target;
      if (t instanceof Node && dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    requestAnimationFrame(() => {
      const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const onItemClick = (n: Notification) => {
    markAsRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const ariaLabel =
    unreadCount > 0 ? `알림, 읽지 않은 알림 ${unreadCount}개` : "알림";

  return (
    <div className="noti-bell-wrap" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`noti-bell-btn${open ? " is-open" : ""}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <i className="ti ti-bell" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="noti-bell-dot"
            aria-label={`읽지 않은 알림 ${unreadCount}개`}
          />
        )}
      </button>

      <span id={liveId} className="sr-only" aria-live="polite" />

      {open && (
        <NotificationDropdown
          items={items}
          unreadCount={unreadCount}
          onItemClick={onItemClick}
          onMarkAllRead={markAllAsRead}
          onClose={() => setOpen(false)}
          listRef={listRef}
          dropdownRef={dropdownRef}
        />
      )}
    </div>
  );
}
