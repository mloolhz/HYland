import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function getSafeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export function useAuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirect = useMemo(
    () => getSafeRedirect(searchParams.get("redirect")),
    [searchParams],
  );

  const goAfterAuth = useCallback(() => {
    navigate(redirect, { replace: true });
  }, [navigate, redirect]);

  const buildLoginUrl = useCallback(
    (returnTo: string) => {
      const safe = getSafeRedirect(returnTo);
      return `/login?redirect=${encodeURIComponent(safe)}`;
    },
    [],
  );

  const authSearch = searchParams.get("redirect")
    ? `?redirect=${encodeURIComponent(redirect)}`
    : "";

  return { redirect, goAfterAuth, buildLoginUrl, authSearch };
}
