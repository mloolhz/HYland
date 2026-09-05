import { useCallback, useEffect, useRef, useState } from "react";
import { formatPhone, isValidPhone, phoneDigits } from "@/lib/phone";
import { ApiError, requestPhoneCode, verifyPhoneCode } from "@/api/auth";

export type PhoneStep = "idle" | "sent" | "verified";

const RESEND_COOLDOWN = 30;

export function usePhoneVerification() {
  const [phone, setPhoneRaw] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<PhoneStep>("idle");
  const [seconds, setSeconds] = useState(180);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [errors, setErrors] = useState<{ phone?: string; code?: string }>({});
  const [verifiedPhone, setVerifiedPhone] = useState("");
  /** 문자 발송 연동 전이라 서버가 코드를 그대로 준다 — 화면에 안내로 띄운다 */
  const [devCode, setDevCode] = useState("");
  const prevPhoneRef = useRef("");

  const setPhone = useCallback(
    (value: string) => {
      const formatted = formatPhone(value);
      setPhoneRaw(formatted);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });

      if (step === "verified" && phoneDigits(formatted) !== phoneDigits(verifiedPhone)) {
        setStep("idle");
        setCode("");
        setSeconds(180);
        setResendSeconds(0);
        setVerifiedPhone("");
        setDevCode("");
      }
    },
    [step, verifiedPhone],
  );

  const reset = useCallback(() => {
    setPhoneRaw("");
    setCode("");
    setStep("idle");
    setSeconds(180);
    setResendSeconds(0);
    setErrors({});
    setVerifiedPhone("");
    setDevCode("");
  }, []);

  useEffect(() => {
    if (step !== "sent") return;
    const t = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const sendCode = useCallback(async () => {
    if (!isValidPhone(phone)) {
      setErrors((prev) => ({ ...prev, phone: "올바른 전화번호를 입력해주세요" }));
      return;
    }
    if (resendSeconds > 0) return;

    try {
      const res = await requestPhoneCode(phoneDigits(phone));
      setDevCode(res.devCode ?? "");
      setStep("sent");
      setSeconds(180);
      setResendSeconds(RESEND_COOLDOWN);
      setCode("");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        phone: err instanceof ApiError ? err.message : "인증번호를 보내지 못했어요",
      }));
    }
  }, [phone, resendSeconds]);

  const verifyCode = useCallback(async () => {
    if (code.length !== 6) {
      setErrors((prev) => ({ ...prev, code: "인증번호 6자리를 입력해주세요" }));
      return;
    }
    if (seconds === 0) {
      setErrors((prev) => ({ ...prev, code: "인증 시간이 만료되었어요" }));
      return;
    }

    try {
      await verifyPhoneCode(phoneDigits(phone), code);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        code: err instanceof ApiError ? err.message : "인증번호를 확인하지 못했어요",
      }));
      return;
    }

    setStep("verified");
    setVerifiedPhone(phone);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.code;
      return next;
    });
  }, [code, phone, seconds]);

  useEffect(() => {
    prevPhoneRef.current = phone;
  }, [phone]);

  return {
    phone,
    setPhone,
    code,
    setCode,
    step,
    seconds,
    resendSeconds,
    errors,
    setErrors,
    sendCode,
    verifyCode,
    reset,
    devCode,
    phoneDigits: phoneDigits(phone),
    isPhoneValid: isValidPhone(phone),
  };
}
