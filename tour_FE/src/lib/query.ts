export function parseIslandsQuery(value: string | null): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((s) => decodeURIComponent(s.trim()))
      .filter(Boolean),
  );
}

export function serializeIslandsQuery(islands: Set<string>): string | undefined {
  if (islands.size === 0) return undefined;
  return [...islands].map(encodeURIComponent).join(",");
}

export function parsePageQuery(value: string | null): number {
  const n = parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
