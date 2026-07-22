function dateParts(iso: string) {
  const d = new Date(iso);
  return {
    yyyy: d.getFullYear(),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
    dd: String(d.getDate()).padStart(2, "0"),
    hh: String(d.getHours()).padStart(2, "0"),
    min: String(d.getMinutes()).padStart(2, "0"),
  };
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatShortDate(iso);
}

export function formatShortDate(iso: string): string {
  const { mm, dd } = dateParts(iso);
  return `${mm}-${dd}`;
}

export function formatCalendarDate(iso: string): string {
  const { yyyy, mm, dd } = dateParts(iso);
  return `${yyyy}.${mm}.${dd}`;
}

export function formatDetailDate(iso: string): string {
  const { yyyy, mm, dd, hh, min } = dateParts(iso);
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export function formatListDate(iso: string): string {
  return formatCalendarDate(iso);
}
