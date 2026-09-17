import { useCallback, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link, useSearchParams } from "react-router-dom";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { CONTAINER } from "@/constants/layout";
import { isPasswordAllowedChars, isPasswordFullyValid } from "@/constants/validation";
import { ApiError, changePassword } from "@/api/auth";
import { updateProfile } from "@/api/me";
import { useSession } from "@/store/session";

type ProfileTab = "profile" | "password";

function parseTab(value: string | null): ProfileTab {
  return value === "password" ? "password" : "profile";
}

export function MyPageProfileEdit() {
  const profile = useUserProfile();
  const { refresh } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const [nickname, setNickname] = useState(profile.nickname);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const setTab = (tab: ProfileTab) => {
    setSearchParams(tab === "profile" ? {} : { tab }, { replace: true });
    setProfileSaved(false);
    setPasswordSaved(false);
  };

  const passwordValid = isPasswordFullyValid(password) && isPasswordAllowedChars(password);
  const confirmMatch = password === confirm && confirm.length > 0;
  const canSavePassword =
    currentPassword.length > 0 && passwordValid && confirmMatch && !passwordSaving;

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) return;
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError("");
    try {
      await updateProfile({ nickname: nickname.trim() });
      // 헤더·여권이 바뀐 닉네임을 바로 반영하도록 세션을 다시 읽는다
      await refresh();
      setProfileSaved(true);
    } catch (err) {
      console.error("[profile] 저장 실패:", err);
      setProfileError(
        err instanceof ApiError ? err.message : "저장하지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const errors: Record<string, string> = {};
      if (!currentPassword) errors.currentPassword = "현재 비밀번호를 입력해주세요";
      if (!isPasswordAllowedChars(password)) {
        errors.password = "사용할 수 없는 문자가 포함되어 있어요";
      } else if (!isPasswordFullyValid(password)) {
        errors.password = "비밀번호 조건을 확인해주세요";
      }
      if (password !== confirm) errors.confirm = "비밀번호가 일치하지 않습니다";
      setPasswordErrors(errors);
      if (Object.keys(errors).length > 0) return;

      setPasswordSaving(true);
      setPasswordSaved(false);
      void (async () => {
        try {
          await changePassword({ currentPassword, newPassword: password });
          setPasswordSaved(true);
          setCurrentPassword("");
          setPassword("");
          setConfirm("");
        } catch (err) {
          console.error("[auth] 비밀번호 변경 실패:", err);
          // 현재 비밀번호가 틀린 경우가 대부분이라 그 칸에 붙여 보여준다
          setPasswordErrors({
            currentPassword:
              err instanceof ApiError ? err.message : "비밀번호를 바꾸지 못했어요.",
          });
        } finally {
          setPasswordSaving(false);
        }
      })();
    },
    [confirm, currentPassword, password],
  );

  return (
    <main className="mp-page mp-page--settings">
      <div className={CONTAINER}>
        <div className="mp-settings-head">
          <Link to="/mypage/settings" className="mp-settings-back">
            ← 설정
          </Link>
          <h2 className="mp-settings-title">회원정보 수정</h2>
        </div>

        <section
          className="mp-section mp-settings-section mp-settings-section--with-tabs"
          aria-label="회원정보 수정"
        >
          <div className="mp-settings-tabs" role="tablist" aria-label="회원정보 수정 메뉴">
            <button
              type="button"
              role="tab"
              id="mp-profile-tab-profile"
              aria-selected={activeTab === "profile"}
              aria-controls="mp-profile-panel-profile"
              className={`mp-settings-tab${activeTab === "profile" ? " is-active" : ""}`}
              onClick={() => setTab("profile")}
            >
              회원정보 수정
            </button>
            <button
              type="button"
              role="tab"
              id="mp-profile-tab-password"
              aria-selected={activeTab === "password"}
              aria-controls="mp-profile-panel-password"
              className={`mp-settings-tab${activeTab === "password" ? " is-active" : ""}`}
              onClick={() => setTab("password")}
            >
              비밀번호 변경
            </button>
          </div>

          {activeTab === "profile" ? (
            <div
              role="tabpanel"
              id="mp-profile-panel-profile"
              aria-labelledby="mp-profile-tab-profile"
              className="mp-settings-tab-panel"
            >
              <form className="mp-settings-form" onSubmit={handleProfileSubmit}>
                <div className="mp-settings-field">
                  <label htmlFor="mp-profile-nickname">닉네임</label>
                  <input
                    id="mp-profile-nickname"
                    type="text"
                    value={nickname}
                    onChange={(event) => {
                      setNickname(event.target.value);
                      setProfileSaved(false);
                    }}
                    autoComplete="nickname"
                  />
                </div>
                {profileSaved && (
                  <p className="mp-settings-form-msg mp-settings-form-msg--success" role="status">
                    저장되었습니다.
                  </p>
                )}
                {profileError && (
                  <p className="mp-settings-form-msg mp-settings-form-msg--error" role="alert">
                    {profileError}
                  </p>
                )}
                <button type="submit" className="mp-settings-submit" disabled={profileSaving}>
                  {profileSaving ? "저장 중…" : "저장하기"}
                </button>
              </form>
            </div>
          ) : (
            <div
              role="tabpanel"
              id="mp-profile-panel-password"
              aria-labelledby="mp-profile-tab-password"
              className="mp-settings-tab-panel"
            >
              <form className="mp-settings-form" onSubmit={handlePasswordSubmit}>
                <div className="mp-settings-field">
                  <label htmlFor="mp-current-password">현재 비밀번호</label>
                  <PasswordField
                    id="mp-current-password"
                    label="현재 비밀번호"
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPasswordSaved(false);
                    }}
                    error={passwordErrors.currentPassword}
                    autoComplete="current-password"
                  />
                </div>
                <div className="mp-settings-field">
                  <label htmlFor="mp-new-password">새 비밀번호</label>
                  <PasswordField
                    id="mp-new-password"
                    label="새 비밀번호"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordSaved(false);
                    }}
                    error={passwordErrors.password}
                    autoComplete="new-password"
                  />
                </div>
                <PasswordStrengthBar password={password} />
                <PasswordRules password={password} />
                <div className="mp-settings-field">
                  <label htmlFor="mp-confirm-password">새 비밀번호 확인</label>
                  <PasswordField
                    id="mp-confirm-password"
                    label="새 비밀번호 확인"
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      setPasswordSaved(false);
                    }}
                    error={passwordErrors.confirm}
                    autoComplete="new-password"
                  />
                </div>
                {passwordSaved && (
                  <p className="mp-settings-form-msg mp-settings-form-msg--success" role="status">
                    비밀번호가 변경되었습니다.
                  </p>
                )}
                <button type="submit" className="mp-settings-submit" disabled={!canSavePassword}>
                  {passwordSaving ? "변경 중…" : "비밀번호 변경"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
