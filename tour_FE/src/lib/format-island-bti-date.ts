export type IslandBtiDateFormat = "dot" | "korean";

/**
 * ISO 날짜 문자열을 섬BTI UI용으로 포맷합니다.
 * @returns 유효하지 않은 날짜면 null
 */
export function formatIslandBtiDate(
  testedAt: string,
  format: IslandBtiDateFormat = "dot",
): string | null {
  const date = new Date(testedAt);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (format === "korean") {
    return `${year}년 ${month}월 ${day}일`;
  }

  const monthText = String(month).padStart(2, "0");
  const dayText = String(day).padStart(2, "0");
  return `${year}.${monthText}.${dayText}`;
}
