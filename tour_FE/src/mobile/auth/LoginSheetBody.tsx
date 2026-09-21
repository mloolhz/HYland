import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, login as loginRequest } from "@/api/auth";
import { useSession } from "@/store/session";
import { MobileSocialButtons } from "./MobileSocialButtons";
import { useOAuthProviders } from "./useOAuthProviders";

type LoginSheetBodyProps = {
  onSwitchToSignup: () => void;
  onDone: () => void;
};

export function LoginSheetBody({ onSwitchToSignup, onDone }: LoginSheetBodyProps) {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const providers = useOAuthProviders();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { token, user } = await loginRequest({ username: userId.trim(), password });
      await signIn(token, user);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  const goFindAccount = () => {
    onDone();
    navigate("/find-account");
  };

  return (
    <div className="m-auth">
      <p className="m-auth__lead">인천 섬 레저를 섬 여권에 기록해보세요</p>

      <MobileSocialButtons providers={providers} />

      {/* 간편 로그인이 하나도 없으면 "또는" 구분선만 덩그러니 남아 어색하다 */}
      {providers.length > 0 && (
        <div className="m-auth__or">
          <span>아이디로 로그인</span>
        </div>
      )}

      <form className="m-form" onSubmit={handleSubmit} noValidate>
        <label className="m-field">
          <span className="m-field__label">아이디</span>
          <input
            className="m-field__input"
            type="text"
            autoComplete="username"
            inputMode="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>

        <label className="m-field">
          <span className="m-field__label">비밀번호</span>
          <span className="m-field__wrap">
            <input
              className="m-field__input"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="m-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </span>
        </label>

        {error && (
          <p className="m-field__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="m-btn m-btn--primary" disabled={loading}>
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="m-auth__links">
        <button type="button" onClick={goFindAccount}>
          아이디 찾기
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={goFindAccount}>
          비밀번호 찾기
        </button>
      </div>

      <div className="m-auth__switch">
        <span>아직 회원이 아니신가요?</span>
        <button type="button" onClick={onSwitchToSignup}>
          회원가입
        </button>
      </div>
    </div>
  );
}
