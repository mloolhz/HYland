import type { InfoSource, ReservationType, SportInfoConfig } from "./sport-info";
import { getSportInfo } from "./sport-info";
import { getIslandColors } from "@/constants/island";

export type SportIsland = {
  /** IslandExplorer `ISLANDS[].id`와 일치. 없으면 목록으로 폴백 */
  id: string | null;
  n: string;
  c: string;
};

export type { InfoSource, ReservationType };

export type Sport = {
  id: string;
  name: string;
  desc: string;
  pay: boolean;
  photo?: string;
  diff: string;
  price: string;
  season: string;
  islands: SportIsland[];
  reservationType: ReservationType;
  sources: InfoSource[];
};

export type CategoryKey = "water" | "land" | "exp" | "heal";

function island(id: string, name: string): SportIsland {
  return { id, n: name, c: getIslandColors(name).accent };
}

function attachInfo(
  data: Record<CategoryKey, Omit<Sport, "reservationType" | "sources">[]>,
): Record<CategoryKey, Sport[]> {
  return Object.fromEntries(
    Object.entries(data).map(([key, list]) => [
      key,
      list.map((sport) => {
        const info: SportInfoConfig = getSportInfo(sport.id);
        return {
          ...sport,
          reservationType: info.reservationType,
          sources: info.sources,
        };
      }),
    ]),
  ) as Record<CategoryKey, Sport[]>;
}

export const SPORTS_CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "water", label: "해상 레저" },
  { key: "land", label: "육상 레저" },
  { key: "exp", label: "체험" },
  { key: "heal", label: "힐링" },
];

/**
 * 섬 id는 IslandExplorer(`@/lib/island-data`) 키에 맞춤.
 * - 시도 → sinsi (신도·시도·모도)
 * - 소이작도·볼음도 → Explorer에 없음 → id:null (목록 폴백)
 */
const RAW_SPORTS_DATA: Record<CategoryKey, Omit<Sport, "reservationType" | "sources">[]> = {
  water: [
    {
      id: "kayak",
      name: "카약",
      pay: true,
      photo: "/카약.png",
      diff: "입문",
      price: "2만원대~",
      season: "5~10월",
      desc: "투명 카약을 타고 잔잔한 서해 위를 미끄러지며 섬의 해안 지형을 가까이서 살펴봅니다. 발밑으로 비치는 맑은 바닷속이 매력입니다.",
      islands: [
        { id: "sinsi", n: "시도 (수기해변)", c: "#2563EB" },
        { id: null, n: "소이작도", c: "#10B981" },
      ],
    },
    {
      id: "surf",
      name: "서핑",
      pay: true,
      photo: "/sports/surf.jpg",
      diff: "초급",
      price: "3~5만원대",
      season: "6~9월",
      desc: "파도를 타고 균형을 잡으며 온몸으로 바다를 느끼는 액티비티. 보드 대여와 기초 강습이 함께 준비되어 있습니다.",
      islands: [{ id: "sinsi", n: "시도 (수기해변)", c: "#2563EB" }],
    },
    {
      id: "cruise",
      name: "유람선",
      pay: true,
      photo: "/sports/cruise.jpg",
      diff: "누구나",
      price: "2.1만원",
      season: "연중",
      desc: "두무진 해상을 약 50분간 유람하며 코끼리바위·선대암 등 기암괴석과 점박이물범 서식지를 배 위에서 감상합니다.",
      islands: [{ id: "baek", n: "백령도 (두무진)", c: "#EF4444" }],
    },
    {
      id: "paddle",
      name: "패들보트",
      pay: true,
      photo: "/sports/paddle.jpg",
      diff: "누구나",
      price: "1만원대~",
      season: "6~9월",
      desc: "발로 페달을 밟아 움직이는 보트로, 가족 단위가 안전하게 바다 위를 즐길 수 있는 무동력 레저입니다.",
      islands: [
        { id: null, n: "소이작도", c: "#10B981" },
        island("yheung", "영흥도"),
      ],
    },
  ],
  land: [
    {
      id: "trek",
      name: "트레킹",
      pay: false,
      photo: "/sports/trek.jpg",
      diff: "입문~중급",
      price: "무료",
      season: "연중",
      desc: "섬마다 고유한 해안길과 산길을 걷습니다. 바다를 바라보며 걷는 섬 트레킹은 인천 섬 여행의 핵심 코스입니다.",
      islands: [
        { id: "gangh", n: "강화도", c: "#F59E0B" },
        { id: "muui", n: "무의도", c: "#2563EB" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
        { id: "deokj", n: "덕적도", c: "#8B5CF6" },
        { id: "yheung", n: "영흥도", c: "#10B981" },
        { id: "jawol", n: "자월도", c: "#10B981" },
        { id: "ijak", n: "대이작도", c: "#10B981" },
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "seungb", n: "승봉도", c: "#10B981" },
        { id: "baek", n: "백령도", c: "#EF4444" },
        { id: "daech", n: "대청도", c: "#EF4444" },
      ],
    },
    {
      id: "cycle",
      name: "자전거",
      pay: true,
      photo: "/sports/cycle.jpg",
      diff: "입문",
      price: "대여 1만원대~",
      season: "연중",
      desc: "해안도로와 섬 일주도로를 따라 바닷바람을 맞으며 라이딩. 대여소가 운영되는 섬에서 즐길 수 있습니다.",
      islands: [
        { id: "gangh", n: "강화도", c: "#F59E0B" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
        { id: "deokj", n: "덕적도", c: "#8B5CF6" },
        { id: "yheung", n: "영흥도", c: "#10B981" },
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "baek", n: "백령도", c: "#EF4444" },
      ],
    },
    {
      id: "camp",
      name: "캠핑",
      pay: true,
      photo: "/sports/camp.jpg",
      diff: "초보 가능",
      price: "무료~3만원 (야영장별 상이)",
      season: "3~11월",
      desc: "데크·취사장·샤워장을 갖춘 섬 야영장에서 파도 소리와 별빛 아래 즐기는 캠핑. 오토캠핑·차박도 가능.",
      islands: [
        island("deokj", "덕적도"),
        island("jawol", "자월도"),
        island("seungb", "승봉도"),
        island("ijak", "대이작도"),
        island("yeongj", "영종도"),
        island("gangh", "강화도"),
        island("seok", "석모도"),
      ],
    },
    {
      id: "backpack",
      name: "백패킹",
      pay: false,
      diff: "중급",
      price: "무료 (배편·식사비 별도)",
      season: "4~11월",
      desc: "배낭을 메고 능선·초원 노지에서 하룻밤을 보내는 활동. 굴업도 개머리언덕은 국내 손꼽히는 백패킹 성지.",
      islands: [island("gureop", "굴업도"), island("jawol", "자월도"), island("deokj", "덕적도")],
    },
  ],
  exp: [
    {
      id: "mud",
      name: "갯벌체험",
      pay: true,
      photo: "/sports/mud.jpg",
      diff: "누구나",
      price: "무료~4천원",
      season: "3~11월",
      desc: "썰물 때 드러나는 갯벌에서 바지락·소라·동죽 등을 직접 캐보는 체험. 아이부터 어른까지 함께 즐깁니다.",
      islands: [
        { id: "gangh", n: "강화도", c: "#F59E0B" },
        { id: "muui", n: "무의도", c: "#2563EB" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
        { id: "yheung", n: "영흥도(+선재)", c: "#10B981" },
        { id: "jawol", n: "자월도", c: "#10B981" },
        { id: "ijak", n: "대이작도", c: "#10B981" },
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "seungb", n: "승봉도", c: "#10B981" },
        { id: "jang", n: "장봉도", c: "#2563EB" },
        { id: null, n: "볼음도", c: "#F59E0B" },
      ],
    },
    {
      id: "fish",
      name: "낚시",
      pay: true,
      photo: "/sports/fish.jpg",
      diff: "입문~중급",
      price: "무료~5만원",
      season: "연중",
      desc: "갯바위 낚시, 배낚시, 통발 낚시 등 다양한 방식으로 서해 바다의 손맛을 경험합니다.",
      islands: [
        { id: "muui", n: "무의도", c: "#2563EB" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
        { id: "deokj", n: "덕적도", c: "#8B5CF6" },
        { id: "yheung", n: "영흥도", c: "#10B981" },
        { id: "jawol", n: "자월도", c: "#10B981" },
        { id: "ijak", n: "대이작도", c: "#10B981" },
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "seungb", n: "승봉도", c: "#10B981" },
        { id: "jang", n: "장봉도", c: "#2563EB" },
      ],
    },
    {
      id: "pool",
      name: "풀등 체험",
      pay: false,
      photo: "/sports/pool.jpg",
      diff: "누구나",
      price: "무료",
      season: "연중(썰물 시)",
      desc: "하루 두 번 썰물 때만 나타나는 신비로운 모래섬. 대이작도에서만 경험할 수 있는 고유 체험입니다.",
      islands: [{ id: "ijak", n: "대이작도", c: "#10B981" }],
    },
    {
      id: "night",
      name: "해루질",
      pay: false,
      photo: "/sports/night.jpg",
      diff: "초급",
      price: "무료",
      season: "4~10월",
      desc: "밤에 랜턴을 들고 갯벌에서 참소라·고동 등 해산물을 직접 채취하는 활동.",
      islands: [
        { id: "seungb", n: "승봉도", c: "#10B981" },
        { id: "yheung", n: "영흥도", c: "#10B981" },
        { id: null, n: "소이작도", c: "#10B981" },
      ],
    },
    {
      id: "zip",
      name: "짚라인",
      pay: true,
      photo: "/sports/zip.jpg",
      diff: "초급",
      price: "2만원대~",
      season: "3~11월",
      desc: "높은 곳에서 와이어를 타고 바다 위를 활강하는 짜릿한 체험.",
      islands: [
        { id: "gangh", n: "강화도", c: "#F59E0B" },
        { id: "muui", n: "무의도 (하나개)", c: "#2563EB" },
      ],
    },
    {
      id: "monorail",
      name: "모노레일",
      pay: true,
      photo: "/sports/monorail.jpg",
      diff: "초급",
      price: "2만원대~",
      season: "연중",
      desc: "강화도 해변 위를 달리는 모노레일 체험. 바다 전망을 즐기며 가족과 함께 탑승할 수 있습니다.",
      islands: [{ id: "gangh", n: "강화도", c: "#F59E0B" }],
    },
    {
      id: "luge",
      name: "루지",
      pay: true,
      photo: "/sports/luge.jpg",
      diff: "누구나",
      price: "1만원대~",
      season: "연중",
      desc: "무동력 카트를 타고 경사로를 달리는 스릴 있는 체험. 강화도에서 즐길 수 있습니다.",
      islands: [{ id: "gangh", n: "강화도", c: "#F59E0B" }],
    },
  ],
  heal: [
    {
      id: "forest",
      name: "산림욕",
      pay: false,
      photo: "/sports/forest.jpg",
      diff: "누구나",
      price: "무료",
      season: "연중",
      desc: "100년 넘은 해송 군락과 피톤치드 가득한 숲길을 거닐며 몸과 마음을 치유합니다.",
      islands: [
        { id: "deokj", n: "덕적도 (서포리)", c: "#8B5CF6" },
        { id: "gangh", n: "강화도", c: "#F59E0B" },
      ],
    },
    {
      id: "sunset",
      name: "일몰 감상",
      pay: false,
      photo: "/sports/sunset.jpg",
      diff: "누구나",
      price: "무료",
      season: "연중",
      desc: "서해 바다로 떨어지는 붉은 노을. 인천 섬 어디서든 만날 수 있는 최고의 힐링입니다.",
      islands: [
        { id: "muui", n: "무의도", c: "#2563EB" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
        { id: "jawol", n: "자월도", c: "#10B981" },
        { id: "yheung", n: "영흥도", c: "#10B981" },
        { id: "jang", n: "장봉도", c: "#2563EB" },
      ],
    },
    {
      id: "seal",
      name: "물범 관찰",
      pay: true,
      photo: "/sports/seal.jpg",
      diff: "누구나",
      price: "유람선 포함",
      season: "4~11월",
      desc: "멸종위기 점박이물범이 서식하는 백령도 해역에서 유람선을 타고 야생 물범을 관찰합니다.",
      islands: [{ id: "baek", n: "백령도", c: "#EF4444" }],
    },
    {
      id: "walk",
      name: "해안 산책",
      pay: false,
      photo: "/sports/walk.jpg",
      diff: "누구나",
      price: "무료",
      season: "연중",
      desc: "해안 둘레길과 해상 탐방로를 걸으며 파도 소리와 바다 풍경을 즐기는 여유로운 산책.",
      islands: [
        { id: "yheung", n: "영흥도 (십리포)", c: "#10B981" },
        { id: "muui", n: "무의도 (해상탐방로)", c: "#2563EB" },
        { id: "gangh", n: "강화도", c: "#F59E0B" },
      ],
    },
    {
      id: "star",
      name: "은하수 체험",
      pay: true,
      photo: "/sports/star.jpg",
      diff: "누구나",
      price: "프로그램 포함",
      season: "4~10월",
      desc: "도심에서 볼 수 없는 은하수를 전문가 해설과 함께 감상하는 프로그램.",
      islands: [
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "jawol", n: "자월도", c: "#10B981" },
      ],
    },
    {
      id: "village",
      name: "섬마을 투어",
      pay: true,
      photo: "/sports/village.jpg",
      diff: "누구나",
      price: "프로그램 포함",
      season: "연중",
      desc: "섬 주민 가이드와 함께 마을의 역사와 생활을 듣고 체험하는 문화 프로그램.",
      islands: [
        { id: null, n: "소이작도", c: "#10B981" },
        { id: "sinsi", n: "신시모도", c: "#2563EB" },
      ],
    },
    {
      id: "spa",
      name: "온천·스파",
      pay: true,
      photo: "/sports/spa.jpg",
      diff: "누구나",
      price: "1만원대",
      season: "연중",
      desc: "석모도 미네랄 온천에서 바다를 바라보며 온천욕을 즐깁니다.",
      islands: [{ id: "seok", n: "석모도 (강화)", c: "#F59E0B" }],
    },
  ],
};

export const SPORTS_DATA = attachInfo(RAW_SPORTS_DATA);
