import { useEffect, useState } from "react";
import { fetchOAuthProviders, type OAuthProvider } from "@/api/auth";

/**
 * 켜져 있는 간편 로그인 제공사 목록.
 *
 * 시트가 버튼뿐 아니라 그 아래 구분선("아이디로 로그인")까지 같이 감춰야 해서
 * 조회를 훅으로 빼뒀다. 키가 설정된 제공사가 없으면 빈 배열이다.
 */
export function useOAuthProviders(): OAuthProvider[] {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);

  useEffect(() => {
    let alive = true;
    fetchOAuthProviders()
      .then((list) => {
        if (alive) setProviders(list);
      })
      .catch((err: unknown) => console.error("[oauth] 제공사 조회 실패:", err));
    return () => {
      alive = false;
    };
  }, []);

  return providers;
}
