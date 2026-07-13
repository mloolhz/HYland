import { useEffect, useRef, useState } from "react";

type DuplicateCheckFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  autoComplete?: string;
  validateFormat: (value: string) => string | null;
  checkDuplicate: (value: string) => Promise<boolean>;
  onCheckedChange?: (checked: boolean) => void;
  inputMode?: "text" | "email";
  type?: string;
};

export function DuplicateCheckField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  icon,
  placeholder,
  autoComplete,
  validateFormat,
  checkDuplicate,
  onCheckedChange,
  inputMode,
  type = "text",
}: DuplicateCheckFieldProps) {
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>();
  const onCheckedChangeRef = useRef(onCheckedChange);
  onCheckedChangeRef.current = onCheckedChange;

  useEffect(() => {
    setChecked(false);
    onCheckedChangeRef.current?.(false);
  }, [value]);

  const displayError = error ?? localError;
  const formatError = validateFormat(value);
  const canCheck = !formatError && value.trim().length > 0 && !checked;
  const errorId = displayError ? `${id}-error` : undefined;
  const guideId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, guideId].filter(Boolean).join(" ") || undefined;

  const handleBlur = () => {
    const fmtErr = validateFormat(value);
    if (fmtErr) setLocalError(fmtErr);
    onBlur?.();
  };

  const handleCheck = async () => {
    const fmtErr = validateFormat(value);
    if (fmtErr) {
      setLocalError(fmtErr);
      return;
    }
    setChecking(true);
    setLocalError(undefined);
    const taken = await checkDuplicate(value);
    setChecking(false);
    if (taken) {
      setLocalError(`이미 사용 중인 ${label}입니다`);
      setChecked(false);
      onCheckedChange?.(false);
      return;
    }
    setChecked(true);
    onCheckedChange?.(true);
  };

  return (
    <div className="auth-field auth-dup-field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="auth-dup-row">
        <div className={`auth-input-wrap${displayError ? " has-error" : ""}`}>
          {icon && <span className="auth-input-icon" aria-hidden="true">{icon}</span>}
          <input
            id={id}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            className="auth-input"
            aria-invalid={displayError ? true : undefined}
            aria-describedby={describedBy}
          />
        </div>
        {checked ? (
          <span className="auth-dup-done">
            <i className="ti ti-check" aria-hidden="true" />
            확인 완료
          </span>
        ) : (
          <button
            type="button"
            className="auth-dup-btn"
            onClick={handleCheck}
            disabled={!canCheck || checking}
          >
            {checking ? "…" : "중복 확인"}
          </button>
        )}
      </div>
      {hint && !displayError && (
        <p id={guideId} className="auth-hint">
          {hint}
        </p>
      )}
      {displayError && (
        <p id={errorId} className="auth-error" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

export function useDuplicateChecked() {
  const [checked, setChecked] = useState(false);
  return { checked, setChecked };
}
