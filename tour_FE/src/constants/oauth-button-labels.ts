/** 간편 로그인 버튼 문구 — 데스크톱·모바일·랜딩 공통 */
export const OAUTH_BUTTON_LABELS: Record<string, string> = {
  google: "Google로 시작하기",
  kakao: "카카오로 시작하기",
};

export function oauthButtonLabel(providerId: string, fallbackLabel?: string): string {
  return OAUTH_BUTTON_LABELS[providerId] ?? (fallbackLabel ? `${fallbackLabel}로 시작하기` : "시작하기");
}
