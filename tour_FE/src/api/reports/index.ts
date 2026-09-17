/**
 * 커뮤니티 신고 API (tour_BE `/reports`)
 *
 * 접수는 로그인한 사람 누구나, 목록·처리는 ADMIN 만 가능하다.
 * 권한은 서버가 확인하므로 화면은 403 을 그대로 보여주면 된다.
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

/** 신고 사유 — 서버(reports.ts REPORT_REASONS)와 같은 코드를 쓴다 */
export const REPORT_REASONS = [
  { code: "spam", label: "스팸·도배" },
  { code: "abuse", label: "욕설·혐오 표현" },
  { code: "ad", label: "광고·홍보" },
  { code: "false", label: "허위 정보" },
  { code: "privacy", label: "개인정보 노출" },
  { code: "etc", label: "기타" },
] as const;

export type ReportTarget = "POST" | "COMMENT";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export type Report = {
  id: string;
  target: ReportTarget;
  reason: string;
  reasonLabel: string;
  detail: string | null;
  status: ReportStatus;
  createdAt: string;
  handledAt: string | null;
  handleNote: string | null;
  reporter: { id: string; nickname: string };
  handler: { id: string; nickname: string } | null;
  /** 신고당한 글·댓글. 이미 지워졌으면 null */
  content: {
    id: string;
    /** 댓글이면 원글 id — 이동 링크에 쓴다 */
    postId: string;
    title: string | null;
    body: string;
    island: string | null;
    createdAt: string;
    author: { id: string; nickname: string };
  } | null;
};

export type ReportListResponse = {
  reports: Report[];
  counts: Partial<Record<ReportStatus, number>>;
};

/** 신고 접수 */
export function createReport(input: {
  target: ReportTarget;
  targetId: string;
  reason: string;
  detail?: string;
}): Promise<{ ok: true }> {
  return request("/reports", { method: "POST", body: JSON.stringify(input) });
}

/** 신고 목록 (ADMIN) — status "ALL" 이면 처리된 것까지 */
export function fetchReports(status: ReportStatus | "ALL" = "PENDING"): Promise<ReportListResponse> {
  return request(`/reports?status=${status}`);
}

/** 미처리 건수 (ADMIN) — 헤더 배지용 */
export function fetchReportCount(): Promise<{ pending: number }> {
  return request("/reports/count");
}

/** 처리 상태 변경 (ADMIN) */
export function updateReport(
  id: string,
  status: ReportStatus,
  note?: string,
): Promise<Report> {
  return request(`/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status, note }) });
}
