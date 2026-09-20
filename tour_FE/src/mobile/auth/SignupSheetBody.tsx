import { useCallback, useMemo, useState } from "react";
import {
  ApiError,
  checkNicknameTaken,
  checkUsernameTaken,
  signup as signupRequest,
} from "@/api/auth";
import { useSession } from "@/store/session";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import {
  getPasswordRuleStatus,
  isPasswordAllowedChars,
  isPasswordFullyValid,
} from "@/constants/validation";
import {
  validateEmailOptional,
  validateNickname,
  validateUserId,
} from "@/lib/authValidation";

type DupState = "idle" | "checking" | "ok" | "taken" | "invalid";

const STEPS = ["계정", "본인확인", "프로필", "약관"] as const;

type SignupSheetBodyProps = {
  step: number;
  onStepChange: (step: number) => void;
  onSwitchToLogin: () => void;
  onDone: () => void;
};

/**
 * 모바일 회원가입 — 데스크톱의 긴 한 장짜리 폼을 4단계로 쪼갰다.
 * 한 화면에 한 가지만 묻고, 다음 버튼은 시트 아래에 고정한다.
 */
export function SignupSheetBody({
  step,
  onStepChange,
  onSwitchToLogin,
  onDone,
}: SignupSheetBodyProps) {
  const { signIn } = useSession();
  const phoneVerify = usePhoneVerification();

  const [userId, setUserId] = useState("");
  const [userIdState, setUserIdState] = useState<DupState>("idle");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nickname, setNickname] = useState("");
  const [nicknameState, setNicknameState] = useState<DupState>("idle");
  const [email, setEmail] = useState("");

  const [terms, setTerms] = useState({ terms: false, privacy: false, marketing: false });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const pwRules = getPasswordRuleStatus(password);
  const passwordValid = isPasswordFullyValid(password);
  const confirmMatch = confirm.length > 0 && password === confirm;
  const emailError = validateEmailOptional(email);

  const checkUserId = useCallback(async () => {
    const formatError = validateUserId(userId.trim());
    if (formatError) {
      setUserIdState("invalid");
      return;
    }
    setUserIdState("checking");
    try {
      const taken = await checkUsernameTaken(userId.trim());
      setUserIdState(taken ? "taken" : "ok");
    } catch {
      setUserIdState("idle");
      setFormError("중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }, [userId]);

  const checkNickname = useCallback(async () => {
    const formatError = validateNickname(nickname.trim());
    if (formatError) {
      setNicknameState("invalid");
      return;
    }
    setNicknameState("checking");
    try {
      const taken = await checkNicknameTaken(nickname.trim());
      setNicknameState(taken ? "taken" : "ok");
    } catch {
      setNicknameState("idle");
      setFormError("중복 확인에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  }, [nickname]);

  const canGoNext = useMemo(() => {
    if (step === 0) return userIdState === "ok" && passwordValid && confirmMatch;
    if (step === 1) return phoneVerify.step === "verified";
    if (step === 2) return nicknameState === "ok" && !emailError;
    return terms.terms && terms.privacy && !submitting;
  }, [
    step,
    userIdState,
    passwordValid,
    confirmMatch,
    phoneVerify.step,
    nicknameState,
    emailError,
    terms.terms,
    terms.privacy,
    submitting,
  ]);

  const nextHint = useMemo(() => {
    if (step === 0) {
      if (userIdState !== "ok") return "아이디 중복 확인이 필요해요";
      if (!passwordValid) return "비밀번호 조건을 확인해주세요";
      if (!confirmMatch) return "비밀번호 확인이 필요해요";
    }
    if (step === 1 && phoneVerify.step !== "verified") return "휴대폰 인증이 필요해요";
    if (step === 2) {
      if (nicknameState !== "ok") return "닉네임 중복 확인이 필요해요";
      if (emailError) return emailError;
    }
    if (step === 3 && !(terms.terms && terms.privacy)) return "필수 약관에 동의해주세요";
    return null;
  }, [
    step,
    userIdState,
    passwordValid,
    confirmMatch,
    phoneVerify.step,
    nicknameState,
    emailError,
    terms.terms,
    terms.privacy,
  ]);

  const submit = async () => {
    setSubmitting(true);
    setFormError("");
    try {
      const { token, user } = await signupRequest({
        username: userId.trim(),
        password,
        nickname: nickname.trim(),
        email: email || undefined,
        phone: phoneVerify.phoneDigits || undefined,
      });
      await signIn(token, user);
      onDone();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "가입 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (step < 3) onStepChange(step + 1);
    else void submit();
  };

  const allAgreed = terms.terms && terms.privacy && terms.marketing;

  return (
    <div className="m-auth m-signup">
      <ol className="m-steps" aria-label="회원가입 단계">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`m-steps__item${i === step ? " is-current" : ""}${i < step ? " is-done" : ""}`}
          >
            <span className="m-steps__dot">{i < step ? "✓" : i + 1}</span>
            <span className="m-steps__label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="m-signup__panel">
        {step === 0 && (
          <>
            <h3 className="m-signup__title">로그인에 쓸 아이디를 정해주세요</h3>

            <div className="m-field">
              <span className="m-field__label">아이디</span>
              <span className="m-field__wrap">
                <input
                  className="m-field__input"
                  type="text"
                  autoComplete="username"
                  placeholder="영문 소문자로 시작, 4~16자"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setUserIdState("idle");
                  }}
                />
                <button
                  type="button"
                  className="m-field__action"
                  onClick={checkUserId}
                  disabled={!userId.trim() || userIdState === "checking"}
                >
                  {userIdState === "checking" ? "확인 중" : "중복확인"}
                </button>
              </span>
              {userIdState === "invalid" && (
                <p className="m-field__error">영문 소문자로 시작하는 4~16자 영문/숫자</p>
              )}
              {userIdState === "taken" && <p className="m-field__error">이미 쓰이고 있는 아이디예요</p>}
              {userIdState === "ok" && <p className="m-field__ok">사용할 수 있는 아이디예요</p>}
            </div>

            <div className="m-field">
              <span className="m-field__label">비밀번호</span>
              <span className="m-field__wrap">
                <input
                  className="m-field__input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              <ul className="m-pwrules">
                <li className={pwRules.length ? "is-ok" : ""}>8자 이상</li>
                <li className={pwRules.alphanumeric ? "is-ok" : ""}>영문+숫자</li>
                <li className={pwRules.special ? "is-ok" : ""}>특수문자</li>
              </ul>
              {!isPasswordAllowedChars(password) && (
                <p className="m-field__error">사용할 수 없는 문자가 포함되어 있어요</p>
              )}
            </div>

            <div className="m-field">
              <span className="m-field__label">비밀번호 확인</span>
              <input
                className="m-field__input"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="한 번 더 입력"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm.length > 0 && !confirmMatch && (
                <p className="m-field__error">비밀번호가 일치하지 않습니다</p>
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="m-signup__title">본인 확인을 위해 휴대폰 번호를 알려주세요</h3>

            <div className="m-field">
              <span className="m-field__label">휴대폰 번호</span>
              <span className="m-field__wrap">
                <input
                  className="m-field__input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  value={phoneVerify.phone}
                  onChange={(e) => phoneVerify.setPhone(e.target.value)}
                  disabled={phoneVerify.step === "verified"}
                />
                <button
                  type="button"
                  className="m-field__action"
                  onClick={phoneVerify.sendCode}
                  disabled={
                    !phoneVerify.isPhoneValid ||
                    phoneVerify.step === "verified" ||
                    phoneVerify.resendSeconds > 0
                  }
                >
                  {phoneVerify.resendSeconds > 0
                    ? `${phoneVerify.resendSeconds}초`
                    : phoneVerify.step === "idle"
                      ? "인증요청"
                      : "재전송"}
                </button>
              </span>
              {phoneVerify.errors.phone && (
                <p className="m-field__error">{phoneVerify.errors.phone}</p>
              )}
            </div>

            {phoneVerify.step !== "idle" && (
              <div className="m-field">
                <span className="m-field__label">인증번호</span>
                <span className="m-field__wrap">
                  <input
                    className="m-field__input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6자리"
                    value={phoneVerify.code}
                    onChange={(e) => phoneVerify.setCode(e.target.value.replace(/\D/g, ""))}
                    disabled={phoneVerify.step === "verified"}
                  />
                  <button
                    type="button"
                    className="m-field__action"
                    onClick={phoneVerify.verifyCode}
                    disabled={phoneVerify.step === "verified" || phoneVerify.code.length !== 6}
                  >
                    확인
                  </button>
                </span>
                {phoneVerify.step === "sent" && (
                  <p className="m-field__hint">
                    남은 시간 {Math.floor(phoneVerify.seconds / 60)}:
                    {String(phoneVerify.seconds % 60).padStart(2, "0")}
                    {phoneVerify.devCode && ` · 테스트 코드 ${phoneVerify.devCode}`}
                  </p>
                )}
                {phoneVerify.errors.code && (
                  <p className="m-field__error">{phoneVerify.errors.code}</p>
                )}
                {phoneVerify.step === "verified" && (
                  <p className="m-field__ok">인증이 완료됐어요</p>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="m-signup__title">커뮤니티에서 쓸 닉네임을 정해주세요</h3>

            <div className="m-field">
              <span className="m-field__label">닉네임</span>
              <span className="m-field__wrap">
                <input
                  className="m-field__input"
                  type="text"
                  placeholder="2~10자"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameState("idle");
                  }}
                />
                <button
                  type="button"
                  className="m-field__action"
                  onClick={checkNickname}
                  disabled={!nickname.trim() || nicknameState === "checking"}
                >
                  {nicknameState === "checking" ? "확인 중" : "중복확인"}
                </button>
              </span>
              {nicknameState === "invalid" && <p className="m-field__error">닉네임은 2~10자여야 합니다</p>}
              {nicknameState === "taken" && <p className="m-field__error">이미 쓰이고 있는 닉네임이에요</p>}
              {nicknameState === "ok" && <p className="m-field__ok">사용할 수 있는 닉네임이에요</p>}
            </div>

            <div className="m-field">
              <span className="m-field__label">
                이메일 <em className="m-field__optional">선택</em>
              </span>
              <input
                className="m-field__input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="비밀번호 찾기에 쓰여요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && <p className="m-field__error">{emailError}</p>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="m-signup__title">약관에 동의해주세요</h3>

            <button
              type="button"
              className={`m-terms__all${allAgreed ? " is-on" : ""}`}
              onClick={() => {
                const next = !allAgreed;
                setTerms({ terms: next, privacy: next, marketing: next });
              }}
            >
              <span className="m-terms__check" aria-hidden="true">
                ✓
              </span>
              전체 동의
            </button>

            <ul className="m-terms__list">
              {(
                [
                  { key: "terms", label: "이용약관 동의", required: true },
                  { key: "privacy", label: "개인정보 처리방침 동의", required: true },
                  { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
                ] as const
              ).map((item) => (
                <li key={item.key}>
                  <label className="m-terms__row">
                    <input
                      type="checkbox"
                      checked={terms[item.key]}
                      onChange={(e) => setTerms((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                    />
                    <span className="m-terms__check" aria-hidden="true">
                      ✓
                    </span>
                    <span className="m-terms__label">
                      <em>{item.required ? "필수" : "선택"}</em> {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        {formError && (
          <p className="m-field__error" role="alert">
            {formError}
          </p>
        )}
      </div>

      <div className="m-signup__foot">
        {nextHint && <p className="m-signup__hint">{nextHint}</p>}
        <button
          type="button"
          className="m-btn m-btn--primary"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {step < 3 ? "다음" : submitting ? "가입 중…" : "가입하고 시작하기"}
        </button>
        {step === 0 && (
          <div className="m-auth__switch">
            <span>이미 계정이 있으신가요?</span>
            <button type="button" onClick={onSwitchToLogin}>
              로그인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
