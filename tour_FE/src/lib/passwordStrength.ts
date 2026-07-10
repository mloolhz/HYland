export type PasswordStrength = 0 | 1 | 2 | 3;

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 0;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  if (hasLetter && hasNumber && hasSpecial && password.length >= 12) return 3;
  if (hasLetter && hasNumber) return 2;
  return 1;
}

export function isPasswordValid(password: string): boolean {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}
