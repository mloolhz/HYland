import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthBrand } from "@/components/auth/AuthCard";
import { OAUTH_STATE_KEY } from "@/components/auth/SocialButtons";
import { ApiError, exchangeOAuthCode } from "@/api/auth";
import { useSession } from "@/store/session";

/**
 * 간편 로그인 콜백
 *
 * 제공사가 여기로 code 를 들고 돌려보낸다. code 를 백엔드에 넘겨 우리 토큰을
 * 받고, 기존 signIn() 으로 로그인한다. 토큰 교환은 서버가 하므로 이 화면은
 * 시크릿을 모른다.
 *
 * 처음 가입한 사람은 닉네임 확인 화면(/signup/nickname)으로 보낸다.
 */
export function OAuthCallback() {
  const { provider = "" } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [error, setError] = useState("");
  // React 18 StrictMode 는 effect 를 두 번 부른다. code 는 한 번만 쓸 수 있다.
  const usedRef = useRef(false);

  useEffect(() => {
    if (usedRef.current) return;
    usedRef.current = true;

    const code = params.get("code");
    const state = params.get("state");
    const denied = params.get("error");

    if (denied) {
      setError("로그인을 취소했어요.");
      return;
    }
    if (!code) {
      setError("인증 정보가 없어요. 다시 시도해주세요.");
      return;
    }

    // 내가 보낸 요청이 맞는지 대조
    const expected = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    if (expected && state !== expected) {
      setError("로그인 요청이 올바르지 않아요. 처음부터 다시 시도해주세요.");
      return;
    }

    exchangeOAuthCode(provider, code)
      .then(async ({ token, user, isNew }) => {
        await signIn(token, user);
        navigate(isNew ? "/signup/nickname" : "/", { replace: true });
      })
      .catch((err: unknown) => {
        console.error("[oauth] 로그인 실패:", err);
        setError(
          err instanceof ApiError ? err.message : "로그인 중 문제가 생겼어요.",
        );
      });
  }, [navigate, params, provider, signIn]);

  return (
    <div className="auth-page">
      <AuthBrand title="로그인" subtitle="잠시만 기다려주세요" />
      <div className="auth-card">
        {error ? (
          <div className="auth-form">
            <div className="auth-result-head auth-result-head-error">
              <span className="auth-result-icon auth-result-icon-error" aria-hidden="true">
                <i className="ti ti-alert-circle" />
              </span>
              <p className="auth-result-title">로그인하지 못했어요</p>
              <p className="auth-result-desc">{error}</p>
            </div>
            <Link to="/login" className="auth-submit auth-submit-link">
              로그인 화면으로
            </Link>
          </div>
        ) : (
          <div className="auth-form auth-oauth-loading">
            <span className="auth-spinner" aria-label="로그인 중" />
            <p>로그인하는 중이에요…</p>
          </div>
        )}
      </div>
    </div>
  );
}
