const STORAGE_KEY = "hyland:community-list-search";

/** 커뮤니티 목록 URL search (`?sort=popular` 형태 또는 빈 문자열) */
export function getCommunityListSearch(): string {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? `?${raw}` : "";
  } catch {
    return "";
  }
}

export function saveCommunityListSearch(search: string) {
  try {
    const normalized = search.startsWith("?") ? search.slice(1) : search;
    if (normalized) sessionStorage.setItem(STORAGE_KEY, normalized);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function resolveCommunityHref(pathname: string, search: string, fromSearch?: string): string {
  if (fromSearch) {
    const query = fromSearch.startsWith("?") ? fromSearch : `?${fromSearch}`;
    return `/community${query}`;
  }
  if (pathname === "/community") {
    return `/community${search}`;
  }
  return `/community${getCommunityListSearch()}`;
}
