export type NotificationType =
  | "comment"
  | "like"
  | "badge"
  | "booking"
  | "notice"
  | "reply";

export const NOTI_STYLE: Record<
  NotificationType,
  { icon: string; bg: string; color: string }
> = {
  comment: { icon: "ti-message-circle", bg: "#E1F5EE", color: "#0F6E56" },
  like: { icon: "ti-heart", bg: "#FBEAF0", color: "#993556" },
  badge: { icon: "ti-award", bg: "#FAEEDA", color: "#854F0B" },
  booking: { icon: "ti-calendar-check", bg: "#E6F1FB", color: "#0C447C" },
  notice: { icon: "ti-bell", bg: "#E6F1FB", color: "#0C447C" },
  reply: { icon: "ti-corner-down-right", bg: "#E1F5EE", color: "#0F6E56" },
};

export type NotificationFilter = "all" | "unread" | "activity" | "booking" | "notice";

export const NOTI_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "unread", label: "안 읽음" },
  { id: "activity", label: "활동" },
  { id: "booking", label: "예약" },
  { id: "notice", label: "공지" },
];
