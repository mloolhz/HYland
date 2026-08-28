/**
 * HYland 레저스포츠 5개 카테고리 자동 분류
 * SEA(해상) · LAND(육상) · EXPERIENCE(체험) · HEALING(힐링) · UNIQUE(이색)
 * + 레저가 아닌 시설(숙박·일반체육 등)은 NON_LEISURE 로 표시해 검수 대상으로 뺀다.
 */
export const CATEGORIES = {
  SEA: "해상레저",
  LAND: "육상레저",
  EXPERIENCE: "체험",
  HEALING: "힐링",
  UNIQUE: "이색",
};

const norm = (v = "") => String(v).normalize("NFC").replace(/\s+/g, "").toLowerCase();

/** 우선순위 순서대로 검사 (앞선 규칙이 이김) */
const RULES = [
  [
    "EXPERIENCE",
    ["갯벌", "해루질", "루지", "모노레일", "짚라인", "짚와이어", "레일바이크", "머드", "조개잡이",
     "어촌체험", "농어촌체험", "체험마을", "생태체험", "관광농원"],
  ],
  [
    "SEA",
    ["카약", "카누", "sup", "패들", "서핑", "요트", "보트", "유람선", "여객선", "크루즈",
     "낚시", "좌대", "선상", "스노클", "스쿠버", "다이빙", "제트스키", "수상레저", "해양레저",
     "해수욕", "물놀이", "해변", "해수풀", "워터", "저수지", "수로", "선착장", "포구"],
  ],
  // 힐링(확정) — 시설 종류 자체가 힐링인 경우
  [
    "HEALING",
    ["휴양림", "산림욕", "삼림욕", "치유", "온천", "스파", "찜질", "명상", "수목원",
     "씨메르", "힐링"],
  ],
  [
    "LAND",
    ["캠핑", "글램", "카라반", "오토캠", "백패킹", "야영", "자전거", "라이딩", "사이클",
     "트레킹", "둘레길", "나들길", "등산", "산책로", "숲길", "누리길", "탐방로", "올레길"],
  ],
  // 힐링(경관) — "노을캠핑장"처럼 시설 종류가 앞서면 그쪽이 이기도록 LAND 뒤에 둔다
  ["HEALING", ["일몰", "노을", "낙조", "천문", "별보기"]],
  [
    "UNIQUE",
    ["골프", "컨트리클럽", "gc", "cc", "승마", "서바이벌", "카트", "atv", "사격", "양궁",
     "패러", "번지", "클라이밍", "암벽", "레포츠", "빙상", "볼링", "테니스", "풋살"],
  ],
];

/** 레저 시설로 보기 어려운 항목 (검수에서 제외 판단용) */
const NON_LEISURE = [
  "풀빌라", "펜션", "리조트", "호텔", "모텔", "민박", "게스트하우스",
  "수련원", "연수원", "교육원", "체육관", "국민체육센터", "경기장", "체육공원",
  "야구장", "축구장", "놀이터", "공원 놀이터",
];

/** API 소분류(SclsNm) 힌트 → 카테고리 */
const SCLS_HINT = {
  수상레저스포츠: "SEA",
  육상레저스포츠: "LAND",
  캠핑: "LAND",
  "농/산/어촌체험": "EXPERIENCE",
  체험관광기타: "EXPERIENCE",
  기타레저스포츠: "UNIQUE",
  레저스포츠시설: "UNIQUE",
};

/**
 * @param {string} name  시설명
 * @param {string} extra 주소·원본 분류 등 부가 텍스트
 * @param {string} scls  API 소분류명 (있으면 힌트로 사용)
 */
export function classifyCategory(name, extra = "", scls = "") {
  const nameText = norm(name);
  const text = norm(`${name} ${extra}`);

  // 레저가 아닌 시설은 먼저 표시 (단, 레저 키워드가 이름에 같이 있으면 레저 우선)
  const nonLeisureHit = NON_LEISURE.find((k) => nameText.includes(norm(k)));

  for (const [cat, keywords] of RULES) {
    const hit = keywords.find((k) => text.includes(norm(k)));
    if (hit) {
      // "수련원"처럼 비레저 키워드만 있고 레저 키워드가 주소에서만 걸린 경우 방지
      const hitInName = nameText.includes(norm(hit));
      if (nonLeisureHit && !hitInName) continue;
      return { category: cat, method: "KEYWORD", matched: hit, nonLeisure: false };
    }
  }

  if (scls && SCLS_HINT[scls]) {
    return { category: SCLS_HINT[scls], method: "API_SUBCATEGORY", matched: scls, nonLeisure: !!nonLeisureHit };
  }

  return {
    category: "UNIQUE",
    method: "FALLBACK",
    matched: nonLeisureHit ?? null,
    nonLeisure: !!nonLeisureHit,
  };
}
