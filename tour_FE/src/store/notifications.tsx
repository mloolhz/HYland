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
import { MOCK_NOTIFICATIONS } from "@/mocks/notifications";
import { useSession } from "@/store/session";

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

const NotificationContext = createContext<NotificationStore | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession();
  /**
   * 알림은 아직 mock 이다(테이블이 없다). 다만 로그인도 안 한 방문자에게
   * "회원님의 글에 댓글이 달렸어요" 같은 남의 알림이 보이면 안 되므로
   * 비로그인일 때는 비워 둔다.
   */
  const [items, setItems] = useState<Notification[]>(() =>
    isLoggedIn ? [...MOCK_NOTIFICATIONS] : [],
  );

  useEffect(() => {
    setItems(isLoggedIn ? [...MOCK_NOTIFICATIONS] : []);
  }, [isLoggedIn]);

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

  const removeAll = useCallback(() => {
    setItems([]);
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
