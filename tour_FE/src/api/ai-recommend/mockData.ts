import { BOOKING_BY_SPORT_ID } from "@/data/sport-booking";
import { SPORTS_CATEGORIES, SPORTS_DATA, type CategoryKey } from "@/data/sports";
import { getIslandColors } from "@/constants/island";
import type { AiResponse, RecItem } from "@/types/ai-recommend";

const ISLAND_ID: Record<string, string> = {
  무의도: "muui",
  강화도: "gangh",
  영흥도: "yheung",
  덕적도: "deokj",
  백령도: "baek",
  자월도: "jawol",
  석모도: "seok",
};

function findSportMeta(sportId: string): { name: string; categoryKey: CategoryKey; category: string } | null {
  for (const cat of SPORTS_CATEGORIES) {
    const sport = SPORTS_DATA[cat.key].find((s) => s.id === sportId);
    if (sport) {
      return { name: sport.name, categoryKey: cat.key, category: cat.label };
    }
  }
  return null;
}

function toBooking(sportId: string) {
  const method = BOOKING_BY_SPORT_ID[sportId]?.[0];
  if (!method) return undefined;
  return { label: method.label, url: method.url, tel: method.tel };
}

function buildRec(sportId: string, islandName: string): RecItem | null {
  const meta = findSportMeta(sportId);
  if (!meta) return null;
  const colors = getIslandColors(islandName);
  return {
    islandId: ISLAND_ID[islandName] ?? islandName,
    islandName,
    regionColor: colors.accent,
    category: meta.category,
    categoryKey: meta.categoryKey,
    sportId,
    name: meta.name,
    booking: toBooking(sportId),
  };
}

const FAMILY_DAY: AiResponse = {
  text: "가족 당일치기라면 무의도가 딱이에요! 하나개 유원지에서 짚라인·ATV를 즐기고, 잔잔한 물살에서 카약까지 — 아이와 함께 하루 종일 볼거리가 가득해요.",
  recommendations: [
    buildRec("zip", "무의도"),
    buildRec("atv", "무의도"),
    buildRec("kayak", "무의도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "무의도 가족 당일치기 코스",
    steps: [
      { time: "09:00", period: "morning", activity: "인천항 출발 · 무의도 도착", desc: "배편 시간을 미리 확인하고 여유 있게 이동해요." },
      { time: "10:30", period: "morning", activity: "하나개 유원지 · 짚라인", desc: "가족이 함께 즐기기 좋은 스릴 체험으로 하루를 시작해요." },
      { time: "12:30", period: "noon", activity: "점심 · 하나개 해변 산책", desc: "해변 근처 식당에서 식사 후 가벼운 산책을 즐겨요." },
      { time: "14:00", period: "afternoon", activity: "ATV 체험", desc: "숲길과 해변 코스를 사륜바이크로 달려보세요." },
      { time: "16:00", period: "afternoon", activity: "카약 · 투명 카약", desc: "잔잔한 바다 위에서 가족 사진도 남겨요." },
      { time: "18:00", period: "sunset", activity: "일몰 감상 후 귀항", desc: "서해 노을을 보며 하루를 마무리해요." },
    ],
  },
  tips: [
    "하나개 유원지는 주말·성수기 사전 예약을 권장해요.",
    "카약은 바람이 약한 오전·오후 초반이 안전해요.",
    "물때와 배편 시간표를 출발 전에 꼭 확인하세요.",
  ],
  followups: ["비 오면?", "커플용 코스로", "1박2일로"],
};

const COUPLE_DAY: AiResponse = {
  text: "둘만의 여유로운 하루를 원하신다면 영흥도 해안 산책과 일몰 감상이 잘 어울려요. 바다를 바라보며 천천히 걷는 코스가 로맨틱해요.",
  recommendations: [
    buildRec("walk", "영흥도"),
    buildRec("sunset", "영흥도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "영흥도 커플 당일 코스",
    steps: [
      { time: "10:00", period: "morning", activity: "십리포 해안 산책", desc: "소나무 숲과 바다가 어우러진 둘레길을 걸어요." },
      { time: "13:00", period: "noon", activity: "해안 카페 · 점심", desc: "전망 좋은 카페에서 여유로운 시간을 보내요." },
      { time: "16:00", period: "afternoon", activity: "해변 산책", desc: "조용한 해변을 따라 천천히 걸으며 대화해요." },
      { time: "18:30", period: "sunset", activity: "일몰 감상", desc: "서해 노을이 지는 순간을 함께해요." },
    ],
  },
  tips: ["편한 신발과 겉옷을 챙기세요.", "일몰 시간은 계절마다 달라요 — 사전에 확인하세요."],
  followups: ["가족 당일치기 코스로", "비 오면?", "활동적인 코스로"],
};

const HEALING_DAY: AiResponse = {
  text: "힐링을 원하신다면 덕적도 산림욕과 석모도 온천이 좋아요. 자연 속에서 몸과 마음을 쉬어가는 하루를 추천드려요.",
  recommendations: [
    buildRec("forest", "덕적도"),
    buildRec("spa", "석모도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "덕적도 · 석모도 힐링 코스",
    steps: [
      { time: "09:30", period: "morning", activity: "덕적도 서포리 산림욕", desc: "피톤치드 가득한 숲길을 천천히 걸어요." },
      { time: "12:00", period: "noon", activity: "섬 마을 점심", desc: "신선한 해산물로 가볍게 식사해요." },
      { time: "15:00", period: "afternoon", activity: "석모도 온천 · 스파", desc: "미네랄 온천에서 피로를 풀어요." },
      { time: "17:30", period: "sunset", activity: "해안 산책", desc: "온천 후 바닷바람을 맞으며 산책해요." },
    ],
  },
  tips: ["산림욕은 아침·오전이 가장 시원해요.", "온천 이용 전 운영 시간을 확인하세요."],
  followups: ["당일치기로", "활동적인 코스로", "1박2일로"],
};

const RAINY_DAY: AiResponse = {
  text: "비 오는 날에는 실내·체험형 프로그램이 좋아요. 강화도 갯벌 체험(도도하게 살아보기)이나 석모도 온천을 추천해요.",
  recommendations: [
    buildRec("mud", "강화도"),
    buildRec("spa", "석모도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "비 오는 날 대체 코스",
    steps: [
      { time: "10:00", period: "morning", activity: "강화도 갯벌·어촌 체험", desc: "실내·프로그램형 체험으로 날씨 걱정 없이 즐겨요." },
      { time: "14:00", period: "afternoon", activity: "석모도 온천", desc: "따뜻한 온천에서 비 소리를 들으며 휴식해요." },
    ],
  },
  tips: ["우천 시 야외 레저는 취소될 수 있어요.", "체험 프로그램은 사전 예약을 권장합니다."],
  followups: ["가족 당일치기 코스로", "커플용 코스로", "활동적인 코스로"],
};

const OVERNIGHT: AiResponse = {
  text: "1박 2일이라면 자월도 캠핑과 해안 산책이 잘 맞아요. 밤하늘과 바다를 함께 즐길 수 있어요.",
  recommendations: [
    buildRec("camp", "자월도"),
    buildRec("walk", "자월도"),
    buildRec("star", "자월도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "자월도 1박 2일 코스",
    steps: [
      { time: "1일 14:00", period: "afternoon", activity: "자월도 도착 · 캠핑장 세팅", desc: "야영장에 도착해 텐트를 설치해요." },
      { time: "1일 18:00", period: "sunset", activity: "해안 산책 · 일몰", desc: "노을을 보며 저녁을 준비해요." },
      { time: "1일 21:00", period: "dawn", activity: "은하수 체험(프로그램)", desc: "맑은 날 밤하늘을 감상해요." },
      { time: "2일 09:00", period: "morning", activity: "섬 일주 · 해안 산책", desc: "아침 바닷바람을 맞으며 섬을 둘러봐요." },
    ],
  },
  tips: ["캠핑 장비와 방한·방습 용품을 챙기세요.", "은하수 프로그램은 날씨에 따라 달라질 수 있어요."],
  followups: ["당일치기로", "가족 코스로", "비 오면?"],
};

const ACTIVE_DAY: AiResponse = {
  text: "활동적인 하루를 원하신다면 강화도 루지와 무의도 짚라인·ATV 조합을 추천해요!",
  recommendations: [
    buildRec("luge", "강화도"),
    buildRec("zip", "무의도"),
    buildRec("atv", "무의도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "강화도 · 무의도 액티브 코스",
    steps: [
      { time: "10:00", period: "morning", activity: "강화씨사이드리조트 · 루지", desc: "경사로를 달리는 스릴을 먼저 즐겨요." },
      { time: "13:00", period: "noon", activity: "무의도 이동 · 점심", desc: "배편 시간에 맞춰 무의도로 이동해요." },
      { time: "15:00", period: "afternoon", activity: "하나개 짚라인 · ATV", desc: "유원지에서 액티비티를 이어가요." },
    ],
  },
  tips: ["루지와 유원지는 성수기 대기가 있을 수 있어요.", "편한 복장과 운동화를 착용하세요."],
  followups: ["가족 당일치기 코스로", "힐링 코스로", "비 오면?"],
};

const DEFAULT: AiResponse = {
  text: "인천 섬 레저를 즐기고 싶으시군요! 입문자에게는 무의도 카약과 하나개 체험이, 여유를 원하시면 영흥도 해안 산책을 추천해요.",
  recommendations: [
    buildRec("kayak", "무의도"),
    buildRec("walk", "영흥도"),
  ].filter((r): r is RecItem => r !== null),
  course: {
    title: "인천 섬 하루 추천 코스",
    steps: [
      { time: "10:00", period: "morning", activity: "무의도 · 카약 체험", desc: "잔잔한 바다에서 레저를 시작해요." },
      { time: "14:00", period: "afternoon", activity: "영흥도 · 해안 산책", desc: "둘레길을 따라 바다 풍경을 즐겨요." },
      { time: "18:00", period: "sunset", activity: "일몰 감상", desc: "서해 노을로 하루를 마무리해요." },
    ],
  },
  tips: ["섬마다 배편 시간이 다르니 미리 확인하세요.", "날씨와 물때를 체크하면 더 즐거운 여행이 돼요."],
  followups: ["가족 당일치기 코스로", "커플용 코스로", "비 오면?"],
};

function pickScenario(message: string, history?: { role: string; text: string }[]): AiResponse {
  const combined = [
    ...(history?.filter((m) => m.role === "user").map((m) => m.text) ?? []),
    message,
  ]
    .join(" ")
    .toLowerCase();

  if (/비|우천|날씨|rain/.test(combined)) return { ...RAINY_DAY };
  if (/1박|숙박|박|이틀|overnight/.test(combined)) return { ...OVERNIGHT };
  if (/커플|연인|로맨|데이트/.test(combined)) return { ...COUPLE_DAY };
  if (/힐링|쉬|휴식|힐|spa|온천|산림/.test(combined)) return { ...HEALING_DAY };
  if (/활동|액티|짚|atv|루지|스릴/.test(combined)) return { ...ACTIVE_DAY };
  if (/가족|아이|당일|어린이|유아/.test(combined)) return { ...FAMILY_DAY };
  if (/카약|수상|서핑|패들/.test(combined)) {
    return {
      ...DEFAULT,
      text: "수상 레저를 원하시는군요! 무의도 카약과 도도하게 살아보기 프로그램이 입문자에게 인기 있어요.",
      recommendations: [buildRec("kayak", "무의도"), buildRec("surf", "무의도")].filter(
        (r): r is RecItem => r !== null,
      ),
      followups: ["가족 당일치기 코스로", "비 오면?", "커플용 코스로"],
    };
  }
  return { ...DEFAULT };
}

export function buildMockAiResponse(
  userMessage: string,
  history?: { role: "user" | "assistant"; text: string }[],
): AiResponse {
  return pickScenario(userMessage, history);
}
