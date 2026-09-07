/**
 * 미션 인증 검수 API (tour_BE `/submissions`)
 *
 * 유저가 커뮤니티에 인증샷을 올리며 미션을 지정해 제출하면, 관리자가 사진을
 * 보고 승인/반려한다. 승인 시 미션 진행도가 오르고 목표를 채우면 배지가 나온다.
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

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Submission = {
  id: string;
  status: SubmissionStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  quest: {
    id: number;
    title: string;
    icon: string;
    target: number;
    unit: string;
    reward: string;
  };
  user: { id: string; nickname: string };
  post: {
    id: string;
    title: string;
    content: string;
    island: string;
    activity: string;
    createdAt: string;
    images: string[];
  };
};

/** 인증 제출 — 사진이 있는 내 글만 가능 */
export function submitMissionProof(postId: string, questId: number): Promise<Submission> {
  return request("/submissions", {
    method: "POST",
    body: JSON.stringify({ postId, questId }),
  });
}

export async function fetchMySubmissions(): Promise<Submission[]> {
  const r = await request<{ submissions: Submission[] }>("/submissions/my");
  return r.submissions;
}

/** 검수 대기 목록 (관리자) — status="ALL" 이면 전체 */
export async function fetchPendingSubmissions(status = "PENDING"): Promise<Submission[]> {
  const r = await request<{ submissions: Submission[] }>(
    `/submissions/pending?status=${encodeURIComponent(status)}`,
  );
  return r.submissions;
}

export type ApproveResult = {
  id: string;
  status: "APPROVED";
  current: number;
  target: number;
  completed: boolean;
  /** 이번 승인으로 새로 지급된 배지 이름 (없으면 null) */
  badgeGranted: string | null;
};

export function approveSubmission(id: string): Promise<ApproveResult> {
  return request(`/submissions/${id}/approve`, { method: "POST" });
}

export function rejectSubmission(id: string, reason?: string): Promise<{ id: string }> {
  return request(`/submissions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
