import {
  getPasswordRuleStatus,
  isPasswordAllowedChars,
} from "@/constants/validation";

export function PasswordRules({ password }: { password: string }) {
  const rules = getPasswordRuleStatus(password);
  const allowed = isPasswordAllowedChars(password);

  const items = [
    { key: "length", label: "8자 이상", met: rules.length },
    { key: "alphanumeric", label: "영문과 숫자 포함", met: rules.alphanumeric },
    { key: "special", label: "특수문자 포함", met: rules.special },
  ] as const;

  return (
    <div className="auth-pw-rules">
      <ul className="auth-pw-rules-list">
        {items.map((item) => (
          <li
            key={item.key}
            aria-label={`${item.label}, ${item.met ? "충족" : "미충족"}`}
          >
            <i
              className={`ti ${item.met ? "ti-circle-check" : "ti-circle"}`}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>
      {password && !allowed && (
        <p className="auth-error" role="alert">
          사용할 수 없는 문자가 포함되어 있어요
        </p>
      )}
    </div>
  );
}
