import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { clearAiSessionId } from "@/lib/ai-session-id";
import { clearGuestIslandBtiHistory } from "@/lib/island-bti-storage";
import { isMemberSession } from "@/lib/member-session";
import { clearUserPreference } from "@/lib/recommendation/preference/user-preference-storage";
import { useSession } from "@/store/session";

const EPHEMERAL_ROUTE_PREFIXES = ["/island-bti", "/ai-recommend"];

function isEphemeralRoute(pathname: string): boolean {
  return EPHEMERAL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function resetGuestBtiAndAiSession(clearHistoryState: () => void): void {
  if (isMemberSession()) return;
  clearGuestIslandBtiHistory();
  clearUserPreference();
  clearAiSessionId();
  clearHistoryState();
}

/**
 * 비회원: 섬BTI·AI 추천 화면을 벗어나면 검사 결과·추천 성향·AI 대화 세션을 초기화한다.
 * (회원은 localStorage에 유지)
 */
export function GuestBtiAiSessionReset() {
  const { pathname } = useLocation();
  const { isLoggedIn, loading } = useSession();
  const { clearHistory } = useIslandBti();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (loading || isLoggedIn) {
      pathnameRef.current = pathname;
      return;
    }

    const previous = pathnameRef.current;
    pathnameRef.current = pathname;

    if (isEphemeralRoute(previous) && !isEphemeralRoute(pathname)) {
      resetGuestBtiAndAiSession(clearHistory);
    }
  }, [pathname, isLoggedIn, loading, clearHistory]);

  useEffect(() => {
    return () => {
      if (loading || isLoggedIn) return;
      if (isEphemeralRoute(pathnameRef.current)) {
        resetGuestBtiAndAiSession(clearHistory);
      }
    };
  }, [isLoggedIn, loading, clearHistory]);

  return null;
}
