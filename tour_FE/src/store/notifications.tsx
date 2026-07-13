import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NotificationType } from "@/constants/notification";
import { MOCK_NOTIFICATIONS } from "@/mocks/notifications";

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
  // TODO: SSE로 실시간 알림 수신 → items 앞에 prepend
}

const NotificationContext = createContext<NotificationStore | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>(() => [...MOCK_NOTIFICATIONS]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markAsRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setItems((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, markAsRead, markAllAsRead, remove }),
    [items, unreadCount, markAsRead, markAllAsRead, remove],
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
