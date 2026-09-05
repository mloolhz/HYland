/**
 * 로그인 사용자 관련 API — 프로필 · 섬 방문 · 미션 진행 · 리더보드
 * (tour_BE `/profile`, `/visits`, `/missions`, `/leaderboard`)
 *
 * 전부 토큰이 필요하다. 토큰은 store/session 이 localStorage 에 들고 있다.
 */
import { API_BASE } from "@/lib/api-base";
import { ApiError } from "@/api/auth";
import { readToken } from "@/lib/token";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "요청을 처리하지 못했어요.");
  return body as T;
}

// ── 프로필 ──

export type ProfileResponse = {
  userId: string;
  nickname: string;
  level: number;
  levelTitle: string;
  expCurrent: number;
  expMax: number;
  bti: string | null;
  characterId: string | null;
  passportAvatar: string | null;
  stats: {
    visitedCount: number;
    completedMissions: number;
    badgeCount: number;
    btiCount: number;
  };
};

export function fetchProfile(): Promise<ProfileResponse> {
  return request("/profile");
}

export function updateProfile(input: {
  nickname?: string;
  characterId?: string;
  passportAvatar?: string;
}): Promise<{ userId: string; nickname: string }> {
  return request("/profile", { method: "PATCH", body: JSON.stringify(input) });
}

// ── 섬 방문 ──

export type VisitsResponse = {
  total: number;
  islands: { islandId: string; name: string; visitedAt: string }[];
};

export function fetchVisits(): Promise<VisitsResponse> {
  return request("/visits");
}

/** 섬 방문 기록 — 처음이면 isNew=true (새 스탬프) */
export function recordVisit(islandId: string): Promise<{
  islandId: string;
  islandName: string;
  isNew: boolean;
  totalVisited: number;
}> {
  return request("/visits", { method: "POST", body: JSON.stringify({ islandId }) });
}

// ── 미션 ──

export type MissionProgressResponse = {
  total: number;
  items: {
    questId: number;
    title: string;
    current: number;
    target: number;
    completed: boolean;
    /** 완료 시각 — 여권 배지의 획득 날짜 */
    completedAt: string | null;
  }[];
};

export function fetchMyMissionProgress(): Promise<MissionProgressResponse> {
  return request("/missions/my/progress");
}

/** 미션 진행도 갱신 — current(절대값) 또는 increment(증가분) 중 하나 */
export function updateMissionProgress(
  questId: number,
  input: { current?: number; increment?: number },
): Promise<{ questId: number; current: number; target: number; completed: boolean }> {
  return request(`/missions/${questId}/progress`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ── 리더보드 (로그인 없이도 조회 가능) ──

export type LeaderboardRow = {
  rank: number;
  userId: string;
  nickname: string;
  level: number;
  /** 순위 기준 — 획득한 배지 수 */
  badgeCount: number;
  visitedCount: number;
  completedMissions: number;
};

export type CategoryRankRow = {
  rank: number;
  userId: string;
  nickname: string;
  badgeCount: number;
};

export type LeaderboardResponse = {
  total: number;
  ranking: LeaderboardRow[];
};

export async function fetchLeaderboard(limit?: number): Promise<LeaderboardResponse> {
  const qs = limit ? `?limit=${limit}` : "";
  const res = await fetch(`${API_BASE}/leaderboard${qs}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "리더보드를 불러오지 못했어요.");
  return body as LeaderboardResponse;
}

/** 미션 카테고리별 순위 (카테고리 id → 순위 목록) */
export async function fetchCategoryLeaderboard(): Promise<Record<string, CategoryRankRow[]>> {
  const res = await fetch(`${API_BASE}/leaderboard/categories`);
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "카테고리 순위를 불러오지 못했어요.");
  return (body as { categories: Record<string, CategoryRankRow[]> }).categories;
}
