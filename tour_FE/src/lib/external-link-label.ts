/** 도메인(또는 접미) → 화면에 보여 줄 링크 이름 */
const HOST_LABELS: { match: (host: string) => boolean; label: string }[] = [
  { match: (h) => h.includes("itour.incheon.go.kr"), label: "인천투어" },
  { match: (h) => h.includes("isum.incheon.go.kr"), label: "인천 섬포털" },
  { match: (h) => h.includes("heritage.go.kr"), label: "국가유산포털" },
  { match: (h) => h.includes("visitkorea.or.kr"), label: "대한민국 구석구석" },
  { match: (h) => h.includes("ongjin.go.kr"), label: "옹진군 관광" },
  { match: (h) => h.includes("ganghwa.go.kr"), label: "강화군 관광" },
  { match: (h) => h.includes("incheon.go.kr"), label: "인천광역시" },
  { match: (h) => h.includes("camfit.co.kr"), label: "캠핏" },
  { match: (h) => h.includes("instagram.com"), label: "Instagram" },
  { match: (h) => h.includes("cafe.naver.com") || h.includes("naver.me"), label: "네이버 카페" },
  { match: (h) => h.includes("blog.naver.com"), label: "네이버 블로그" },
  { match: (h) => h.includes("nadeulgil.org"), label: "옹진둘레길" },
  { match: (h) => h.includes("safekorea.go.kr"), label: "국민재난안전포털" },
  { match: (h) => h.includes("tour08.co.kr"), label: "인천관광공사" },
];

function parseHost(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * 긴 URL을 링크 텍스트로 그대로 두지 않고 짧은 이름을 만든다.
 * @param siteName 시설·기관명 — 알 수 없는 도메인일 때 "{siteName} 홈페이지"에 쓴다.
 */
export function externalLinkLabel(url: string, siteName?: string): string {
  const host = parseHost(url);
  if (host) {
    const rule = HOST_LABELS.find((r) => r.match(host));
    if (rule) return `${rule.label} 바로가기`;
  }
  const name = siteName?.trim();
  if (name) return `${name} 홈페이지`;
  return "공식 홈페이지 바로가기";
}
