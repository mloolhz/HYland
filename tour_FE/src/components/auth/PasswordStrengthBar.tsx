import { getPasswordStrength, STRENGTH_MESSAGES } from "@/lib/passwordStrength";

export function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password || strength === 0) return null;

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
          {STRENGTH_MESSAGES[strength]}
        </span>
      )}
    </div>
  );
}
