import { useEffect, useState, type ReactNode } from "react";
import { fetchOAuthProviders, fetchOAuthUrl, type OAuthProvider } from "@/api/auth";
import { randomId } from "@/lib/random-id";

const OAUTH_STATE_KEY = "hyland-oauth-state";

/** 구글 공식 4색 G 로고 */
const GoogleMark = (
  <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

/** 카카오톡 말풍선 심볼 */
const KakaoMark = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path
      fill="#3C1E1E"
      d="M12 3.6c-4.97 0-9 3.14-9 7.02 0 2.49 1.66 4.67 4.16 5.92-.18.63-.66 2.4-.76 2.77-.12.46.17.45.36.33.15-.1 2.4-1.63 3.37-2.29.6.09 1.23.13 1.87.13 4.97 0 9-3.14 9-7.02S16.97 3.6 12 3.6z"
    />
  </svg>
);

/** 제공사별 표시 (실제 로고) */
const STYLE: Record<string, { mark: ReactNode; className: string }> = {
  google: { mark: GoogleMark, className: "auth-social-google" },
  kakao: { mark: KakaoMark, className: "auth-social-kakao" },
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
      const state = randomId();
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
