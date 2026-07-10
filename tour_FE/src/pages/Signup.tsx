import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthBrand, AuthCard } from "@/components/auth/AuthCard";
import { DuplicateCheckField } from "@/components/auth/DuplicateCheckField";
import { FormSection } from "@/components/auth/FormSection";
import { PasswordField } from "@/components/auth/PasswordField";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { TextField } from "@/components/auth/TextField";
import { isTermsValid, TermsAgreement } from "@/components/auth/TermsAgreement";
import { mockCheckNickname, mockCheckUserId } from "@/constants/auth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import {
  validateEmailOptional,
  validateNickname,
  validateUserId,
} from "@/lib/authValidation";
import { isPasswordValid } from "@/lib/passwordStrength";

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

  const passwordValid = password.length >= 8 && isPasswordValid(password);
  const confirmMatch = password === confirm && confirm.length > 0;

  const submitHint = useMemo(() => {
    if (!userIdChecked) return "아이디 중복 확인이 필요해요";
    if (!passwordValid) return "비밀번호 조건을 확인해주세요";
    if (!confirmMatch) return "비밀번호 확인이 필요해요";
    if (phoneVerify.step !== "verified") return "전화번호 인증이 필요해요";
    if (!nicknameChecked) return "닉네임 중복 확인이 필요해요";
    if (!isTermsValid(terms.terms, terms.privacy)) return "필수 약관에 동의해주세요";
    return null;
  }, [
    userIdChecked,
    passwordValid,
    confirmMatch,
    phoneVerify.step,
    nicknameChecked,
    terms.terms,
    terms.privacy,
  ]);

  const canSubmit =
    userIdChecked &&
    passwordValid &&
    confirmMatch &&
    phoneVerify.step === "verified" &&
    nicknameChecked &&
    isTermsValid(terms.terms, terms.privacy) &&
    !loading;

  const validatePasswordField = useCallback(
    (field: "password" | "confirm") => {
      const e: Record<string, string> = {};
      if (field === "password") {
        if (password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다";
        else if (!isPasswordValid(password)) e.password = "영문과 숫자를 모두 포함해주세요";
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
        if (value.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다";
        else if (!isPasswordValid(value)) next.password = "영문과 숫자를 모두 포함해주세요";
        else delete next.password;
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
      nickname,
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
      <AuthBrand title="회원가입" subtitle="168개 섬의 탐험 기록을 남겨보세요" />

      <AuthCard activeTab="signup">
        <form className="auth-form auth-form-signup" onSubmit={handleSubmit} noValidate>
          <FormSection title="계정 정보" first>
            <DuplicateCheckField
              id="signup-userId"
              label="아이디"
              value={userId}
              onChange={setUserId}
              hint="영문 소문자로 시작, 4~16자"
              icon={<i className="ti ti-user" />}
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
              />
              <PasswordStrengthBar password={password} />
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
            />
          </FormSection>

          <FormSection title="본인 확인">
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
              label="닉네임"
              value={nickname}
              onChange={setNickname}
              hint="커뮤니티에 표시되는 이름이에요. 나중에 변경할 수 있어요."
              icon={<i className="ti ti-user" />}
              placeholder="닉네임 (2~10자)"
              autoComplete="nickname"
              validateFormat={validateNickname}
              checkDuplicate={mockCheckNickname}
              onCheckedChange={setNicknameChecked}
            />

            <TextField
              id="signup-email"
              label="이메일 (선택)"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="이메일 (선택)"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              hint="예약 확인과 소식을 받아볼 수 있어요"
              icon={<i className="ti ti-mail" />}
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
              "가입하고 탐험 시작하기"
            )}
          </button>
          {submitHint && !canSubmit && (
            <p className="auth-submit-hint" role="status">
              {submitHint}
            </p>
          )}
        </form>
      </AuthCard>

      <p className="auth-footer-link">
        이미 계정이 있으신가요?{" "}
        <Link to={`/login${authSearch}`}>로그인</Link>
      </p>
    </div>
  );
}
