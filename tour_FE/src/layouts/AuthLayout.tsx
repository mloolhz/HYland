import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <Link to="/" className="auth-home-link">
        ← 홈으로
      </Link>
      <Outlet />
    </div>
  );
}
