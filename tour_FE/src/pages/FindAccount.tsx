import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthBrand } from "@/components/auth/AuthCard";
import { FoundAccountCard } from "@/components/auth/FoundAccountCard";
import { PasswordField } from "@/components/auth/PasswordField";
import { PasswordRules } from "@/components/auth/PasswordRules";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import { PhoneVerification } from "@/components/auth/PhoneVerification";
import { SnsHintBanner } from "@/components/auth/SnsHintBanner";
import { StepIndicator } from "@/components/auth/StepIndicator";
import { TextField } from "@/components/auth/TextField";
import {
  isPasswordAllowedChars,
  isPasswordFullyValid,
} from "@/constants/validation";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { useTabIndicator } from "@/hooks/useTabIndicator";
import {
  findAccountByCredentials,
  findAccountsByNameAndPhone,
  maskUserId,
  type MockAccount,
} from "@/mocks/accounts";

type Tab = "id" | "password";
type Step = 1 | 2;

function parseTab(value: string | null): Tab {
  return value === "password" ? "password" : "id";
}

export function FindAccount() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const { listRef, setTabRef, ind } = useTabIndicator(tab);
  const phoneVerify = usePhoneVerification();
  const resetPhone = phoneVerify.reset;

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [foundAccounts, setFoundAccounts] = useState<MockAccount[] | null>(null);
  const [resetAccount, setResetAccount] = useState<MockAccount | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const resetForm = useCallback(() => {
    setStep(1);
    setName("");
    setUserId("");
    setFoundAccounts(null);
    setResetAccount(null);
    setPassword("");
    setConfirm("");
    setErrors({});
    setResetDone(false);
    phoneVerify.reset();
  }, [resetPhone]);

  useEffect(() => {
    setStep(1);
    setName("");
    setUserId("");
    setFoundAccounts(null);
    setResetAccount(null);
    setPassword("");
    setConfirm("");
    setErrors({});
    setResetDone(false);
    resetPhone();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tab change only
  }, [tab]);

  const setTab = (next: Tab) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (next === "id") params.delete("tab");
        else params.set("tab", "password");
        return params;
      },
      { replace: true },
    );
  };

  const step2Label = tab === "id" ? "결과 확인" : "비밀번호 재설정";
  const verified = phoneVerify.step === "verified";
  const canProceedStep1 =
    verified &&
    name.trim().length > 0 &&
    (tab === "id" || userId.trim().length > 0);

  const handleNext = async () => {
    if (!canProceedStep1) return;
    setLoading(true);

    // TODO: POST /api/account/find-id or verify-reset
    await new Promise((r) => setTimeout(r, 500));

    if (tab === "id") {
      const accounts = findAccountsByNameAndPhone(name, phoneVerify.phoneDigits);
      setFoundAccounts(accounts);
    } else {
      const account = findAccountByCredentials(userId, name, phoneVerify.phoneDigits);
      setResetAccount(account);
    }

    setLoading(false);
    setStep(2);
  };

  const passwordValid =
    isPasswordFullyValid(password) && isPasswordAllowedChars(password);
  const confirmMatch = password === confirm && confirm.length > 0;
  const canReset = passwordValid && confirmMatch && !loading;

  const handleReset = async () => {
    if (!canReset) return;
    setLoading(true);
    // TODO: POST /api/account/reset-password
    // TODO: 서버 응답이 409면 '이전 비밀번호와 같아요' 표시
    await new Promise((r) => setTimeout(r, 600));
    console.log("reset password", { userId: resetAccount?.userId });
    setLoading(false);
    setResetDone(true);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setFoundAccounts(null);
    setResetAccount(null);
    setPassword("");
    setConfirm("");
    setResetDone(false);
    phoneVerify.reset();
  };

  const handleSwitchToPassword = () => {
    resetForm();
    setTab("password");
  };

  return (
    <div className="auth-page">
      <AuthBrand title="계정 찾기" subtitle="가입할 때 등록한 전화번호로 확인해요" />

      <div className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="계정 찾기 메뉴" ref={listRef}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "id"}
            ref={setTabRef("id")}
            className={`auth-tab${tab === "id" ? " is-active" : ""}`}
            onClick={() => setTab("id")}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "password"}
            ref={setTabRef("password")}
            className={`auth-tab${tab === "password" ? " is-active" : ""}`}
            onClick={() => setTab("password")}
          >
            비밀번호 찾기
          </button>
          <span
            className="auth-tab-indicator"
            aria-hidden="true"
            style={{
              width: ind.width,
              transform: `translateX(${ind.left}px)`,
            }}
          />
        </div>

        <StepIndicator step={step} step2Label={step2Label} />

        {step === 1 && (
          <div className="auth-form">
            {tab === "password" && (
              <TextField
                id="find-userId"
                label="아이디"
                type="text"
                autoComplete="username"
                inputMode="text"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                icon={<i className="ti ti-user" />}
              />
            )}

            <TextField
              id="find-name"
              label="이름"
              type="text"
              autoComplete="name"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<i className="ti ti-user" />}
            />

            <PhoneVerification
              idPrefix="find"
              phoneIcon={<i className="ti ti-phone" />}
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

            <button
              type="button"
              className="auth-submit"
              disabled={!canProceedStep1 || loading}
              onClick={handleNext}
            >
              {loading ? <span className="auth-spinner" aria-label="확인 중" /> : "다음"}
            </button>
            {!verified && (
              <p className="auth-submit-hint" role="status">
                전화번호 인증이 필요해요
              </p>
            )}
          </div>
        )}

        {step === 2 && tab === "id" && (
          <div className="auth-form">
            <button type="button" className="auth-back-link" onClick={handleBackToStep1}>
              ← 다시 입력하기
            </button>

            {foundAccounts && foundAccounts.length > 0 ? (
              <>
                <div className="auth-result-head auth-result-head-success">
                  <span className="auth-result-icon auth-result-icon-success" aria-hidden="true">
                    <i className="ti ti-check" />
                  </span>
                  <p className="auth-result-title">가입된 아이디를 찾았어요</p>
                  <p className="auth-result-desc">보안을 위해 일부만 표시됩니다</p>
                </div>

                <div className="auth-found-list">
                  {foundAccounts.map((account) => (
                    <FoundAccountCard key={account.userId} account={account} />
                  ))}
                </div>

                <Link to="/login" className="auth-submit auth-submit-link">
                  로그인하러 가기
                </Link>
                <button
                  type="button"
                  className="auth-outline-btn"
                  onClick={handleSwitchToPassword}
                >
                  비밀번호도 잊으셨나요?
                </button>
              </>
            ) : (
              <>
                <div className="auth-result-head auth-result-head-error">
                  <span className="auth-result-icon auth-result-icon-error" aria-hidden="true">
                    <i className="ti ti-alert-circle" />
                  </span>
                  <p className="auth-result-title">일치하는 계정이 없어요</p>
                  <p className="auth-result-desc">입력하신 정보로 가입된 계정을 찾지 못했습니다</p>
                </div>
                <button type="button" className="auth-outline-btn" onClick={handleBackToStep1}>
                  다시 입력하기
                </button>
                <Link to="/signup" className="auth-submit auth-submit-link">
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}

        {step === 2 && tab === "password" && (
          <div className="auth-form">
            {!resetDone && (
              <button type="button" className="auth-back-link" onClick={handleBackToStep1}>
                ← 다시 입력하기
              </button>
            )}

            {resetDone ? (
              <>
                <div className="auth-result-head auth-result-head-success">
                  <span className="auth-result-icon auth-result-icon-success" aria-hidden="true">
                    <i className="ti ti-check" />
                  </span>
                  <p className="auth-result-title">비밀번호가 변경되었어요</p>
                  <p className="auth-result-desc">새 비밀번호로 로그인해주세요</p>
                </div>
                <Link to="/login" className="auth-submit auth-submit-link">
                  로그인하러 가기
                </Link>
              </>
            ) : resetAccount ? (
              <>
                <div className="auth-reset-target">
                  <span className="auth-reset-ava" aria-hidden="true">
                    {resetAccount.userId[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="auth-reset-userId">{maskUserId(resetAccount.userId)}</p>
                    <p className="auth-reset-desc">이 계정의 비밀번호를 변경합니다</p>
                  </div>
                </div>

                <div className="auth-field-group">
                  <PasswordField
                    id="reset-password"
                    label="새 비밀번호"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                    }}
                    error={errors.password}
                  />
                  <PasswordStrengthBar password={password} />
                </div>

                <PasswordField
                  id="reset-confirm"
                  label="비밀번호 확인"
                  autoComplete="new-password"
                  placeholder="비밀번호 확인"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                  }}
                  error={errors.confirm}
                  icon={<i className="ti ti-lock-check" />}
                />

                <PasswordRules password={password} />

                <button
                  type="button"
                  className="auth-submit"
                  disabled={!canReset}
                  onClick={() => {
                    const e: Record<string, string> = {};
                    if (!isPasswordAllowedChars(password)) {
                      e.password = "사용할 수 없는 문자가 포함되어 있어요";
                    }
                    if (!isPasswordFullyValid(password)) {
                      e.password = e.password ?? "비밀번호 조건을 확인해주세요";
                    }
                    if (password !== confirm) {
                      e.confirm = "비밀번호가 일치하지 않아요";
                    }
                    setErrors(e);
                    if (Object.keys(e).length > 0) return;
                    handleReset();
                  }}
                >
                  {loading ? (
                    <span className="auth-spinner" aria-label="변경 중" />
                  ) : (
                    "비밀번호 변경하기"
                  )}
                </button>

                <Link to="/login" className="auth-footer-link auth-footer-link-block">
                  로그인 화면으로 돌아가기
                </Link>
              </>
            ) : (
              <>
                <div className="auth-result-head auth-result-head-error">
                  <span className="auth-result-icon auth-result-icon-error" aria-hidden="true">
                    <i className="ti ti-alert-circle" />
                  </span>
                  <p className="auth-result-title">일치하는 계정이 없어요</p>
                  <p className="auth-result-desc">입력하신 정보로 가입된 계정을 찾지 못했습니다</p>
                </div>
                <button type="button" className="auth-outline-btn" onClick={handleBackToStep1}>
                  다시 입력하기
                </button>
                <Link to="/signup" className="auth-submit auth-submit-link">
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {step === 1 && <SnsHintBanner />}

      <p className="auth-footer-link">
        <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}
