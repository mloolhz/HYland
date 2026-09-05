/**
 * 회원/인증 API (tour_BE `/auth`)
 *
 * 로그인 식별자는 이메일이 아니라 아이디(username)다. 회원가입 폼이 아이디를
 * 받고 이메일은 선택이라, 백엔드도 그에 맞춰져 있다.
 */
import { API_BASE } from "@/lib/api-base";
import { readToken } from "@/lib/token";

export type AuthUser = {
  id: string;
  username: string;
  email: string | null;
  nickname: string;
};

export type MeResponse = AuthUser & {
  /** USER | ADMIN — 검수 메뉴 노출 판단용 */
  role: string;
  level: number;
  levelTitle: string;
  expCurrent: number;
  expMax: number;
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

/** 서버가 내려준 메시지를 그대로 쓰기 위한 오류 타입 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? "요청을 처리하지 못했어요.");
  }
  return body as T;
}

export function signup(input: {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
}): Promise<AuthResult> {
  return request("/auth/signup", { method: "POST", body: JSON.stringify(input) });
}

export function login(input: { username: string; password: string }): Promise<AuthResult> {
  return request("/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function fetchMe(token: string): Promise<MeResponse> {
  return request("/auth/me", {}, token);
}

/** 비밀번호 변경 — 현재 비밀번호 확인 후에만 바뀐다 */
export function changePassword(input: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }> {
  return request("/auth/password", { method: "PATCH", body: JSON.stringify(input) }, readToken());
}

/** 회원탈퇴 — 관련 데이터가 함께 삭제된다 */
export function deleteAccount(token: string): Promise<{ ok: boolean }> {
  return request("/auth/me", { method: "DELETE" }, token);
}

/** 회원가입 폼의 "중복 확인" — 이미 쓰이고 있으면 true */
export async function checkUsernameTaken(username: string): Promise<boolean> {
  const r = await request<{ taken: boolean }>(
    `/auth/check-username?username=${encodeURIComponent(username)}`,
  );
  return r.taken;
}

export async function checkNicknameTaken(nickname: string): Promise<boolean> {
  const r = await request<{ taken: boolean }>(
    `/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
  );
  return r.taken;
}

// ─────────────── 휴대폰 인증 ───────────────
//
// 실제 SMS 연동 전이라 서버가 인증코드를 응답에 담아 준다(devCode).
// 문자 발송을 붙이면 그 필드만 사라지고 흐름은 그대로다.

export function requestPhoneCode(phone: string): Promise<{ ok: boolean; devCode?: string }> {
  return request("/auth/phone/request", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyPhoneCode(phone: string, code: string): Promise<{ ok: boolean }> {
  return request("/auth/phone/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

// ─────────────── 계정 찾기 ───────────────

export type FoundAccount = {
  username: string;
  /** 목록에 보여줄 가려진 아이디 */
  maskedUsername: string;
  joinedAt: string | null;
};

/** 인증을 마친 번호로 가입된 아이디 목록 */
export async function findAccountIds(phone: string): Promise<FoundAccount[]> {
  const r = await request<{ total: number; accounts: FoundAccount[] }>("/auth/find-id", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  return r.accounts;
}

/** 비밀번호 재설정 — 인증한 번호로 가입된 아이디여야 한다 */
export function resetPassword(input: {
  phone: string;
  username: string;
  password: string;
}): Promise<{ ok: boolean }> {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
