import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useSession } from "@/store/session";

/**
 * 로그인이 필요한 화면을 감싼다.
 *
 * 예전에는 글쓰기 페이지가 비로그인에게도 그대로 열려서, 다 작성하고 등록을
 * 누른 뒤에야 401 로 실패했다. 들어올 때 막고 로그인 후 원래 자리로 돌려보낸다.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { buildLoginUrl } = useAuthRedirect();

  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    // 앱 시작 직후에는 토큰 확인이 끝날 때까지 기다린다 (깜빡임 방지)
    if (loading || isLoggedIn) return;
    navigate(buildLoginUrl(returnTo), { replace: true });
  }, [loading, isLoggedIn, navigate, buildLoginUrl, returnTo]);

  if (loading || !isLoggedIn) return null;
  return <>{children}</>;
}
