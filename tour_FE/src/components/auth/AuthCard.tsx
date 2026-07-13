import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthTabs } from "./AuthTabs";

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
      <Link to="/" className="auth-logo" aria-label="ISLAND QUEST 홈">
        <span className="auth-logo-icon" aria-hidden="true">
          <i className="ti ti-anchor" />
        </span>
        <span className="auth-logo-text">ISLAND QUEST</span>
      </Link>
      <h1 className="auth-title">{title}</h1>
      {subtitle && <p className="auth-subtitle">{subtitle}</p>}
    </div>
  );
}
