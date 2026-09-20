import { Navigate, useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/landing/ToastProvider";
import { NotificationProvider } from "@/store/notifications";
import { getSafeRedirect } from "@/hooks/useAuthRedirect";
import { MobileShell } from "./MobileShell";
import type { AuthMode } from "./auth/AuthSheetProvider";

/** 모바일 전용 화면의 공통 껍데기 (토스트·알림 스토어 + 셸) */
export function MobileAppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NotificationProvider>
        <MobileShell>{children}</MobileShell>
      </NotificationProvider>
    </ToastProvider>
  );
}

/**
 * 모바일에는 /login · /signup 페이지가 없다. 주소로 들어오거나 RequireAuth 가
 * 보내면 홈으로 돌려보내면서 로그인 시트를 띄우고, 성공하면 원래 가려던 곳으로
 * 이어서 보낸다.
 */
export function MobileAuthRedirect({ mode }: { mode: AuthMode }) {
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  return <Navigate to="/" replace state={{ authSheet: mode, authRedirectTo: redirectTo }} />;
}
