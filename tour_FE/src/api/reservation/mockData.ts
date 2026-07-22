import { getIslandColors } from '@/constants/island';
import type { PersonType, Product } from '@/types/reservation';

export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function generateAvailableDates(productId: string): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 45; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const day = d.getDay();
    const dateStr = formatDateLocal(d);

    if (day === 0) continue;

    if (day >= 1 && day <= 5) {
      if (hash(`${productId}:${dateStr}:weekday`) % 10 < 6) {
        dates.push(dateStr);
      }
    } else if (day === 6) {
      if (hash(`${productId}:${dateStr}:sat`) % 3 !== 0) {
        dates.push(dateStr);
      }
    }
  }

  return dates;
}

function adultChild(
  adultPrice: number,
  childPrice: number,
  adultLabel = '성인',
  childLabel = '소인',
): PersonType[] {
  return [
    { key: 'adult', label: adultLabel, price: adultPrice, min: 1, max: 10 },
    { key: 'child', label: childLabel, price: childPrice, min: 0, max: 10 },
  ];
}

function flatPerson(price: number, label = '인원'): PersonType[] {
  return [{ key: 'person', label, price, min: 1, max: 10 }];
}

function regionFor(islandName: string): string {
  return getIslandColors(islandName).accent;
}

type ProductSeed = Omit<Product, 'regionColor' | 'availableDates'> & {
  colorIsland: string;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: 'sido-kayak',
    category: 'water',
    islandId: 'sido',
    islandName: '시도',
    colorIsland: '시도',
    name: '시도 카약 체험',
    photo: '/카약.png',
    diff: '입문',
    season: '5~10월',
    popularity: 9,
    personTypes: adultChild(25000, 18000),
    guide: {
      place: '인천 옹진군 북도면 시도리 수기해변 카약장',
      items: '투명 카약, 구명조끼, 패들, 안전 브리핑',
      cancelPolicy: '이용 2일 전까지 100% 환불, 1일 전 50%, 당일 환불 불가',
      contact: '032-123-4501',
    },
  },
  {
    id: 'sido-surf',
    category: 'water',
    islandId: 'sido',
    islandName: '시도',
    colorIsland: '시도',
    name: '시도 서핑 강습',
    diff: '초급',
    season: '6~9월',
    popularity: 6,
    personTypes: adultChild(50000, 40000),
    guide: {
      place: '시도 수기해변 서핑존',
      items: '서핑보드, 웻슈트, 레ash, 강습 90분',
      cancelPolicy: '기상 악화 시 일정 변경 또는 전액 환불',
      contact: '032-123-4502',
    },
  },
  {
    id: 'baengnyeong-cruise',
    category: 'water',
    islandId: 'baek',
    islandName: '백령도',
    colorIsland: '백령도',
    name: '백령도 두무진 유람선',
    diff: '누구나',
    season: '연중',
    popularity: 10,
    personTypes: adultChild(21000, 15000, '대인', '소인'),
    guide: {
      place: '백령도 두무진항 유람선 승선장',
      items: '왕복 유람선 승선권, 안내 방송',
      cancelPolicy: '출항 24시간 전까지 무료 취소',
      contact: '032-123-4503',
    },
  },
  {
    id: 'soijak-paddle',
    category: 'water',
    islandId: 'soijak',
    islandName: '소이작도',
    colorIsland: '소이작도',
    name: '소이작도 패들보트',
    diff: '누구나',
    season: '6~9월',
    popularity: 5,
    personTypes: flatPerson(15000),
    guide: {
      place: '소이작도 마을 앞 해변 패들보트 대여소',
      items: '패들보트 2인용, 구명조끼, 이용 30분',
      cancelPolicy: '이용 1일 전까지 취소 시 전액 환불',
      contact: '032-123-4504',
    },
  },
  {
    id: 'muui-mud',
    category: 'exp',
    islandId: 'muui',
    islandName: '무의도',
    colorIsland: '무의도',
    name: '무의도 갯벌체험',
    diff: '누구나',
    season: '3~11월',
    popularity: 8,
    personTypes: adultChild(4000, 4000),
    guide: {
      place: '무의도 실미 갯벌 체험장',
      items: '갯벌장화, 장갑, 바지락·소라 채집 체험',
      cancelPolicy: '썰물 시간 변경 시 안내 후 재예약',
      contact: '032-123-4505',
    },
  },
  {
    id: 'yeongheung-fishing',
    category: 'exp',
    islandId: 'yheung',
    islandName: '영흥도',
    colorIsland: '영흥도',
    name: '영흥도 배낚시',
    diff: '입문~중급',
    season: '연중',
    popularity: 7,
    personTypes: flatPerson(50000),
    guide: {
      place: '영흥도 외리항 배낚시 선착장',
      items: '낚싯대·릴 대여, 미끼, 4시간 출조',
      cancelPolicy: '기상 악화 시 출항 연기 또는 환불',
      contact: '032-123-4506',
    },
  },
  {
    id: 'muui-zipline',
    category: 'exp',
    islandId: 'muui',
    islandName: '무의도',
    colorIsland: '무의도',
    name: '무의도 하나개 짚라인',
    diff: '초급',
    season: '3~11월',
    popularity: 8,
    personTypes: flatPerson(22000),
    guide: {
      place: '무의도 하나개 유원지 짚라인 코스',
      items: '안전장비, 헬멧, 1회 체험',
      cancelPolicy: '이용 1일 전까지 100% 환불',
      contact: '032-123-4507',
    },
  },
  {
    id: 'muui-atv',
    category: 'exp',
    islandId: 'muui',
    islandName: '무의도',
    colorIsland: '무의도',
    name: '무의도 ATV 체험',
    diff: '초급',
    season: '연중',
    popularity: 6,
    personTypes: flatPerson(25000),
    guide: {
      place: '무의도 하나개 ATV 코스',
      items: 'ATV 1대, 헬멧, 20분 주행',
      cancelPolicy: '우천 시 일정 변경 가능',
      contact: '032-123-4508',
    },
  },
  {
    id: 'ganghwa-luge',
    category: 'exp',
    islandId: 'gangh',
    islandName: '강화도',
    colorIsland: '강화도',
    name: '강화도 루지',
    diff: '누구나',
    season: '연중',
    popularity: 7,
    personTypes: adultChild(18000, 14000),
    guide: {
      place: '강화도 루지파크 승차장',
      items: '루지 카트, 헬멧, 2회 승차',
      cancelPolicy: '당일 기상 악화 시 운영 중단 안내',
      contact: '032-123-4509',
    },
  },
  {
    id: 'yeongheung-bike',
    category: 'land',
    islandId: 'yheung',
    islandName: '영흥도',
    colorIsland: '영흥도',
    name: '영흥도 자전거 대여',
    diff: '입문',
    season: '연중',
    popularity: 5,
    personTypes: flatPerson(10000),
    guide: {
      place: '영흥도 십리포 자전거 대여소',
      items: '하이브리드 자전거 1대, 헬멧, 4시간 이용',
      cancelPolicy: '대여 시작 전까지 무료 취소',
      contact: '032-123-4510',
    },
  },
  {
    id: 'deokjeok-camp',
    category: 'land',
    islandId: 'deokj',
    islandName: '덕적도',
    colorIsland: '덕적도',
    name: '덕적도 야영장',
    diff: '입문',
    season: '4~10월',
    popularity: 4,
    personTypes: [{ key: 'night', label: '1박', price: 20000, min: 1, max: 3 }],
    guide: {
      place: '덕적도 백아산 야영장',
      items: '텐트 사이트 1박, 샤워실·화장실 이용',
      cancelPolicy: '입실 3일 전까지 100% 환불',
      contact: '032-123-4511',
    },
  },
  {
    id: 'baengnyeong-seal',
    category: 'heal',
    islandId: 'baek',
    islandName: '백령도',
    colorIsland: '백령도',
    name: '백령도 물범 관찰',
    diff: '누구나',
    season: '4~11월',
    popularity: 6,
    personTypes: adultChild(21000, 15000, '대인', '소인'),
    guide: {
      place: '백령도 두무진항 물범 관찰 유람선',
      items: '전문 해설, 쌍안경 대여, 승선권',
      cancelPolicy: '출항 24시간 전까지 무료 취소',
      contact: '032-123-4512',
    },
  },
  {
    id: 'soijak-star',
    category: 'heal',
    islandId: 'soijak',
    islandName: '소이작도',
    colorIsland: '소이작도',
    name: '소이작도 은하수 체험',
    diff: '누구나',
    season: '4~10월',
    popularity: 5,
    personTypes: flatPerson(15000),
    guide: {
      place: '소이작도 마을회관 야외 천체관측장',
      items: '천체 망원경, 전문가 해설, 2시간 프로그램',
      cancelPolicy: '기상 악화 시 일정 변경 또는 환불',
      contact: '032-123-4513',
    },
  },
  {
    id: 'seokmo-spa',
    category: 'heal',
    islandId: 'seok',
    islandName: '석모도',
    colorIsland: '석모도',
    name: '석모도 온천·스파',
    diff: '누구나',
    season: '연중',
    popularity: 6,
    personTypes: adultChild(12000, 8000, '대인', '소인'),
    guide: {
      place: '석모도 미네랄 온천 스파',
      items: '대욕장·족욕·사우나 3시간 이용',
      cancelPolicy: '이용 1일 전까지 취소 시 전액 환불',
      contact: '032-123-4514',
    },
  },
];

export const MOCK_PRODUCTS: Product[] = PRODUCT_SEEDS.map((seed) => {
  const { colorIsland, ...rest } = seed;
  return {
    ...rest,
    regionColor: regionFor(colorIsland),
    availableDates: generateAvailableDates(seed.id),
  };
});

export function getMinPrice(product: Product): number {
  if (product.personTypes.length === 0) return 0;
  return Math.min(...product.personTypes.map((pt) => pt.price));
}

/** Sports 탭 경로 B — 스포츠 id → 대표 상품 id */
export const SPORT_DEFAULT_PRODUCT: Record<string, string> = {
  kayak: 'sido-kayak',
  surf: 'sido-surf',
  cruise: 'baengnyeong-cruise',
  paddle: 'soijak-paddle',
  cycle: 'yeongheung-bike',
  camp: 'deokjeok-camp',
  mud: 'muui-mud',
  fish: 'yeongheung-fishing',
  zip: 'muui-zipline',
  atv: 'muui-atv',
  luge: 'ganghwa-luge',
  seal: 'baengnyeong-seal',
  star: 'soijak-star',
  spa: 'seokmo-spa',
};

/** 지도·섬탐험 순서 참고. 활성/비활성은 상품 islandId 집합으로 계산 */
export const RESERVATION_ISLAND_FILTER: { id: string; name: string }[] = [
  { id: 'gangh', name: '강화도' },
  { id: 'seok', name: '석모도' },
  { id: 'muui', name: '무의도' },
  { id: 'sinsi', name: '신시모도' },
  { id: 'jang', name: '장봉도' },
  { id: 'sido', name: '시도' },
  { id: 'yheung', name: '영흥도' },
  { id: 'seonjae', name: '선재도' },
  { id: 'jawol', name: '자월도' },
  { id: 'ijak', name: '대이작도' },
  { id: 'soijak', name: '소이작도' },
  { id: 'seungb', name: '승봉도' },
  { id: 'deokj', name: '덕적도' },
  { id: 'baek', name: '백령도' },
  { id: 'daech', name: '대청도' },
];

/** 필터 표시명 → 지역색 조회용 (ISLAND_REGION 키) */
export function islandFilterColorName(name: string): string {
  if (name === '신시모도') return '시도';
  return name;
}
