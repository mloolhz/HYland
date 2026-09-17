import { Link } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useTabIndicator } from "@/hooks/useTabIndicator";

type AuthTab = "login" | "signup";

type AuthTabsProps = {
  active: AuthTab;
};

export function AuthTabs({ active }: AuthTabsProps) {
  const { authSearch } = useAuthRedirect();
  const { listRef, setTabRef, ind } = useTabIndicator(active);

  return (
    <div className="auth-tabs" role="tablist" aria-label="인증 메뉴" ref={listRef}>
      <Link
        ref={setTabRef("login")}
        to={`/login${authSearch}`}
        role="tab"
        aria-selected={active === "login"}
        className={`auth-tab${active === "login" ? " is-active" : ""}`}
      >
        로그인
      </Link>
      <Link
        ref={setTabRef("signup")}
        to={`/signup${authSearch}`}
        role="tab"
        aria-selected={active === "signup"}
        className={`auth-tab${active === "signup" ? " is-active" : ""}`}
      >
        회원가입
      </Link>
      <span
        className="auth-tab-indicator"
        aria-hidden="true"
        style={{
          width: ind.width,
          transform: `translateX(${ind.left}px)`,
        }}
      />
    </div>
  );
}
