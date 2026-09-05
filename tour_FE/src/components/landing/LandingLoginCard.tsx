import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, login as loginRequest } from "@/api/auth";
import { useSession } from "@/store/session";

/**
 * 랜딩 히어로의 로그인 카드 (비로그인 상태)
 *
 * 예전에는 이 자리에 여권 카드가 나왔는데, 로그인도 안 한 사람에게 남의
 * 닉네임과 수치가 보였다. 지금은 여권을 감추고 바로 로그인하도록 한다.
 * 로그인하면 같은 자리에 실제 여권이 들어온다.
 */
export function LandingLoginCard() {
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
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
      // 같은 자리에 여권이 뜨므로 페이지 이동은 하지 않는다
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

  return (
    <aside className="lg-card" aria-label="로그인">
      <h3 className="lg-title">LOGIN</h3>
      <p className="lg-tagline">인천섬의 레저스포츠를 즐겨보세요</p>

      <form className="lg-form" onSubmit={handleSubmit} noValidate>
        <div className="lg-field">
          <span className="lg-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4.8 20c0-3.4 3.2-5.6 7.2-5.6s7.2 2.2 7.2 5.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            type="text"
            autoComplete="username"
            placeholder="아이디를 입력하세요."
            aria-label="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="lg-field">
          <span className="lg-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8.5 10.5V8a3.5 3.5 0 017 0" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="15" r="1.3" fill="currentColor" />
            </svg>
          </span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요."
            aria-label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="lg-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="lg-submit" disabled={loading}>
          {loading ? "로그인 중…" : "로그인"}
        </button>
      </form>

      <div className="lg-links">
        <Link to="/find-account">아이디 찾기</Link>
        <span aria-hidden="true">|</span>
        <Link to="/find-account">비밀번호 찾기</Link>
        <span aria-hidden="true">|</span>
        <button type="button" onClick={() => navigate("/signup")}>
          회원가입
        </button>
      </div>
    </aside>
  );
}
