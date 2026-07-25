import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthTabs } from "./AuthTabs";

const SITE_LOGO_SRC = "/incheon-island-leisure-nuri-logo.png";

type AuthCardProps = {
  activeTab: "login" | "signup";
  showTabs?: boolean;
  children: ReactNode;
};

export function AuthCard({ activeTab, children, showTabs = true }: AuthCardProps) {
  return (
    <div className="auth-card">
      {showTabs && <AuthTabs active={activeTab} />}
      {children}
    </div>
  );
}

export function AuthBrand({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="auth-brand">
      <Link to="/" className="auth-logo" aria-label="인천섬 레저누리 홈">
        <img className="auth-logo-img" src={SITE_LOGO_SRC} alt="인천섬 레저누리" width={180} height={39} />
      </Link>
      <h1 className="auth-title">{title}</h1>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
    </div>
  );
}
