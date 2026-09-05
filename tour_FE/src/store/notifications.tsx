import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NotificationType } from "@/constants/notification";
import { useSession } from "@/store/session";
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/api/notifications";

export interface Notification {
  id: string;
  type: NotificationType;
  actor?: string;
  message: string;
  /** Emphasized phrase when no actor (e.g. badge name) */
  highlight?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  items: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  removeAll: () => void;
  // TODO: SSE로 실시간 알림 수신 → items 앞에 prepend
}

/** 서버 응답 → 화면이 쓰는 Notification (type 만 좁혀 준다) */
function toNotification(item: NotificationItem): Notification {
  return {
    id: item.id,
    type: item.type as NotificationType,
    actor: item.actor,
    message: item.message,
    highlight: item.highlight,
    link: item.link,
    read: item.read,
    createdAt: item.createdAt,
  };
}

const NotificationContext = createContext<NotificationStore | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession();
  // 서버가 쌓아둔 알림을 읽는다. 비로그인이면 볼 것이 없다.
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }
    let alive = true;
    fetchNotifications()
      .then((res) => {
        if (alive) setItems(res.items.map(toNotification));
      })
      .catch((err: unknown) => {
        console.error("[notifications] 조회 실패:", err);
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // 알림은 되돌릴 것이 별로 없어 화면을 먼저 바꾸고 서버 반영은 뒤따르게 한다
  const markAsRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void markNotificationRead(id).catch((err: unknown) =>
      console.error("[notifications] 읽음 처리 실패:", err),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
    void markAllNotificationsRead().catch((err: unknown) =>
      console.error("[notifications] 전체 읽음 실패:", err),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    void deleteNotification(id).catch((err: unknown) =>
      console.error("[notifications] 삭제 실패:", err),
    );
  }, []);

  const removeAll = useCallback(() => {
    setItems([]);
    void deleteAllNotifications().catch((err: unknown) =>
      console.error("[notifications] 전체 삭제 실패:", err),
    );
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, markAsRead, markAllAsRead, remove, removeAll }),
    [items, unreadCount, markAsRead, markAllAsRead, remove, removeAll],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationStore {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
