/**
 * 시설명 → 활동(activity) 판정
 *
 * HYland 레저스포츠 탭의 활동 목록을 기준으로 한다.
 * 활동이 정해지면 카테고리도 그 활동이 속한 카테고리로 확정된다.
 * (예: "낚시"는 해상레저가 아니라 체험으로 본다)
 */

/** 카테고리별 활동 목록 — 프론트 레저스포츠 탭 기준 */
export const ACTIVITY_TAXONOMY = {
  SEA: ["카약", "서핑", "유람선", "패들보트"],
  LAND: ["트레킹", "자전거", "캠핑", "백패킹"],
  EXPERIENCE: ["갯벌체험", "낚시", "풀등 체험", "해루질", "짚라인", "모노레일", "루지"],
  HEALING: ["산림욕", "일몰 감상", "물범 관찰", "해안 산책", "은하수 체험", "섬마을 투어", "온천-스파"],
  UNIQUE: ["골프", "수련단체활동"],
};

const norm = (v = "") => String(v).normalize("NFC").replace(/\s+/g, "").toLowerCase();

/**
 * 이름만으로는 판정할 수 없어 직접 확인한 시설.
 * (예: "락인뜰"은 이름에 단서가 없지만 실제로는 캠핑장)
 */
const OVERRIDES = {
  락인뜰: { activity: "캠핑", category: "LAND" },
};

/**
 * 판정 규칙 — 위에서부터 먼저 걸리는 것이 이긴다.
 * [활동, 카테고리, 정규식]
 */
const RULES = [
  // ── 체험 (시설 종류가 명확해 먼저 판정) ──
  ["짚라인", "EXPERIENCE", /짚라인|짚와이어|zip/],
  ["루지", "EXPERIENCE", /루지/],
  ["모노레일", "EXPERIENCE", /모노레일|레일바이크/],
  ["풀등 체험", "EXPERIENCE", /풀등|해양생태관/],
  ["해루질", "EXPERIENCE", /해루질/],
  ["갯벌체험", "EXPERIENCE", /갯벌|조개|어촌체험|어촌계|머드|생태체험|체험마을|관광농원|자연체험/],
  ["낚시", "EXPERIENCE", /낚시|좌대|조행|피싱|저수지|수로|낚시터/],

  // ── 힐링 (시설 종류 자체가 힐링) ──
  ["온천-스파", "HEALING", /온천|스파|찜질|씨메르|미네랄|족욕/],
  ["산림욕", "HEALING", /산림욕|삼림욕|휴양림|수목원|나무숲|나무군락|소사나무|송림|자갈마당/],
  ["은하수 체험", "HEALING", /은하수|별관측|천문|밤하늘/],

  // ── 육상레저 ──
  ["백패킹", "LAND", /백패킹|개머리/],
  ["캠핑", "LAND", /캠핑|카라반|글램|야영|오토캠/],
  ["자전거", "LAND", /자전거|사이클|라이딩|임도/],
  ["트레킹", "LAND", /트레킹|등산|둘레길|나들길|누리길|탐방로|웰니스코스|전망대|국사봉|호룡곡산|부아산|비조봉|깃대봉|백운산/],

  // ── 해상레저 ──
  ["유람선", "SEA", /유람선|여객선|크루즈|요트|마리나|선셋/],
  ["카약", "SEA", /카약|카누/],
  ["서핑", "SEA", /서핑|surf/],
  ["패들보트", "SEA", /패들|sup|보트|제트/],

  // ── 이색 ──
  ["골프", "UNIQUE", /골프|컨트리클럽|golf|gc|cc(?![a-z])/],
  ["수련단체활동", "UNIQUE", /수련원|연수원|교육원|학습관|평생학습/],

  // ── 힐링 (경관성 — 시설 종류가 앞서도록 뒤에 둔다) ──
  ["일몰 감상", "HEALING", /일몰|노을|낙조/],
  ["섬마을 투어", "HEALING", /벽화|마을투어|약수터|사찰|절$|바위|등대|전적비|유적/],
  ["해안 산책", "HEALING", /산책|해변|해수욕장|해안|둘레|포구|선착장/],
];

/**
 * @param {string} name  시설명
 * @param {string} extra 주소 등 부가 텍스트 (선택)
 * @returns {{activity: string, category: string, matched: string|null}}
 */
export function resolveActivity(name, extra = "") {
  const n = norm(name);

  const ov = OVERRIDES[String(name).trim()];
  if (ov) return { ...ov, matched: ov.activity };

  for (const [activity, category, re] of RULES) {
    if (re.test(n)) return { activity, category, matched: activity };
  }
  // 이름으로 못 정하면 주소·부가정보로 한 번 더
  const t = norm(`${name} ${extra}`);
  for (const [activity, category, re] of RULES) {
    if (re.test(t)) return { activity, category, matched: activity };
  }
  return { activity: "기타", category: "UNIQUE", matched: null };
}
