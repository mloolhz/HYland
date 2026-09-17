/**
 * 받침 유무에 따라 조사를 고른다.
 *
 * "요트을(를)"처럼 괄호 표기를 쓰면 읽기 불편하고, 추천 이유는 사용자가 그대로 읽는
 * 문장이라 자연스러워야 한다. 한글 음절은 (코드 - 0xAC00) % 28 이 0이 아니면 받침이 있다.
 */

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/** 숫자로 끝나는 말은 읽는 소리 기준으로 받침을 판단한다 (1 일, 3 삼, 6 육 ...) */
const DIGIT_HAS_FINAL: Record<string, boolean> = {
  "0": true, // 영
  "1": true, // 일
  "2": false, // 이
  "3": true, // 삼
  "4": false, // 사
  "5": true, // 오 → 받침 없음
  "6": true, // 육
  "7": true, // 칠
  "8": true, // 팔
  "9": false, // 구
};

// '오'는 받침이 없다.
DIGIT_HAS_FINAL["5"] = false;

export function hasFinalConsonant(word: string): boolean {
  const trimmed = word.trim();
  if (trimmed.length === 0) return false;

  const last = trimmed[trimmed.length - 1];

  if (last >= "0" && last <= "9") return DIGIT_HAS_FINAL[last] ?? false;

  const code = last.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return false;

  return (code - HANGUL_START) % 28 !== 0;
}

/** 앞말에 맞는 조사를 붙여 반환 — withParticle("요트", "을", "를") → "요트를" */
export function withParticle(word: string, withFinal: string, withoutFinal: string): string {
  return `${word}${hasFinalConsonant(word) ? withFinal : withoutFinal}`;
}

export const objectParticle = (word: string) => withParticle(word, "을", "를");
export const subjectParticle = (word: string) => withParticle(word, "이", "가");
export const topicParticle = (word: string) => withParticle(word, "은", "는");
