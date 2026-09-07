/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 백엔드 주소. 없으면 http://localhost:4000 을 쓴다 (lib/api-base.ts).
   * 배포 시 .env.production 등에 실제 주소를 넣는다.
   */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
