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
import { ApiError, findAccountIds, resetPassword, type FoundAccount } from "@/api/auth";
import { maskUserId } from "@/lib/account-format";

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
  const [userId, setUserId] = useState("");
  const [foundAccounts, setFoundAccounts] = useState<FoundAccount[] | null>(null);
  /** 비밀번호를 바꿀 대상 아이디 — 입력한 아이디를 그대로 쓴다 */
  const [resetAccount, setResetAccount] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const resetForm = useCallback(() => {
    setStep(1);
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
  // 회원가입에서 이름을 받지 않으므로 본인 확인은 휴대폰 인증으로만 한다
  const canProceedStep1 = verified && (tab === "id" || userId.trim().length > 0);

  const handleNext = async () => {
    if (!canProceedStep1) return;
    setLoading(true);

    try {
      const accounts = await findAccountIds(phoneVerify.phoneDigits);
      if (tab === "id") {
        setFoundAccounts(accounts);
      } else {
        // 입력한 아이디가 이 번호로 가입된 것인지 먼저 확인한다.
        // (실제 변경은 서버가 한 번 더 대조한다)
        const hit = accounts.find((a) => a.username === userId.trim());
        setResetAccount(hit ? hit.username : null);
      }
    } catch (err) {
      console.error("[find-account] 조회 실패:", err);
      setFoundAccounts([]);
      setResetAccount(null);
    }

    setLoading(false);
    setStep(2);
  };

  const passwordValid =
    isPasswordFullyValid(password) && isPasswordAllowedChars(password);
  const confirmMatch = password === confirm && confirm.length > 0;
  const canReset = passwordValid && confirmMatch && !loading;

  const handleReset = async () => {
    if (!canReset || !resetAccount) return;
    setLoading(true);
    try {
      await resetPassword({
        phone: phoneVerify.phoneDigits,
        username: resetAccount,
        password,
      });
      setResetDone(true);
    } catch (err) {
      setErrors({
        password:
          err instanceof ApiError ? err.message : "비밀번호를 변경하지 못했어요",
      });
    } finally {
      setLoading(false);
    }
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
              devCode={phoneVerify.devCode}
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
                    <FoundAccountCard key={account.username} account={account} />
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
                    {resetAccount[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="auth-reset-userId">{maskUserId(resetAccount)}</p>
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
