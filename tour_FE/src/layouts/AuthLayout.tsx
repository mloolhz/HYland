import { Link, Outlet, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileAppShell } from "@/mobile/MobileAppShell";

export function AuthLayout() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  // 모바일에서 /login · /signup 은 바텀시트로 대체돼 여기까지 오지 않는다.
  // 남은 화면(계정 찾기·간편가입 닉네임)만 모바일 셸 안에서 보여준다.
  if (isMobile) {
    return (
      <MobileAppShell>
        <div key={pathname} className="auth-layout auth-layout--mobile">
          <div className="auth-layout-inner">
            <Outlet />
          </div>
        </div>
      </MobileAppShell>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-layout-inner">
        <Link to="/" className="auth-home-link">
          ← 홈으로
        </Link>
        <div key={pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
