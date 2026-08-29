import type { InfoSource } from "@/data/sport-info";
import { getSportInfo, sourceButtonLabel } from "@/data/sport-info";

export function getPrimaryInfoSource(sportId: string): InfoSource | undefined {
  const { reservationType, sources } = getSportInfo(sportId);
  if (reservationType === "community" || sources.length === 0) return undefined;
  return sources[0];
}

/**
 * 예약 가능 여부와 무관하게 "이용 정보" 하나로 통일한다.
 * (예약처가 있는 종목도 이용자 입장에서는 모두 이용 정보이므로)
 */
export const BOOKING_SECTION_TITLE = "이용 정보";

/** 안내처 링크가 하나라도 있을 때의 안내 문구 */
export const BOOKING_LEAD_TEXT = "아래에서 이용 정보를 확인할 수 있습니다.";

/** 안내처가 전혀 없는 종목의 안내 문구 */
export const BOOKING_EMPTY_TEXT = "이용 정보가 없는 자유 활동입니다.";

export { sourceButtonLabel };
