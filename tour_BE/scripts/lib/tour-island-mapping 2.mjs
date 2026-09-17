const normalize = (value = "") =>
  String(value)
    .normalize("NFC")
    .replace(/[\s·•ㆍ·∙‧・\-_.(),]/g, "")
    .toLowerCase();

const ISLANDS = {
  baek: { name: "백령도", region: "백령·대청도권역" },
  daech: { name: "대청도", region: "백령·대청도권역" },
  yeonp: { name: "연평도", region: "연평도권역" },
  gangh: { name: "강화도", region: "강화도권역" },
  gyo: { name: "교동도", region: "강화도권역" },
  seok: { name: "석모도", region: "강화도권역" },
  jang: { name: "장봉도", region: "북도권역" },
  sinsi: { name: "신도·시도·모도", region: "북도권역" },
  yeongj: { name: "영종도", region: "영종구·서해구권역" },
  muui: { name: "무의도", region: "영종구·서해구권역" },
  yheung: { name: "영흥도", region: "영흥도권역" },
  jawol: { name: "자월도", region: "자월도권역" },
  seungb: { name: "승봉도", region: "자월도권역" },
  ijak: { name: "대이작도", region: "자월도권역" },
  deokj: { name: "덕적도", region: "덕적도권역" },
  soya: { name: "소야도", region: "덕적도권역" },
  mungap: { name: "문갑도", region: "덕적도권역" },
  gureop: { name: "굴업도", region: "덕적도권역" },
};

const matched = (islandId, method, reason, confidence = 0.95) => ({
  status: "MATCHED",
  islandId,
  islandName: ISLANDS[islandId].name,
  region: ISLANDS[islandId].region,
  method,
  confidence,
  reason,
});

const other = (status, reason, candidates = []) => ({
  status,
  islandId: null,
  islandName: null,
  region: null,
  method: "RULE",
  confidence: status === "MAINLAND" ? 0.99 : 0.9,
  reason,
  candidates,
});

const includesAny = (text, values) => values.some((value) => text.includes(normalize(value)));

export function classifyTourSport(item) {
  const source = `${item.title ?? ""} ${item.addr1 ?? ""} ${item.addr2 ?? ""}`;
  const text = normalize(source);

  // 서비스 18개 단위에 포함되지 않는 인접 섬을 먼저 제외한다.
  if (includesAny(text, ["동검도", "동검길"])) return other("OUT_OF_SCOPE", "동검도는 18개 서비스 섬 대상에서 제외");
  if (includesAny(text, ["선재도", "선재로"])) return other("OUT_OF_SCOPE", "선재도는 18개 서비스 섬 대상에서 제외");
  if (includesAny(text, ["소청도"])) return other("OUT_OF_SCOPE", "소청도는 18개 서비스 섬 대상에서 제외");
  if (includesAny(text, ["소무의도"])) return other("OUT_OF_SCOPE", "소무의도는 18개 서비스 섬 대상에서 제외");
  if (includesAny(text, ["소이작도"])) return other("OUT_OF_SCOPE", "소이작도는 18개 서비스 섬 대상에서 제외");

  // 이름이 명시된 경우를 행정구역 보다 우선한다.
  const aliasRules = [
    ["baek", ["백령도", "백령면"]],
    ["daech", ["대청도", "대청면"]],
    ["yeonp", ["연평도", "연평면"]],
    ["gyo", ["교동도", "교동면"]],
    ["seok", ["석모도", "삼산면", "삼산북로", "삼산남로", "삼산서로"]],
    ["jang", ["장봉도", "장봉리"]],
    ["sinsi", ["신시모도", "신도", "시도", "모도", "수기해변", "배미꾸미"]],
    ["muui", ["무의도", "무의동", "하나개", "실미도"]],
    ["yheung", ["영흥도"]],
    ["jawol", ["자월도"]],
    ["seungb", ["승봉도"]],
    ["ijak", ["대이작도"]],
    ["soya", ["소야도"]],
    ["mungap", ["문갑도"]],
    ["gureop", ["굴업도"]],
    ["deokj", ["덕적도", "서포리"]],
  ];
  for (const [islandId, aliases] of aliasRules) {
    if (includesAny(text, aliases)) return matched(islandId, "ISLAND_OR_PLACE_ALIAS", `섬·면·장소 별칭 일치: ${ISLANDS[islandId].name}`, 0.98);
  }

  // 행정구역이 하나의 서비스 단위로 수렴하는 경우.
  if (text.includes(normalize("강화군"))) return matched("gangh", "ADMIN_AREA_FALLBACK", "교동·석모·동검도 예외를 제외한 강화군", 0.9);
  if (text.includes(normalize("영흥면"))) return matched("yheung", "ADMIN_AREA_FALLBACK", "선재도 예외를 제외한 영흥면", 0.93);
  if (text.includes(normalize("영종구"))) return matched("yeongj", "ADMIN_AREA_FALLBACK", "무의·소무의도 예외를 제외한 영종구", 0.92);

  // 하나의 면에 여러 서비스 섬이 있으면 자동 확정하지 않는다.
  if (text.includes(normalize("북도면"))) return other("REVIEW_REQUIRED", "북도면은 장봉도와 신·시·모도를 추가로 구분해야 함", ["jang", "sinsi"]);
  if (text.includes(normalize("자월면"))) return other("REVIEW_REQUIRED", "자월면은 자월·승봉·대이작도를 추가로 구분해야 함", ["jawol", "seungb", "ijak"]);
  if (text.includes(normalize("덕적면"))) return other("REVIEW_REQUIRED", "덕적면은 덕적·소야·문갑·굴업도를 추가로 구분해야 함", ["deokj", "soya", "mungap", "gureop"]);

  const mainlandDistricts = ["제물포구", "검단구", "계양구", "남동구", "미추홀구", "부평구", "동구", "연수구", "서해구", "서구"];
  const mainland = mainlandDistricts.find((district) => text.includes(normalize(district)));
  if (mainland) return other("MAINLAND", `인천 본토 행정구역: ${mainland}`);

  return other("REVIEW_REQUIRED", "18개 섬 또는 인천 본토로 안전하게 판정할 근거가 부족함");
}

export { ISLANDS };
