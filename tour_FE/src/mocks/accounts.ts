export type MockAccount = {
  userId: string;
  name: string;
  phone: string;
  joinedAt: string;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  { userId: "seongyun00", name: "김성윤", phone: "01012345678", joinedAt: "2024-03-12" },
  { userId: "islandquest", name: "김성윤", phone: "01012345678", joinedAt: "2025-01-08" },
];

export function maskUserId(id: string): string {
  const visible = Math.min(5, Math.max(3, Math.floor(id.length / 2)));
  return id.slice(0, visible) + "*".repeat(Math.max(4, id.length - visible));
}

export function formatJoinDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}. ${Number(m)}. ${Number(d)}. 가입`;
}

export function formatJoinDateYmd(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function findAccountsByNameAndPhone(name: string, phone: string): MockAccount[] {
  const digits = phone.replace(/\D/g, "");
  return MOCK_ACCOUNTS.filter((a) => a.name === name.trim() && a.phone === digits);
}

export function findAccountByCredentials(
  userId: string,
  name: string,
  phone: string,
): MockAccount | null {
  const digits = phone.replace(/\D/g, "");
  return (
    MOCK_ACCOUNTS.find(
      (a) => a.userId === userId.trim() && a.name === name.trim() && a.phone === digits,
    ) ?? null
  );
}
