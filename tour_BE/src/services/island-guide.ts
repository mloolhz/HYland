import { readFileSync } from "node:fs";

// The source document retains the interview notes and uncertainty markers. Keep
// the prompt concise while preserving the fields needed to compare trip fit.
const source = readFileSync(new URL("../data/incheon-island-guide.md", import.meta.url), "utf8");
const fields = [
  "한줄특징", "핵심차별점", "대표콘텐츠", "추천여행객", "비추천여행객",
  "접근방식", "접근성", "환승난이도", "섬 내 이동", "뚜벅이 적합도",
  "자차 필요도", "추천여행형태", "당일치기 적합도", "추천계절",
  "활동강도", "편의시설 수준", "날씨·운항 의존도", "날씨·물때 의존도",
  "날씨 의존도", "동행 적합도", "주요 여행목적 적합도", "선택 기준",
  "백령도 vs 대청도 선택 기준", "영흥도 vs 선재도 선택 기준",
  "무의도 vs 소무의도 선택 기준", "중요한 현지 검증 결과",
  "정보신뢰도", "추가 확인사항",
];

export const ISLAND_GUIDE_PROMPT = source
  .split(/^## \d+\. /m)
  .slice(1)
  .map((section) => {
    const [name, ...body] = section.split(/\r?\n/);
    const entries = [...body.join("\n").matchAll(/\*\*([^*]+):\*\*\s*([\s\S]*?)(?=\n\*\*[^*]+:\*\*|$)/g)]
      .filter(([, field]) => fields.includes(field))
      .map(([, field, value]) => `${field}: ${value.trim().replace(/\s*\n\s*/g, " / ")}`);
    return `${name.trim()}\n${entries.join("\n")}`;
  })
  .join("\n\n");
