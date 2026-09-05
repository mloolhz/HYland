/**
 * 백엔드 주소. 배포 시 .env 의 VITE_API_BASE 로 바꿀 수 있게 한 곳에 모은다.
 * (기존 ai-recommend·weather 쪽은 아직 각자 상수를 쓰고 있어 차차 옮긴다)
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";
