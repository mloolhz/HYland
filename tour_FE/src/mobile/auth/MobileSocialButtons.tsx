import { useState } from "react";
import { fetchOAuthUrl, type OAuthProvider } from "@/api/auth";
import { randomId } from "@/lib/random-id";
import { OAUTH_STATE_KEY } from "@/components/auth/SocialButtons";
import { oauthButtonLabel } from "@/constants/oauth-button-labels";
import { GoogleMark, KakaoMark } from "./SocialBrandMarks";

/**
 * 모바일 간편 로그인 — 데스크톱의 작은 아이콘 버튼과 달리 손가락으로 누르는
 * 큼직한 가로 버튼이고, 시트에서 가장 위에 온다.
 */
const BRAND: Record<string, { className: string; Mark: (props: { size?: number }) => React.ReactElement }> = {
  kakao: { className: "m-social--kakao", Mark: KakaoMark },
  google: { className: "m-social--google", Mark: GoogleMark },
};

export function MobileSocialButtons({ providers }: { providers: OAuthProvider[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  const start = async (provider: string) => {
    setPending(provider);
    setError("");
    try {
      const state = randomId();
      sessionStorage.setItem(OAUTH_STATE_KEY, state);
      window.location.href = await fetchOAuthUrl(provider, state);
    } catch (err) {
      console.error("[oauth] 로그인 주소 발급 실패:", err);
      setError("잠시 후 다시 시도해주세요.");
      setPending(null);
    }
  };

  // 키가 설정된 제공사가 없으면 통째로 감춘다 — 눌러도 안 되는 버튼을 두지 않는다
  if (providers.length === 0) return null;

  return (
    <div className="m-social">
      {providers.map((p) => {
        const brand = BRAND[p.id];
        const Mark = brand?.Mark;
        return (
          <button
            key={p.id}
            type="button"
            className={`m-social__btn ${brand?.className ?? ""}`}
            disabled={pending !== null}
            onClick={() => start(p.id)}
          >
            <span className="m-social__mark" aria-hidden="true">
              {Mark ? <Mark /> : p.label[0]}
            </span>
            <span className="m-social__label">
              {pending === p.id ? "이동 중…" : oauthButtonLabel(p.id, p.label)}
            </span>
          </button>
        );
      })}
      {error && (
        <p className="m-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
