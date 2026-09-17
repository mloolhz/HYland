import { Link, Outlet, useLocation } from "react-router-dom";

export function AuthLayout() {
  const { pathname } = useLocation();

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
