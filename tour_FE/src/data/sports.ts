export type SportIsland = { n: string; c: string };

export type Sport = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  islands: SportIsland[];
  diff: string;
  price: string;
  season: string;
};

export type CategoryKey = "water" | "land" | "exp" | "heal";

export const SPORTS_CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "water", label: "수상레저" },
  { key: "land", label: "육상레저" },
  { key: "exp", label: "체험" },
  { key: "heal", label: "힐링" },
];

export const SPORTS_DATA: Record<CategoryKey, Sport[]> = {
  water: [
    {
      id: "kayak",
      name: "카약",
      icon: "kayak",
      desc: "투명 카약부터 씨카약까지 — 잔잔한 서해 바다 위에서 노를 저으며 섬의 해안선을 감상할 수 있습니다.",
      islands: [
        { n: "시도 (수기해변)", c: "#2563EB" },
        { n: "소이작도", c: "#10B981" },
      ],
      diff: "입문",
      price: "2만원대~",
      season: "5~10월",
    },
    {
      id: "sup",
      name: "SUP",
      icon: "wave",
      desc: "보드 위에 서서 패들을 저으며 서해의 평온한 수면을 즐기는 수상 레저. 초보자도 쉽게 배울 수 있습니다.",
      islands: [{ n: "시도 (수기해변)", c: "#2563EB" }],
      diff: "입문",
      price: "2만원대~",
      season: "6~9월",
    },
    {
      id: "cruise",
      name: "유람선",
      icon: "ship",
      desc: "두무진 해상을 약 50분간 유람하며 코끼리바위, 선대암 등 기암괴석과 점박이물범 서식지를 관찰합니다.",
      islands: [{ n: "백령도 (두무진)", c: "#EF4444" }],
      diff: "누구나",
      price: "2.1만원",
      season: "연중",
    },
    {
      id: "paddle",
      name: "패들보트",
      icon: "propeller",
      desc: "발로 페달을 밟아 움직이는 보트. 가족 단위로 안전하게 바다 위를 즐길 수 있습니다.",
      islands: [{ n: "소이작도", c: "#10B981" }],
      diff: "누구나",
      price: "1만원대~",
      season: "6~9월",
    },
  ],
  land: [
    {
      id: "trek",
      name: "트레킹",
      icon: "mountain",
      desc: "섬마다 고유한 해안길·산길이 있습니다. 바다를 바라보며 걷는 섬 트레킹은 인천 섬 여행의 핵심입니다.",
      islands: [
        { n: "강화도", c: "#F59E0B" },
        { n: "무의도", c: "#2563EB" },
        { n: "신시모도", c: "#2563EB" },
        { n: "덕적도", c: "#8B5CF6" },
        { n: "영흥도", c: "#10B981" },
        { n: "자월도", c: "#10B981" },
        { n: "대이작도", c: "#10B981" },
        { n: "소이작도", c: "#10B981" },
        { n: "승봉도", c: "#10B981" },
        { n: "백령도", c: "#EF4444" },
        { n: "대청도", c: "#EF4444" },
      ],
      diff: "입문~중급",
      price: "무료",
      season: "연중",
    },
    {
      id: "cycle",
      name: "자전거",
      icon: "bike",
      desc: "해안도로와 섬 일주도로를 따라 바닷바람을 맞으며 라이딩. 자전거 대여소가 운영되는 섬에서 즐길 수 있습니다.",
      islands: [
        { n: "강화도", c: "#F59E0B" },
        { n: "신시모도", c: "#2563EB" },
        { n: "덕적도", c: "#8B5CF6" },
        { n: "영흥도", c: "#10B981" },
        { n: "소이작도", c: "#10B981" },
        { n: "백령도", c: "#EF4444" },
      ],
      diff: "입문",
      price: "대여 1만원대~",
      season: "연중",
    },
    {
      id: "camp",
      name: "캠핑·백패킹",
      icon: "tent",
      desc: "해변과 숲이 어우러진 섬에서 별과 파도 소리를 배경으로 특별한 야영을 경험합니다.",
      islands: [
        { n: "무의도", c: "#2563EB" },
        { n: "덕적도", c: "#8B5CF6" },
        { n: "자월도", c: "#10B981" },
        { n: "승봉도", c: "#10B981" },
        { n: "대이작도", c: "#10B981" },
        { n: "강화도", c: "#F59E0B" },
      ],
      diff: "입문",
      price: "무료~2만원",
      season: "4~10월",
    },
  ],
  exp: [
    {
      id: "mud",
      name: "갯벌체험",
      icon: "shovel",
      desc: "썰물 때 드러나는 갯벌에서 바지락, 소라, 동죽 등을 직접 캐보는 체험. 아이부터 어른까지 함께 즐깁니다.",
      islands: [
        { n: "강화도", c: "#F59E0B" },
        { n: "무의도", c: "#2563EB" },
        { n: "신시모도", c: "#2563EB" },
        { n: "영흥도(+선재)", c: "#10B981" },
        { n: "자월도", c: "#10B981" },
        { n: "대이작도", c: "#10B981" },
        { n: "소이작도", c: "#10B981" },
        { n: "승봉도", c: "#10B981" },
        { n: "장봉도", c: "#2563EB" },
        { n: "볼음도", c: "#F59E0B" },
      ],
      diff: "누구나",
      price: "무료~4천원",
      season: "3~11월",
    },
    {
      id: "fish",
      name: "낚시",
      icon: "fish",
      desc: "갯바위 낚시, 배낚시, 통발 낚시 등 다양한 방식으로 서해 바다의 손맛을 경험합니다.",
      islands: [
        { n: "무의도", c: "#2563EB" },
        { n: "신시모도", c: "#2563EB" },
        { n: "덕적도", c: "#8B5CF6" },
        { n: "영흥도", c: "#10B981" },
        { n: "자월도", c: "#10B981" },
        { n: "대이작도", c: "#10B981" },
        { n: "소이작도", c: "#10B981" },
        { n: "승봉도", c: "#10B981" },
        { n: "장봉도", c: "#2563EB" },
      ],
      diff: "입문~중급",
      price: "무료~5만원",
      season: "연중",
    },
    {
      id: "pool",
      name: "풀등 체험",
      icon: "wave",
      desc: "하루 두 번 썰물 때만 나타나는 신비로운 모래섬. 대이작도에서만 경험할 수 있는 고유 체험입니다.",
      islands: [{ n: "대이작도", c: "#10B981" }],
      diff: "누구나",
      price: "무료",
      season: "연중",
    },
    {
      id: "night",
      name: "해루질",
      icon: "moon",
      desc: "밤에 랜턴을 들고 갯벌에서 참소라, 고동 등 해산물을 직접 채취하는 활동.",
      islands: [
        { n: "승봉도", c: "#10B981" },
        { n: "소이작도", c: "#10B981" },
      ],
      diff: "초급",
      price: "무료",
      season: "4~10월",
    },
    {
      id: "zip",
      name: "짚라인",
      icon: "zipline",
      desc: "높은 곳에서 와이어를 타고 바다 위를 활강하는 짜릿한 체험.",
      islands: [
        { n: "강화도", c: "#F59E0B" },
        { n: "무의도 (하나개)", c: "#2563EB" },
      ],
      diff: "초급",
      price: "2만원대~",
      season: "3~11월",
    },
    {
      id: "atv",
      name: "ATV",
      icon: "wheel",
      desc: "해변과 숲길을 사륜바이크로 달리는 액티비티. 무의도 하나개 유원지에서 운영합니다.",
      islands: [{ n: "무의도", c: "#2563EB" }],
      diff: "초급",
      price: "2만원대~",
      season: "연중",
    },
    {
      id: "luge",
      name: "루지",
      icon: "sled",
      desc: "무동력 카트를 타고 경사로를 달리는 스릴 있는 체험. 강화도에서 즐길 수 있습니다.",
      islands: [{ n: "강화도", c: "#F59E0B" }],
      diff: "누구나",
      price: "1만원대~",
      season: "연중",
    },
  ],
  heal: [
    {
      id: "forest",
      name: "산림욕",
      icon: "trees",
      desc: "100년 넘은 해송 군락과 피톤치드 가득한 숲길을 거닐며 몸과 마음을 치유합니다.",
      islands: [
        { n: "덕적도 (서포리)", c: "#8B5CF6" },
        { n: "강화도", c: "#F59E0B" },
      ],
      diff: "누구나",
      price: "무료",
      season: "연중",
    },
    {
      id: "sunset",
      name: "일몰 감상",
      icon: "sunset",
      desc: "서해 바다로 떨어지는 붉은 노을. 인천 섬 어디서든 만날 수 있는 최고의 힐링입니다.",
      islands: [
        { n: "무의도", c: "#2563EB" },
        { n: "신시모도", c: "#2563EB" },
        { n: "자월도", c: "#10B981" },
        { n: "영흥도", c: "#10B981" },
        { n: "장봉도", c: "#2563EB" },
      ],
      diff: "누구나",
      price: "무료",
      season: "연중",
    },
    {
      id: "seal",
      name: "물범 관찰",
      icon: "eye",
      desc: "멸종위기 점박이물범이 서식하는 백령도 해역에서 유람선을 타고 야생 물범을 관찰합니다.",
      islands: [{ n: "백령도", c: "#EF4444" }],
      diff: "누구나",
      price: "유람선 포함",
      season: "4~11월",
    },
    {
      id: "walk",
      name: "해안 산책",
      icon: "walk",
      desc: "해안 둘레길과 해상 탐방로를 걸으며 파도 소리와 바다 풍경을 즐기는 여유로운 산책.",
      islands: [
        { n: "영흥도 (십리포)", c: "#10B981" },
        { n: "무의도 (해상탐방로)", c: "#2563EB" },
        { n: "강화도", c: "#F59E0B" },
      ],
      diff: "누구나",
      price: "무료",
      season: "연중",
    },
    {
      id: "star",
      name: "은하수 체험",
      icon: "stars",
      desc: "도심에서 볼 수 없는 은하수를 전문가 해설과 함께 감상하는 프로그램.",
      islands: [
        { n: "소이작도", c: "#10B981" },
        { n: "자월도", c: "#10B981" },
      ],
      diff: "누구나",
      price: "프로그램 포함",
      season: "4~10월",
    },
    {
      id: "village",
      name: "섬마을 투어",
      icon: "home",
      desc: "섬 주민 가이드와 함께 마을의 역사와 생활을 듣고 체험하는 문화 프로그램.",
      islands: [
        { n: "소이작도", c: "#10B981" },
        { n: "신시모도", c: "#2563EB" },
      ],
      diff: "누구나",
      price: "프로그램 포함",
      season: "연중",
    },
    {
      id: "spa",
      name: "온천·스파",
      icon: "droplet",
      desc: "석모도 미네랄 온천에서 바다를 바라보며 온천욕을 즐깁니다.",
      islands: [{ n: "석모도 (강화)", c: "#F59E0B" }],
      diff: "누구나",
      price: "1만원대",
      season: "연중",
    },
  ],
};

export function isFreeSport(price: string): boolean {
  return price.includes("무료");
}

export function getInfoCtaLabel(category: CategoryKey): string {
  return category === "exp" ? "체험장 안내" : "코스 정보 보기";
}
