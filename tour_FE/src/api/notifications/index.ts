/**
 * 알림 API (tour_BE `/notifications`)
 *
 * 내 글에 댓글·답글·좋아요가 달리거나, 인증이 승인/반려되거나, 배지를 받으면
 * 서버가 쌓아 둔다. 화면은 그걸 읽고 읽음/삭제만 한다.
 */
import { API_BASE } from "@/lib/api-base";
import { ApiError } from "@/api/auth";
import { readToken } from "@/lib/token";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "요청을 처리하지 못했어요.");
  return body as T;
}

export type NotificationItem = {
  id: string;
  type: string;
  actor?: string;
  message: string;
  highlight?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export function fetchNotifications(): Promise<{
  total: number;
  unread: number;
  items: NotificationItem[];
}> {
  return request("/notifications");
}

export function markNotificationRead(id: string): Promise<{ ok: boolean }> {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return request("/notifications/read-all", { method: "PATCH" });
}

export function deleteNotification(id: string): Promise<{ ok: boolean }> {
  return request(`/notifications/${id}`, { method: "DELETE" });
}

export function deleteAllNotifications(): Promise<{ deleted: number }> {
  return request("/notifications", { method: "DELETE" });
}
