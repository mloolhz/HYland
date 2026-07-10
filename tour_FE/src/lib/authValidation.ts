export const USER_ID_PATTERN = /^[a-z][a-z0-9]{3,15}$/;

export function validateUserId(userId: string): string | null {
  if (!USER_ID_PATTERN.test(userId)) {
    return "영문 소문자로 시작하는 4~16자 영문/숫자";
  }
  return null;
}

export function validateNickname(nickname: string): string | null {
  if (nickname.length < 2 || nickname.length > 10) {
    return "닉네임은 2~10자여야 합니다";
  }
  return null;
}

export function validateEmailOptional(email: string): string | null {
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "올바른 이메일을 입력해주세요";
  }
  return null;
}
