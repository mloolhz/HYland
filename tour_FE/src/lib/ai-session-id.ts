const SESSION_KEY = "ai-recommend-session-id";

/** 브라우저 탭(세션) 단위로 고정되는 대화 식별자. 새로고침해도 유지되고, 탭을
 * 닫으면 사라진다(sessionStorage) — "이 대화 세션"이라는 개념과 맞아떨어진다. */
export function getAiSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
