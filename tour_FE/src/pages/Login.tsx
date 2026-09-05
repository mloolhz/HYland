import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthBrand, AuthCard } from "@/components/auth/AuthCard";
import { CitizenBanner } from "@/components/auth/CitizenBanner";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthDivider, SocialButtons } from "@/components/auth/SocialButtons";
import { TextField } from "@/components/auth/TextField";
import { SAVED_USERNAME_KEY, setGuest } from "@/constants/auth";
import { login as loginRequest, ApiError } from "@/api/auth";
import { useSession } from "@/store/session";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export function Login() {
  const navigate = useNavigate();
  const { redirect, goAfterAuth, authSearch } = useAuthRedirect();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef<HTMLInputElement>(null);
  const { signIn } = useSession();

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_USERNAME_KEY);
    if (saved) {
      setUserId(saved);
      setRemember(true);
    }
  }, []);

  const validateField = useCallback(
    (field: "userId" | "password", values = { userId, password }) => {
      const e: Record<string, string> = {};
      if (field === "userId" && !values.userId.trim()) {
        e.userId = "아이디를 입력해주세요";
      }
      if (field === "password" && !values.password) {
        e.password = "비밀번호를 입력해주세요";
      }
      setErrors((prev) => {
        const next = { ...prev };
        if (e[field]) next[field] = e[field];
        else delete next[field];
        return next;
      });
      return !e[field];
    },
    [userId, password],
  );

  const validateAll = useCallback(() => {
    const e: Record<string, string> = {};
    if (!userId.trim()) e.userId = "아이디를 입력해주세요";
    if (!password) e.password = "비밀번호를 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [userId, password]);

  const handleBlur = (field: "userId" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserId(value);
    if (touched.userId || errors.userId) {
      validateField("userId", { userId: value, password });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password || errors.password) {
      validateField("password", { userId, password: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ userId: true, password: true });
    if (!validateAll()) {
      userIdRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await loginRequest({ username: userId.trim(), password });
      await signIn(token, user);

      if (remember) localStorage.setItem(SAVED_USERNAME_KEY, userId.trim());
      else localStorage.removeItem(SAVED_USERNAME_KEY);

      setLoading(false);
      goAfterAuth();
    } catch (err) {
      setLoading(false);
      // 서버가 준 문구를 그대로 보여준다 ("아이디 또는 비밀번호가 올바르지 않아요")
      const message =
        err instanceof ApiError ? err.message : "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.";
      setErrors((prev) => ({ ...prev, form: message }));
      userIdRef.current?.focus();
    }
  };

  const handleGuest = () => {
    setGuest();
    navigate(redirect, { replace: true });
  };

  return (
    <div className="auth-page">
      <AuthBrand title="로그인" subtitle="168개 섬의 탐험 기록이 기다리고 있어요" />

      <AuthCard activeTab="login">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="login-userId"
            label="아이디"
            type="text"
            autoComplete="username"
            inputMode="text"
            placeholder="아이디"
            value={userId}
            onChange={handleUserIdChange}
            onBlur={() => handleBlur("userId")}
            error={errors.userId}
            icon={<i className="ti ti-user" />}
            ref={userIdRef}
          />

          <PasswordField
            id="login-password"
            label="비밀번호"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            error={errors.password}
          />

          <label htmlFor="remember-me" className="auth-check-label auth-remember-only">
            <input
              id="remember-me"
              type="checkbox"
              className="auth-check-input"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="auth-check-box" aria-hidden="true">
              {remember && <i className="ti ti-check" />}
            </span>
            <span className="auth-check-text">아이디 저장</span>
          </label>

          <nav className="auth-find-links" aria-label="계정 찾기">
            <Link to="/find-account">아이디 찾기</Link>
            <span className="auth-find-divider" aria-hidden="true" />
            <Link to="/find-account?tab=password">비밀번호 찾기</Link>
          </nav>

          {errors.form && (
            <p className="auth-form-error" role="alert">
              {errors.form}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" aria-label="로그인 중" /> : "로그인"}
          </button>

          <AuthDivider />
          <SocialButtons />

          <button type="button" className="auth-guest-btn" onClick={handleGuest}>
            <i className="ti ti-eye" aria-hidden="true" />
            비회원으로 둘러보기
          </button>
        </form>
      </AuthCard>

      <CitizenBanner />

      <p className="auth-footer-link">
        아직 계정이 없으신가요?{" "}
        <Link to={`/signup${authSearch}`}>회원가입</Link>
      </p>
    </div>
  );
}
