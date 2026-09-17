import {
  getPasswordStrengthLevel,
  isPasswordFullyValid,
  STRENGTH_MESSAGES,
} from "@/constants/validation";

export type PasswordStrength = 0 | 1 | 2 | 3;

export function getPasswordStrength(password: string): PasswordStrength {
  return getPasswordStrengthLevel(password);
}

export function isPasswordValid(password: string): boolean {
  return isPasswordFullyValid(password);
}

export { STRENGTH_MESSAGES };
