import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { formatTimer } from "@/lib/phone";
import type { PhoneStep } from "@/hooks/usePhoneVerification";
import { TextField } from "./TextField";

type PhoneVerificationProps = {
  idPrefix?: string;
  phoneIcon?: ReactNode;
  phone: string;
  setPhone: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  step: PhoneStep;
  seconds: number;
  resendSeconds: number;
  errors: { phone?: string; code?: string };
  sendCode: () => void;
  verifyCode: () => void;
  isPhoneValid: boolean;
};

export function PhoneVerification({
  idPrefix = "signup",
  phoneIcon,
  phone,
  setPhone,
  code,
  setCode,
  step,
  seconds,
  resendSeconds,
  errors,
  sendCode,
  verifyCode,
  isPhoneValid,
}: PhoneVerificationProps) {
  const [liveMessage, setLiveMessage] = useState("");
  const announcedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (step !== "sent") {
      announcedRef.current.clear();
      return;
    }
    if ((seconds === 30 || seconds === 10) && !announcedRef.current.has(seconds)) {
      announcedRef.current.add(seconds);
      setLiveMessage(`인증 시간 ${seconds}초 남았습니다`);
    }
  }, [seconds, step]);

  const expired = step === "sent" && seconds === 0;
  const canSend = step !== "verified" && isPhoneValid && resendSeconds === 0;

  const sendLabel =
    step === "verified"
      ? "인증 완료"
      : resendSeconds > 0
        ? `재전송 (${resendSeconds}초)`
        : step === "sent"
          ? "재전송"
          : "인증번호 받기";

  return (
    <div className="auth-phone-verify">
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
      {step === "verified" && (
        <p className="sr-only" role="status">
          전화번호 인증이 완료되었어요
        </p>
      )}

      <div className="auth-field auth-phone-field">
        <label htmlFor={`${idPrefix}-phone`} className="sr-only">
          전화번호
        </label>
        <div className="auth-dup-row">
          <div
            className={`auth-input-wrap${errors.phone ? " has-error" : ""}${step === "verified" ? " is-disabled" : ""}`}
          >
            {phoneIcon && <span className="auth-input-icon" aria-hidden="true">{phoneIcon}</span>}
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={13}
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={step === "verified"}
              className="auth-input"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? `${idPrefix}-phone-error` : undefined}
            />
          </div>
          {step === "verified" ? (
            <span className="auth-dup-done">
              <i className="ti ti-check" aria-hidden="true" />
              인증 완료
            </span>
          ) : (
            <button
              type="button"
              className="auth-dup-btn"
              onClick={sendCode}
              disabled={!canSend}
            >
              {sendLabel}
            </button>
          )}
        </div>
        {errors.phone && (
          <p id={`${idPrefix}-phone-error`} className="auth-error" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      {(step === "sent" || step === "verified") && (
        <div className="auth-code-row">
          <TextField
            id={`${idPrefix}-code`}
            label="인증번호"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="인증번호 6자리"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            error={errors.code}
            disabled={step === "verified"}
            rightSlot={
              step === "sent" && !expired ? (
                <span
                  className={`auth-timer${seconds <= 30 && seconds > 0 ? " auth-timer-urgent" : ""}`}
                  aria-hidden="true"
                >
                  {formatTimer(seconds)}
                </span>
              ) : step === "verified" ? (
                <span className="auth-phone-verified-icon" aria-hidden="true">
                  <i className="ti ti-check" />
                </span>
              ) : null
            }
          />
          {step === "sent" && !expired && (
            <button type="button" className="auth-code-verify-btn" onClick={verifyCode}>
              확인
            </button>
          )}
          {expired && (
            <p className="auth-code-expired" role="alert">
              인증 시간이 만료되었어요
            </p>
          )}
        </div>
      )}
    </div>
  );
}
