import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

type TextFieldProps = {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  hintId?: string;
  rightSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, icon, error, hint, hintId, rightSlot, className, disabled, ...inputProps },
  ref,
) {
  const errorId = error ? `${id}-error` : undefined;
  const guideId = hint ? hintId ?? `${id}-hint` : undefined;
  const describedBy = [errorId, guideId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="auth-field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={`auth-input-wrap${error ? " has-error" : ""}${rightSlot ? " has-right" : ""}${disabled ? " is-disabled" : ""}`}
      >
        {icon && <span className="auth-input-icon" aria-hidden="true">{icon}</span>}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          className={`auth-input${className ? ` ${className}` : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {rightSlot && <div className="auth-input-right">{rightSlot}</div>}
      </div>
      {hint && !error && (
        <p id={guideId} className="auth-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
