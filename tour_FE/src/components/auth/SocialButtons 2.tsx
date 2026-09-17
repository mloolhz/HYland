import { useEffect, useState } from "react";
import { fetchOAuthProviders, fetchOAuthUrl, type OAuthProvider } from "@/api/auth";

const OAUTH_STATE_KEY = "hyland-oauth-state";

/** 제공사별 표시 */
const STYLE: Record<string, { mark: string; className: string }> = {
  google: { mark: "G", className: "auth-social-google" },
  kakao: { mark: "K", className: "auth-social-kakao" },
};

export function SocialButtons() {
  /**
   * 키가 설정된 제공사만 보여준다. 눌러도 아무 일 없는 버튼을 두면
   * 안 되는 걸 되는 것처럼 보이게 만든다.
   */
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchOAuthProviders()
      .then((list) => {
        if (alive) setProviders(list);
      })
      .catch((err: unknown) => console.error("[oauth] 제공사 조회 실패:", err));
    return () => {
      alive = false;
    };
  }, []);

  const handleSns = async (provider: string) => {
    setPending(provider);
    setError("");
    try {
      // 돌아왔을 때 대조할 값 (CSRF 방지)
      const state = crypto.randomUUID();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      window.location.href = await fetchOAuthUrl(provider, state);
    } catch (err) {
      console.error("[oauth] 로그인 주소 발급 실패:", err);
      setError("잠시 후 다시 시도해주세요.");
      setPending(null);
    }
  };

  // 켜진 제공사가 없으면 구분선까지 통째로 감춘다 — 빈 "간편 로그인" 칸이
  // 남으면 기능이 고장 난 것처럼 보인다
  if (providers.length === 0) return null;

  return (
    <>
      <div className="auth-divider">
        <span>간편 로그인</span>
      </div>
      <div className="auth-social">
        {providers.map((p) => {
          const style = STYLE[p.id] ?? { mark: p.label[0], className: "" };
          return (
            <button
              key={p.id}
              type="button"
              className="auth-social-btn"
              disabled={pending !== null}
              onClick={() => handleSns(p.id)}
            >
              <span className={`auth-social-icon ${style.className}`} aria-hidden="true">
                {style.mark}
              </span>
              <span className="auth-social-label">
                {pending === p.id ? "이동 중…" : p.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="auth-social-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

export { OAUTH_STATE_KEY };
