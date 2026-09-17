/**
 * 웹에서 찾은 연락처를 contacts.csv 에 채워 넣는다.
 *
 * 두 종류를 넣는다.
 *   ① 개별 시설 — 강화군청 야영장 목록 등에서 확인한 실제 업체 번호
 *   ② 공공 시설 — 트레킹 코스·해변처럼 업체 전화가 없는 곳.
 *      관광공사가 같은 섬 시설에 붙여 둔 관할 기관(면사무소) 번호를 쓴다.
 *      "문의 및 안내" 번호라 성격이 맞다. 출처에 그렇게 적어 사람이 구분할 수 있게 한다.
 *
 * 이미 값이 있는 칸은 건드리지 않는다.
 *
 * 실행: node scripts/tour/fill-contacts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const NAME = process.argv[2] ?? "contacts.csv";
const CSV = `reports/contact-enrich/${NAME}`;

/** ① 개별 업체 — 출처: 강화군 문화관광 야영장 목록 / 영흥도 장경리해변야영장 */
const BY_ID = {
  // ── 개별 조사 (군청·시설공단·공식 홈페이지) ──
  373: { tel: "032-933-8271", src: "강화군 관광안내(보문사)" },
  374: { tel: "032-930-7053", src: "강화군 관광안내(석모도 미네랄온천)", url: "https://seongmodo.imweb.me/tour4" },
  402: { tel: "032-719-7778", src: "인천시설공단 씨사이드파크(레일바이크)", url: "https://www.insiseol.or.kr/park/seaside/facility/railbike.jsp" },
  400: { tel: "032-456-2972", src: "인천시설공단 씨사이드파크(대표)", url: "https://www.insiseol.or.kr/park/seaside/" },

  // ── 강화 공공 코스 — 관할 강화군 관광과 ──
  291: { tel: "032-930-3124", src: "강화군 관광과", url: "https://www.nadeulgil.org" },
  292: { tel: "032-930-3124", src: "강화군 관광과", url: "https://www.nadeulgil.org" },
  293: { tel: "032-930-3124", src: "강화군 관광과", url: "https://www.nadeulgil.org" },
  294: { tel: "032-930-3124", src: "강화군 관광과", url: "https://www.nadeulgil.org" },
  296: { tel: "032-930-3124", src: "강화군 관광과" },
  328: { tel: "032-930-3124", src: "강화군 관광과" },
  336: { tel: "032-930-3124", src: "강화군 관광과" },
  377: { tel: "032-930-3124", src: "강화군 관광과" },
  312: { tel: "032-930-3124", src: "강화군 관광과" },
  301: { tel: "032-930-3124", src: "강화군 관광과" },
  295: { tel: "032-930-3124", src: "강화군 관광과" },
  297: { tel: "032-930-3124", src: "강화군 관광과" },
  337: { tel: "032-930-3124", src: "강화군 관광과" },
  338: { tel: "032-930-3124", src: "강화군 관광과" },

  // ── 강화군 낚시터 목록 (ganghwa.go.kr 문화관광) ──
  306: { tel: "032-932-3288", src: "강화군청 낚시터목록(국화낚시터)" },
  309: { tel: "032-932-1234", src: "강화군청 낚시터목록(길정낚시터)" },
  320: { tel: "032-933-1366", src: "강화군청 낚시터목록(신선낚시터)" },
  326: { tel: "032-937-8788", src: "강화군청 낚시터목록(인산낚시터)" },
  335: { tel: "032-933-0105", src: "강화군청 낚시터목록(황청낚시터)" },
  300: { tel: "032-933-0105", src: "강화군청 낚시터목록(황청낚시터)" },
  308: { tel: "032-937-6497", src: "강화군청 낚시터목록(길상낚시터)" },

  // ── 클럽72 (onetheclub.com 연락처 안내) ──
  410: { tel: "032-270-7272", src: "클럽72 코스별 예약(레이크)", url: "https://www.onetheclub.com/club72/main" },
  411: { tel: "032-270-7272", src: "클럽72 코스별 예약(바다)", url: "https://www.onetheclub.com/club72/main" },
  412: { tel: "1599-0072", src: "클럽72 통합예약(오션)", url: "https://www.onetheclub.com/club72/main" },
  413: { tel: "1599-0072", src: "클럽72 통합예약(클래식)", url: "https://www.onetheclub.com/club72/main" },
  414: { tel: "032-270-7128", src: "클럽72 코스별 예약(하늘)", url: "https://www.onetheclub.com/club72/main" },
  403: { tel: "", src: "", url: "https://www.orangedunesyj.com/" },
  396: { tel: "", src: "", url: "https://www.verthillccyj.com/" },
  415: { tel: "", src: "", url: "https://www.p-city.com/front/cimer/overview?language=KO" },

  299: { tel: "010-3699-2499", src: "강화군청 야영장목록" },
  307: { tel: "032-937-6890", src: "강화군청 야영장목록" },
  310: { tel: "010-5223-4540", src: "강화군청 야영장목록" },
  311: { tel: "010-2409-0815", src: "강화군청 야영장목록(더숲관광농원캠핑장)" },
  313: { tel: "010-4802-8793", src: "강화군청 야영장목록" },
  314: { tel: "010-7446-0844", src: "강화군청 야영장목록" },
  315: { tel: "010-8247-3438", src: "강화군청 야영장목록" },
  316: { tel: "032-937-3485", src: "강화군청 야영장목록(강화바다관광농원)" },
  319: { tel: "0507-1485-6330", src: "강화군청 야영장목록" },
  321: { tel: "010-5338-3133", src: "강화군청 야영장목록" },
  322: { tel: "010-2334-2002", src: "강화군청 야영장목록(아르보리아파크캠핑장)" },
  323: { tel: "010-8095-7372", src: "강화군청 야영장목록" },
  329: { tel: "010-7206-4566", src: "강화군청 야영장목록" },
  331: { tel: "032-933-0118", src: "강화군청 야영장목록" },
  332: { tel: "032-934-1300", src: "강화군청 야영장목록" },
  333: { tel: "032-930-7066", src: "강화군청 야영장목록" },
  334: { tel: "010-6297-1201", src: "강화군청 야영장목록" },
  371: { tel: "010-8445-5373", src: "강화군청 야영장목록" },
  375: { tel: "010-6408-9365", src: "강화군청 야영장목록" },
  378: { tel: "010-4394-7100", src: "강화군청 야영장목록" },
  427: { tel: "032-880-0450", src: "영흥도 장경리해변야영장", url: "http://xn--289a88vh9ihpaq9dea.kr/" },
};

/**
 * ② 공공 시설 — 섬별 관할 기관 번호.
 * 관광공사가 같은 섬 해변·명소의 "문의 및 안내"로 내려준 번호를 그대로 쓴다.
 */
const BY_ISLAND = {
  대청도: { tel: "032-899-3610", src: "관할 대청면(관광공사 안내번호)" },
  백령도: { tel: "032-899-3510", src: "관할 백령면(관광공사 안내번호)" },
  덕적도: { tel: "032-899-2253", src: "관할 덕적면(관광공사 안내번호)" },
  굴업도: { tel: "032-899-2253", src: "관할 덕적면(관광공사 안내번호)" },
  문갑도: { tel: "032-899-2253", src: "관할 덕적면(관광공사 안내번호)" },
  소야도: { tel: "032-899-2253", src: "관할 덕적면(관광공사 안내번호)" },
  자월도: { tel: "032-899-2114", src: "관할 자월면(관광공사 안내번호)" },
  대이작도: { tel: "032-899-2114", src: "관할 자월면(관광공사 안내번호)" },
  승봉도: { tel: "032-899-2114", src: "관할 자월면(관광공사 안내번호)" },
  장봉도: { tel: "032-899-3414", src: "관할 북도면(관광공사 안내번호)" },
  "신도·시도·모도": { tel: "032-899-3414", src: "관할 북도면(관광공사 안내번호)" },
  무의도: { tel: "032-760-7770", src: "관할 영종구(관광공사 안내번호)" },
  영종도: { tel: "032-760-7497", src: "관할 영종구(관광공사 안내번호)" },
};

/** 업체가 있는 시설에는 관할 번호를 붙이지 않는다 — 캠핑장 등은 직접 번호가 맞다 */
const PUBLIC_ACTIVITIES = new Set([
  "트레킹",
  "자전거",
  "백패킹",
  "해안 산책",
  "해수욕장",
  "갯벌체험",
  "산림욕",
  "일몰 감상",
  "물범 관찰",
  "은하수 체험",
  "섬마을 투어",
]);

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

const enc = (v) => (/[",\n]/.test(String(v ?? "")) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ""));

const text = readFileSync(CSV, "utf8").replace(/^﻿/, "");
const rows = parseCsv(text).filter((r) => r.length > 1);
const header = rows.shift();
const I = Object.fromEntries(header.map((h, i) => [h, i]));

let byId = 0, byIsland = 0, urlAdded = 0;

for (const r of rows) {
  const id = Number(r[I["id"]]);
  const hasTel = r[I["전화번호"]].trim() !== "";

  const direct = BY_ID[id];
  if (direct) {
    if (direct.tel && !hasTel) {
      r[I["전화번호"]] = direct.tel;
      r[I["출처"]] = direct.src;
      byId += 1;
    }
    if (direct.url && r[I["홈페이지"]].trim() === "") {
      r[I["홈페이지"]] = direct.url;
      urlAdded += 1;
    }
    if (direct.tel) continue;
  }

  // 공공 시설만 관할 번호로 채운다
  if (!hasTel && PUBLIC_ACTIVITIES.has(r[I["활동"]])) {
    const area = BY_ISLAND[r[I["섬"]]];
    if (area) {
      r[I["전화번호"]] = area.tel;
      r[I["출처"]] = area.src;
      byIsland += 1;
    }
  }
}

writeFileSync(CSV, "﻿" + [header, ...rows].map((r) => r.map(enc).join(",")).join("\r\n"), "utf8");

const filled = rows.filter((r) => r[I["전화번호"]].trim()).length;
const home = rows.filter((r) => r[I["홈페이지"]].trim()).length;
console.log(`개별 업체 ${byId}곳 · 관할 기관 ${byIsland}곳 · 홈페이지 추가 ${urlAdded}곳`);
console.log(`\n전체 ${rows.length}곳 → 전화번호 ${filled}곳 · 홈페이지 ${home}곳`);
console.log(`아직 빈 전화번호 ${rows.length - filled}곳`);
