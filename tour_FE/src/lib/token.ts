/**
 * 로그인 토큰 보관 (localStorage)
 *
 * 새로고침·탭 재개방에도 로그인이 유지돼야 하고, 실제 만료는 서버가 발급한
 * JWT 유효기간(7일)이 결정한다. store/session 과 api/* 가 같이 쓰기 때문에
 * 순환 참조를 피하려고 별도 모듈로 둔다.
 */
const TOKEN_KEY = "hyland-token";

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // 프라이빗 모드 등에서 접근이 막힐 수 있다
  }
}

export function writeToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 저장 못 해도 이번 세션 동안은 메모리 상태로 동작한다 */
  }
}
