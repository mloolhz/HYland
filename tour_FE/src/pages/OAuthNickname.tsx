import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthBrand } from "@/components/auth/AuthCard";
import { TextField } from "@/components/auth/TextField";
import { checkNicknameTaken } from "@/api/auth";
import { updateProfile } from "@/api/me";
import { useSession } from "@/store/session";
import { validateNickname } from "@/lib/authValidation";

/**
 * 간편 로그인으로 처음 가입한 사람의 닉네임 확인
 *
 * 제공사 닉네임을 그대로 채워 두고, 마음에 들면 그냥 넘어가면 된다.
 * 겹쳤을 때는 서버가 이미 숫자를 붙여 뒀으므로 이 화면에서 바꾸면 된다.
 */
export function OAuthNickname() {
  const navigate = useNavigate();
  const { user, refresh } = useSession();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = nickname.trim();

    const invalid = validateNickname(value);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError("");
    try {
      // 서버가 붙여 준 그대로면 중복 확인이 필요 없다
      if (value !== user?.nickname && (await checkNicknameTaken(value))) {
        setError("이미 사용 중인 닉네임이에요");
        return;
      }
      if (value !== user?.nickname) await updateProfile({ nickname: value });
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("[oauth] 닉네임 저장 실패:", err);
      setError("닉네임을 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrand title="환영해요" subtitle="커뮤니티에서 쓸 닉네임을 확인해주세요" />

      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="oauth-nickname"
            label="닉네임"
            type="text"
            autoComplete="nickname"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              if (error) setError("");
            }}
            error={error}
            icon={<i className="ti ti-user" />}
          />
          <p className="auth-submit-hint">나중에 마이페이지에서 바꿀 수 있어요.</p>

          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? <span className="auth-spinner" aria-label="저장 중" /> : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
