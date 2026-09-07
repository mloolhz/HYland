/** 계정 화면에서 쓰는 표시 포맷 (예전 mocks/accounts 에 있던 것) */

/** 아이디 일부 가리기 — 서버가 이미 가려서 주지만, 화면에서 쓸 일이 남아 있다 */
export function maskUserId(id: string): string {
  const visible = Math.min(5, Math.max(3, Math.floor(id.length / 2)));
  return id.slice(0, visible) + "*".repeat(Math.max(4, id.length - visible));
}

/** "2026-09-05" → "2026. 9. 5. 가입" */
export function formatJoinDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return "";
  return `${y}. ${Number(m)}. ${Number(d)}. 가입`;
}

/** "2026-09-05" → "2026.09.05" */
export function formatJoinDateYmd(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return "-";
  return `${y}.${m}.${d}`;
}
