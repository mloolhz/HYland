import { Link } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

type AuthTab = "login" | "signup";

type AuthTabsProps = {
  active: AuthTab;
};

export function AuthTabs({ active }: AuthTabsProps) {
  const { authSearch } = useAuthRedirect();

  return (
    <div className="auth-tabs" role="tablist" aria-label="인증 메뉴">
      <Link
        to={`/login${authSearch}`}
        role="tab"
        aria-selected={active === "login"}
        className={`auth-tab${active === "login" ? " is-active" : ""}`}
      >
        로그인
      </Link>
      <Link
        to={`/signup${authSearch}`}
        role="tab"
        aria-selected={active === "signup"}
        className={`auth-tab${active === "signup" ? " is-active" : ""}`}
      >
        회원가입
      </Link>
    </div>
  );
}
