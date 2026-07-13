import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthBrand, AuthCard } from "@/components/auth/AuthCard";
import { DuplicateCheckField } from "@/components/auth/DuplicateCheckField";
import { FormSection } from "@/components/auth/FormSection";
import { PasswordField } from "@/components/auth/PasswordField";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { TextField } from "@/components/auth/TextField";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { isTermsValid, TermsAgreement } from "@/components/auth/TermsAgreement";
import { mockCheckNickname, mockCheckUserId } from "@/constants/auth";
import { isPasswordFullyValid, isPasswordAllowedChars } from "@/constants/validation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import {
  validateEmailOptional,
  validateNicknameOptional,
  validateUserId,
} from "@/lib/authValidation";

export function Signup() {
  const navigate = useNavigate();
  const { authSearch } = useAuthRedirect();
  const phoneVerify = usePhoneVerification();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState({ terms: false, privacy: false, marketing: false });
  const [userIdChecked, setUserIdChecked] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const passwordValid = isPasswordFullyValid(password) && isPasswordAllowedChars(password);
  const confirmMatch = password === confirm && confirm.length > 0;

  const nicknameFilled = nickname.trim().length > 0;
  const nicknameValid = !nicknameFilled || nicknameChecked;

  const canSubmit =
    userIdChecked &&
    passwordValid &&
    confirmMatch &&
    phoneVerify.step === "verified" &&
    nicknameValid &&
    isTermsValid(terms.terms, terms.privacy) &&
    !loading;

  const validatePasswordField = useCallback(
    (field: "password" | "confirm") => {
      const e: Record<string, string> = {};
      if (field === "password") {
        if (!isPasswordAllowedChars(password)) {
          e.password = "사용할 수 없는 문자가 포함되어 있어요";
        } else if (!isPasswordFullyValid(password)) {
          e.password = "비밀번호 조건을 확인해주세요";
        }
      }
      if (field === "confirm" && password !== confirm) {
        e.confirm = "비밀번호가 일치하지 않습니다";
      }
      setErrors((prev) => {
        const next = { ...prev };
        if (e[field]) next[field] = e[field];
        else delete next[field];
        return next;
      });
    },
    [password, confirm],
  );

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "password" || field === "confirm") validatePasswordField(field);
    if (field === "email") {
      const err = validateEmailOptional(email);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next.email = err;
        else delete next.email;
        return next;
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password || errors.password) {
      setErrors((prev) => {
        const next = { ...prev };
        if (!isPasswordAllowedChars(value)) {
          next.password = "사용할 수 없는 문자가 포함되어 있어요";
        } else if (!isPasswordFullyValid(value)) {
          next.password = "비밀번호 조건을 확인해주세요";
        } else {
          delete next.password;
        }
        return next;
      });
    }
    if (touched.confirm || errors.confirm) {
      setErrors((prev) => {
        const next = { ...prev };
        if (value !== confirm) next.confirm = "비밀번호가 일치하지 않습니다";
        else delete next.confirm;
        return next;
      });
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirm(e.target.value);
    if (touched.confirm || errors.confirm) validatePasswordField("confirm");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email || errors.email) {
      const err = validateEmailOptional(value);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next.email = err;
        else delete next.email;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    const formData = {
      userId,
      phone: phoneVerify.phoneDigits,
      email: email || undefined,
      nickname: nickname.trim() || undefined,
      ...terms,
    };
    // TODO: POST /api/signup
    await new Promise((r) => setTimeout(r, 600));
    console.log(formData);
    setLoading(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="auth-page auth-page-signup">
      <AuthBrand title="회원가입" />

      <AuthCard activeTab="signup" showTabs={false}>
        <form className="auth-form auth-form-signup" onSubmit={handleSubmit} noValidate>
          <FormSection title="계정 정보" first required>
            <DuplicateCheckField
              id="signup-userId"
              label="아이디"
              value={userId}
              onChange={setUserId}
              hint="영문 소문자로 시작, 4~16자"
              placeholder="아이디"
              autoComplete="username"
              validateFormat={validateUserId}
              checkDuplicate={mockCheckUserId}
              onCheckedChange={setUserIdChecked}
            />

            <div className="auth-field-group">
              <PasswordField
                id="signup-password"
                label="비밀번호"
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                icon={null}
              />
              <PasswordStrengthBar password={password} />
              <PasswordRules password={password} />
            </div>

            <PasswordField
              id="signup-confirm"
              label="비밀번호 확인"
              autoComplete="new-password"
              placeholder="비밀번호 확인"
              value={confirm}
              onChange={handleConfirmChange}
              onBlur={() => handleBlur("confirm")}
              error={errors.confirm}
              icon={null}
            />
          </FormSection>

          <FormSection title="본인 확인" required>
            <PhoneVerification
              phone={phoneVerify.phone}
              setPhone={phoneVerify.setPhone}
              code={phoneVerify.code}
              setCode={phoneVerify.setCode}
              step={phoneVerify.step}
              seconds={phoneVerify.seconds}
              resendSeconds={phoneVerify.resendSeconds}
              errors={phoneVerify.errors}
              sendCode={phoneVerify.sendCode}
              verifyCode={phoneVerify.verifyCode}
              isPhoneValid={phoneVerify.isPhoneValid}
            />
          </FormSection>

          <FormSection title="프로필">
            <DuplicateCheckField
              id="signup-nickname"
              label="닉네임 (선택)"
              value={nickname}
              onChange={setNickname}
              hint="커뮤니티에 표시되는 이름이에요. 나중에 변경할 수 있어요."
              placeholder="닉네임 (2~10자)"
              autoComplete="nickname"
              validateFormat={validateNicknameOptional}
              checkDuplicate={mockCheckNickname}
              onCheckedChange={setNicknameChecked}
            />

            <TextField
              id="signup-email"
              label="이메일"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="이메일"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              hint="예약 확인과 소식을 받아볼 수 있어요"
            />
          </FormSection>

          <FormSection title="약관">
            <TermsAgreement
              terms={terms.terms}
              privacy={terms.privacy}
              marketing={terms.marketing}
              onChange={setTerms}
            />
          </FormSection>

          <button type="submit" className="auth-submit" disabled={!canSubmit}>
            {loading ? (
              <span className="auth-spinner" aria-label="가입 중" />
            ) : (
              "회원가입"
            )}
          </button>
        </form>
      </AuthCard>

      <p className="auth-footer-link">
        이미 계정이 있으신가요?{" "}
        <Link to={`/login${authSearch}`}>로그인</Link>
      </p>
    </div>
  );
}
