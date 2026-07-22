import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { navigateToLink } from "@/lib/navigation";
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

export function NotificationBell({
  placement = "header",
  onDrawerAction,
}: {
  placement?: "header" | "drawer";
  onDrawerAction?: () => void;
}) {
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [drawerDropdownStyle, setDrawerDropdownStyle] = useState<React.CSSProperties>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const liveId = useId();

  const closeDropdown = useCallback(() => {
    setOpen(false);
  }, []);

  const updateDrawerDropdownPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    let right = Math.max(12, window.innerWidth - rect.right);

    if (window.innerWidth - right - width < 12) {
      right = Math.max(12, window.innerWidth - width - 12);
    }

    setDrawerDropdownStyle({
      position: "fixed",
      right,
      bottom: window.innerHeight - rect.top + 8,
      width,
      maxHeight: Math.max(240, rect.top - 20),
      zIndex: 160,
    });
  }, []);

  useEffect(() => {
    if (!open || placement !== "drawer") return;

    updateDrawerDropdownPosition();
    window.addEventListener("resize", updateDrawerDropdownPosition);
    return () => window.removeEventListener("resize", updateDrawerDropdownPosition);
  }, [open, placement, updateDrawerDropdownPosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const list = listRef.current;
      if (list && isScrollbarClick(list, e)) return;
      if (dropdownRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      if (wrapRef.current?.contains(target)) return;
      closeDropdown();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeDropdown();
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
      if (placement === "drawer" && t instanceof Element && t.closest(".nav-drawer")) return;
      closeDropdown();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    if (placement === "header") {
      requestAnimationFrame(() => {
        const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
        first?.focus();
      });
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, placement, closeDropdown]);

  const onItemClick = (n: Notification) => {
    markAsRead(n.id);
    closeDropdown();
    onDrawerAction?.();
    if (n.link) navigateToLink(navigate, n.link);
  };

  const handleClose = () => {
    closeDropdown();
    onDrawerAction?.();
  };

  const ariaLabel =
    unreadCount > 0 ? `알림, 읽지 않은 알림 ${unreadCount}개` : "알림";

  const dropdown = open ? (
    <NotificationDropdown
      items={items}
      unreadCount={unreadCount}
      onItemClick={onItemClick}
      onMarkAllRead={markAllAsRead}
      onClose={handleClose}
      listRef={listRef}
      dropdownRef={dropdownRef}
      className={placement === "drawer" ? "noti-dropdown--drawer" : undefined}
      style={placement === "drawer" ? drawerDropdownStyle : undefined}
    />
  ) : null;

  return (
    <div
      className={`noti-bell-wrap${placement === "drawer" ? " noti-bell-wrap--drawer" : ""}`}
      ref={wrapRef}
    >
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

      {placement === "drawer" && dropdown
        ? createPortal(dropdown, document.body)
        : dropdown}
    </div>
  );
}
