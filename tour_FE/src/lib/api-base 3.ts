/**
 * 백엔드 주소 — 앱 전체에서 이 상수 하나만 쓴다.
 *
 * 예전에는 ai-recommend·bti-preferences·날씨 컴포넌트가 각자
 * "http://localhost:4000" 을 박아두고 있어서, 배포 주소로 바꾸려면 네 군데를
 * 고쳐야 했다. 이제 .env 의 VITE_API_BASE 만 바꾸면 된다.
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
