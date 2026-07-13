import type { ReactNode } from "react";
import { useState } from "react";
import { TextField } from "./TextField";

type PasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  autoComplete?: "current-password" | "new-password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: ReactNode | null;
};

export function PasswordField({
  id,
  label,
  error,
  autoComplete = "current-password",
  value,
  onChange,
  onBlur,
  placeholder = "비밀번호",
  icon = <i className="ti ti-lock" />,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      icon={icon}
      rightSlot={
        <button
          type="button"
          className="auth-pw-toggle"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          onClick={() => setVisible((v) => !v)}
        >
          <i className={`ti ${visible ? "ti-eye-off" : "ti-eye"}`} aria-hidden="true" />
        </button>
      }
    />
  );
}
