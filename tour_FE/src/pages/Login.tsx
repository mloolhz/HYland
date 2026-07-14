import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AuthBrand, AuthCard } from "@/components/auth/AuthCard";
import { CitizenBanner } from "@/components/auth/CitizenBanner";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthDivider, SocialButtons } from "@/components/auth/SocialButtons";
import { TextField } from "@/components/auth/TextField";
import {
  SAVED_USERNAME_KEY,
  setDemoLoggedIn,
} from "@/constants/auth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export function Login() {
  const { goAfterAuth, authSearch } = useAuthRedirect();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef<HTMLInputElement>(null);

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
    // TODO: POST /api/login
    await new Promise((r) => setTimeout(r, 600));
    console.log("login", { userId, password, remember });

    if (remember) localStorage.setItem(SAVED_USERNAME_KEY, userId);
    else localStorage.removeItem(SAVED_USERNAME_KEY);

    setDemoLoggedIn();
    setLoading(false);
    goAfterAuth();
  };

  return (
    <div className="auth-page">
      <AuthBrand title="로그인" />

      <AuthCard activeTab="login" showTabs={false}>
        <form className="auth-form auth-form-login" onSubmit={handleSubmit} noValidate>
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
            error={touched.userId ? errors.userId : undefined}
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
            error={touched.password ? errors.password : undefined}
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" aria-label="로그인 중" /> : "로그인"}
          </button>

          <div className="auth-find-row">
            <Link to="/find-account" className="auth-text-btn">
              아이디·비밀번호 찾기
            </Link>
          </div>

          <AuthDivider />
          <SocialButtons />

          <p className="auth-signup-cta">
            회원가입 후 다양한 콘텐츠를 즐겨보세요!
            <Link to={`/signup${authSearch}`} className="auth-signup-link">
              회원가입
            </Link>
          </p>
        </form>
      </AuthCard>

      <CitizenBanner />
    </div>
  );
}
