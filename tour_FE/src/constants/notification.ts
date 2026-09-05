export type NotificationType =
  | "comment"
  | "like"
  | "badge"
  /** 미션 인증 검수 결과 (승인·반려) */
  | "review"
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
  review: { icon: "ti-clipboard-check", bg: "#ECEAFB", color: "#4A3B93" },
};

/** 모르는 종류가 와도 알림창이 죽지 않도록 하는 기본값 */
export const NOTI_STYLE_FALLBACK = NOTI_STYLE.notice;

export type NotificationFilter = "all" | "unread" | "activity" | "booking" | "notice";

export const NOTI_FILTERS: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "unread", label: "안 읽음" },
  { id: "activity", label: "활동" },
  { id: "booking", label: "예약" },
  { id: "notice", label: "공지" },
];
