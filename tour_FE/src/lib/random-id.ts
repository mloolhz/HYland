/** HTTP 배포(비 secure context)에서는 crypto.randomUUID 가 없을 수 있다. */
export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
