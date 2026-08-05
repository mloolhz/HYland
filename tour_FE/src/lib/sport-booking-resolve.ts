import type { InfoSource, ReservationType } from "@/data/sport-info";
import { getSportInfo, sourceButtonLabel } from "@/data/sport-info";

export function getPrimaryInfoSource(sportId: string): InfoSource | undefined {
  const { reservationType, sources } = getSportInfo(sportId);
  if (reservationType === "community" || sources.length === 0) return undefined;
  return sources[0];
}

export function bookingSectionTitle(reservationType: ReservationType): string {
  if (reservationType === "mixed") return "예약 / 정보 보기";
  if (reservationType === "reservable") return "예약";
  return "이용 정보";
}

export function bookingLeadText(sport: {
  id: string;
  reservationType: ReservationType;
  sources: InfoSource[];
}): string {
  const { reservationType, sources } = sport;

  if (reservationType === "community") {
    return "예약처가 없는 종목입니다. 커뮤니티에서 후기와 정보를 확인해 보세요.";
  }

  if (reservationType === "mixed") {
    return "아래에서 예약·이용 정보를 확인할 수 있습니다.";
  }

  const hasPhoneInquiry = sources.some((source) => Boolean(source.tel));

  if (hasPhoneInquiry) {
    return "아래에서 정보를 확인하고, 필요 시 전화로 문의해 주세요.";
  }

  if (reservationType === "free" || reservationType === "info") {
    if (sport.id === "backpack") {
      return "예약 없이 즐기는 활동입니다. 배편은 사전 예매가 필수입니다. 아래에서 이용 정보를 확인하세요.";
    }
    return "예약 없이 즐기는 활동입니다. 아래에서 이용 정보를 확인하세요.";
  }

  return "이 활동은 아래 안내처에서 예약·이용 정보를 확인할 수 있습니다.";
}

export { sourceButtonLabel };
