/**
 * 섬BTI API (tour_BE `/bti`)
 *
 * 결과 계산은 프론트에서도 하고 서버에서도 한다(같은 규칙). 서버로 보내는
 * 이유는 로그인한 사용자의 검사 이력을 남기고 프로필 BTI 를 갱신하기 위해서다.
 * 비로그인이면 서버는 계산만 하고 저장하지 않는다.
 */
import { API_BASE } from "@/lib/api-base";
import { readToken } from "@/lib/token";

export type BtiSubmitResponse = {
  code: string;
  saved: boolean;
};

/** 답안(축 글자 배열)을 서버에 제출한다. 실패해도 화면 흐름은 막지 않는다. */
export async function submitBtiAnswers(answers: string[]): Promise<BtiSubmitResponse | null> {
  const token = readToken();
  try {
    const res = await fetch(`${API_BASE}/bti/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) return null;
    return (await res.json()) as BtiSubmitResponse;
  } catch {
    return null;
  }
}

/** 내 섬BTI 검사 이력 (로그인 필요) */
export async function fetchMyBtiHistory(): Promise<{ total: number; items: unknown[] } | null> {
  const token = readToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/bti/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
