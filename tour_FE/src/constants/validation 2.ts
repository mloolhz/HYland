export const PASSWORD_RULES = {
  minLength: 8,
  special: /[!@#$%^&*]/,
  allowed: /^[\w!@#$%^&*]+$/,
  specialChars: "! @ # $ % ^ & *",
} as const;

export type PasswordRuleStatus = {
  length: boolean;
  alphanumeric: boolean;
  special: boolean;
};

export function getPasswordRuleStatus(password: string): PasswordRuleStatus {
  return {
    length: password.length >= PASSWORD_RULES.minLength,
    alphanumeric: /[a-zA-Z]/.test(password) && /\d/.test(password),
    special: PASSWORD_RULES.special.test(password),
  };
}

export function isPasswordAllowedChars(password: string): boolean {
  if (!password) return true;
  return PASSWORD_RULES.allowed.test(password);
}

export function isPasswordFullyValid(password: string): boolean {
  const rules = getPasswordRuleStatus(password);
  return rules.length && rules.alphanumeric && rules.special && isPasswordAllowedChars(password);
}

export function getPasswordStrengthLevel(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  const rules = getPasswordRuleStatus(password);
  if (!rules.length) return 0;
  if (!rules.alphanumeric || !rules.special || !isPasswordAllowedChars(password)) return 1;
  if (password.length >= 12) return 3;
  return 2;
}

export const STRENGTH_MESSAGES: Record<1 | 2 | 3, string> = {
  1: "조금 더 복잡하게 만들어주세요",
  2: "괜찮은 비밀번호예요",
  3: "안전한 비밀번호예요",
};
