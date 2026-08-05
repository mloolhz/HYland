export type ReservationType = "reservable" | "free" | "community" | "info" | "mixed";

export type InfoSource = {
  provider: string;
  url: string;
  tel?: string;
  note?: string;
  /** 종목 reservationType이 mixed일 때 출처별 예약/정보 구분 */
  linkType?: "reservable" | "info";
};

export type SportInfoConfig = {
  reservationType: ReservationType;
  sources: InfoSource[];
};

const ISUM_PORTAL =
  "https://isum.incheon.go.kr/theme/list.do?key=2407020013&themeType=102";

const TOUR08_PACKAGE: InfoSource = {
  provider: "여행공방",
  url: "https://www.tour08.co.kr/home/event/event_view.asp?te_idx=130",
  note: "패키지 포함",
};

const YMCA_SUP = "https://ymcacamp.kr/practice/sup/";
const YMCA_MUD = "https://ymcacamp.kr/practice/experience-mudflats/";
const YMCA_FISH = "https://ymcacamp.kr/practice/fishing/";
const YMCA_SUNSET = "https://ymcacamp.kr/practice/sunset/";

/** 종목 id → 예약/정보 출처 (확정 매핑) */
export const SPORT_INFO_BY_ID: Record<string, SportInfoConfig> = {
  // ── 해상 레저 ──
  kayak: { reservationType: "community", sources: [] },
  surf: {
    reservationType: "reservable",
    sources: [{ provider: "영흥해양센터", url: YMCA_SUP }],
  },
  cruise: {
    reservationType: "reservable",
    sources: [
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA21120317455882593",
      },
    ],
  },
  paddle: {
    reservationType: "reservable",
    sources: [{ provider: "영흥해양센터", url: YMCA_SUP }],
  },

  // ── 육상 레저 ──
  trek: {
    reservationType: "free",
    sources: [
      { provider: "인천 섬포털", url: ISUM_PORTAL },
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA21120213172307287",
      },
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/forest_road.jsp",
      },
    ],
  },
  cycle: {
    reservationType: "reservable",
    sources: [
      { provider: "인천 섬포털", url: ISUM_PORTAL },
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/thmtour/thmtour/detail.do?cotId=ITA21120317342665650",
      },
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/bike/all.jsp",
      },
    ],
  },
  camp: {
    reservationType: "reservable",
    sources: [
      { provider: "인천투어", url: "https://itour.incheon.go.kr/ssst/ssst/list.do" },
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/camping.jsp",
      },
    ],
  },
  backpack: {
    reservationType: "free",
    sources: [
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/thmtour/rcmdtour/detail.do?cotId=ITA21120317561173061",
      },
    ],
  },

  // ── 체험 ──
  mud: {
    reservationType: "mixed",
    sources: [
      { ...TOUR08_PACKAGE, linkType: "reservable" },
      { provider: "영흥해양센터", url: YMCA_MUD, linkType: "info" },
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/experience_beach.jsp",
        linkType: "info",
      },
    ],
  },
  fish: {
    reservationType: "mixed",
    sources: [
      { ...TOUR08_PACKAGE, linkType: "reservable" },
      { provider: "영흥해양센터", url: YMCA_FISH, linkType: "info" },
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/experience_fishing.jsp",
        linkType: "info",
      },
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/ssst/ssst/list.do",
        linkType: "info",
      },
    ],
  },
  pool: {
    reservationType: "reservable",
    sources: [
      { provider: "대이작도 풀등탐방", url: "https://www.puldeung.com/" },
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/nature_grassy.jsp",
      },
    ],
  },
  night: {
    reservationType: "reservable",
    sources: [{ provider: "영흥해양센터", url: YMCA_MUD }],
  },
  zip: {
    reservationType: "reservable",
    sources: [
      {
        provider: "인천 섬포털",
        url: "https://isum.incheon.go.kr/spot/view.do?spotSn=2407300002&key=2407020020",
        tel: "032-746-6886",
      },
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/ssst/ssst/detail.do?cotId=APD21120710052516992",
      },
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/zipline.jsp",
      },
    ],
  },
  monorail: {
    reservationType: "reservable",
    sources: [
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/monorail.jsp",
      },
    ],
  },
  luge: {
    reservationType: "reservable",
    sources: [
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/luge.jsp",
      },
    ],
  },

  // ── 힐링 ──
  forest: {
    reservationType: "free",
    sources: [
      {
        provider: "인천투어",
        url: "https://itour.incheon.go.kr/ssst/ssst/detail.do?cotId=ITD22012113492732038",
      },
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/forest.jsp",
      },
    ],
  },
  sunset: {
    reservationType: "free",
    sources: [{ provider: "영흥해양센터", url: YMCA_SUNSET }],
  },
  seal: {
    reservationType: "info",
    sources: [
      {
        provider: "인천 섬포털",
        url: "https://isum.incheon.go.kr/theme/view.do?key=2407020012&themeType=106&themeSn=2408050005",
      },
    ],
  },
  walk: {
    reservationType: "free",
    sources: [
      {
        provider: "옹진문화관광",
        url: "https://www.ongjin.go.kr/open_content/tour/thema/seaside.jsp",
      },
    ],
  },
  star: {
    reservationType: "reservable",
    sources: [TOUR08_PACKAGE],
  },
  village: {
    reservationType: "reservable",
    sources: [
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/ex_farm.jsp",
      },
    ],
  },
  spa: {
    reservationType: "free",
    sources: [
      {
        provider: "강화군 문화관광",
        url: "https://www.ganghwa.go.kr/open_content/tour/trip/ex_spa.jsp",
      },
    ],
  },
};

export function getSportInfo(sportId: string): SportInfoConfig {
  return SPORT_INFO_BY_ID[sportId] ?? { reservationType: "free", sources: [] };
}

export function sourceButtonLabel(source: InfoSource, _reservationType?: ReservationType): string {
  const packageSuffix = source.note ? ` (${source.note})` : "";
  return `${source.provider}${packageSuffix}`;
}
