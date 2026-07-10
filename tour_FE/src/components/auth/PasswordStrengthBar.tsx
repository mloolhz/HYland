import { getPasswordStrength } from "@/lib/passwordStrength";

const LABELS = ["", "약함", "보통", "강함"] as const;

export function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="auth-strength">
      <div className="auth-strength-bars" aria-hidden="true">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`auth-strength-bar auth-strength-${level}${
              strength >= level ? " is-active" : ""
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <span className={`auth-strength-label auth-strength-text-${strength}`}>
          {LABELS[strength]}
        </span>
      )}
    </div>
  );
}
