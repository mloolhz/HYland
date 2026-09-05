/**
 * 회원/인증 API (tour_BE `/auth`)
 *
 * 로그인 식별자는 이메일이 아니라 아이디(username)다. 회원가입 폼이 아이디를
 * 받고 이메일은 선택이라, 백엔드도 그에 맞춰져 있다.
 */
import { API_BASE } from "@/lib/api-base";

export type AuthUser = {
  id: string;
  username: string;
  email: string | null;
  nickname: string;
};

export type MeResponse = AuthUser & {
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
