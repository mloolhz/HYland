import type { BookingMethod } from "@/data/sports";

const DODO_OFFICIAL: BookingMethod = {
  type: "official",
  label: "도도하게 살아보기 예약",
  url: "https://www.tour08.co.kr/home/event/event_view.asp?te_idx=130",
};

const ISUM_THEME_LIST =
  "https://isum.incheon.go.kr/theme/list.do?key=2407020013&themeType=102";

const ISUM_INFO: BookingMethod = {
  type: "info",
  label: "인천 섬포털에서 정보 보기",
  url: "https://isum.incheon.go.kr",
};

const ISUM_SPA: BookingMethod = {
  type: "info",
  label: "석모도 온천 정보 보기",
  url: "https://isum.incheon.go.kr",
};

const ISUM_TREK: BookingMethod = {
  type: "info",
  label: "인천 섬포털에서 코스 보기",
  url: ISUM_THEME_LIST,
};

const ISUM_CYCLE: BookingMethod = {
  type: "info",
  label: "인천 섬포털에서 정보 보기",
  url: ISUM_THEME_LIST,
};

const ISUM_CAMP: BookingMethod = {
  type: "info",
  label: "인천 섬포털에서 정보 보기",
  url: ISUM_THEME_LIST,
};

/** 종목 id → 실제 예약/안내처 (웹 조사 기반) */
export const BOOKING_BY_SPORT_ID: Record<string, BookingMethod[]> = {
  zip: [{ type: "facility", label: "하나개 유원지 예약", url: "http://hanagae.com" }],
  atv: [{ type: "facility", label: "하나개 유원지 예약", url: "http://hanagae.com" }],
  luge: [{ type: "facility", label: "강화씨사이드리조트 예매", url: "https://www.ganghwa-resort.co.kr" }],
  cruise: [{ type: "phone", label: "두무진포구 유람선 문의", tel: "032-836-8088" }],
  mud: [
    DODO_OFFICIAL,
    { type: "facility", label: "어촌체험마을 예약", url: "https://cms.seantour.com" },
  ],
  fish: [DODO_OFFICIAL],
  star: [DODO_OFFICIAL],
  kayak: [DODO_OFFICIAL],
  surf: [DODO_OFFICIAL],
  paddle: [DODO_OFFICIAL],
  village: [DODO_OFFICIAL],
  spa: [ISUM_SPA],
  trek: [ISUM_TREK],
  cycle: [ISUM_CYCLE],
  camp: [ISUM_CAMP],
  pool: [
    { type: "official", label: "대이작도 풀등체험 안내", url: "http://daeijakdo.kr/" },
    { type: "phone", label: "풀등 탐방 문의", tel: "010-2480-1155" },
  ],
  night: [ISUM_INFO],
  forest: [ISUM_INFO],
  sunset: [ISUM_INFO],
  seal: [{ type: "phone", label: "두무진 유람선 연계 문의", tel: "032-836-8088" }],
  walk: [ISUM_INFO],
};
