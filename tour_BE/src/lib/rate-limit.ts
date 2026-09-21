import type { NextFunction, Request, Response } from "express";

type Window = { limit: number; ms: number };

/**
 * IP 별 요청 횟수 제한 (메모리 기반, 서버 한 대 기준).
 *
 * AI 추천은 로그인 없이 누구나 부를 수 있고, 한 번 부를 때마다 OpenAI 를
 * 2~3번(범위 확인 + 답변 생성 + 날씨) 호출해 요금이 나간다. 같은 사람이
 * 짧은 시간에 반복 호출하면 막는다. 서버를 다시 띄우면 기록은 초기화된다.
 */
export function rateLimit(name: string, windows: Window[]) {
  // IP → 윈도별 요청 시각 목록
  const hits = new Map<string, number[]>();
  const longest = Math.max(...windows.map((w) => w.ms));

  // 오래된 기록 청소 — 메모리가 계속 늘지 않게
  setInterval(() => {
    const cutoff = Date.now() - longest;
    for (const [key, times] of hits) {
      const kept = times.filter((t) => t > cutoff);
      if (kept.length === 0) hits.delete(key);
      else hits.set(key, kept);
    }
  }, 60_000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const times = (hits.get(key) ?? []).filter((t) => t > now - longest);

    for (const w of windows) {
      const inWindow = times.filter((t) => t > now - w.ms);
      if (inWindow.length >= w.limit) {
        const retryAfter = Math.ceil((inWindow[0] + w.ms - now) / 1000);
        res.setHeader("Retry-After", String(Math.max(retryAfter, 1)));
        console.warn(`[rate-limit:${name}] ${key} 제한 (${w.limit}회/${w.ms / 1000}s)`);
        return res.status(429).json({
          error: "질문이 너무 많아요. 잠시 후 다시 시도해 주세요.",
          retryAfter,
        });
      }
    }

    times.push(now);
    hits.set(key, times);
    next();
  };
}
