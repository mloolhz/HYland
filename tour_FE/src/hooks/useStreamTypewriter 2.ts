import { useCallback, useEffect, useRef } from "react";
import type { AiResponse } from "@/types/ai-recommend";

/** 타자기 속도: TICK_MS마다 CHARS_PER_TICK글자 (기본 ~50자/초) */
export const TYPEWRITER_TICK_MS = 20;
export const TYPEWRITER_CHARS_PER_TICK = 1;

type TypewriterSession = {
  onDisplay: (text: string) => void;
  onComplete: (response: AiResponse) => void;
};

function sliceDisplayed(chars: string[], count: number): string {
  return chars.slice(0, count).join("");
}

export function useStreamTypewriter() {
  const sessionRef = useRef<TypewriterSession | null>(null);
  const bufferCharsRef = useRef<string[]>([]);
  const displayedCountRef = useRef(0);
  const pendingResponseRef = useRef<AiResponse | null>(null);
  const streamDoneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const completeSession = useCallback(() => {
    const session = sessionRef.current;
    const response = pendingResponseRef.current;
    if (!session || !response) return;

    stopTimer();
    session.onComplete(response);
    sessionRef.current = null;
    pendingResponseRef.current = null;
    streamDoneRef.current = false;
    bufferCharsRef.current = [];
    displayedCountRef.current = 0;
  }, [stopTimer]);

  const tick = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const chars = bufferCharsRef.current;
    const total = chars.length;

    if (displayedCountRef.current < total) {
      displayedCountRef.current = Math.min(
        displayedCountRef.current + TYPEWRITER_CHARS_PER_TICK,
        total,
      );
      session.onDisplay(sliceDisplayed(chars, displayedCountRef.current));
    }

    if (displayedCountRef.current >= total && streamDoneRef.current && pendingResponseRef.current) {
      completeSession();
    }
  }, [completeSession]);

  const ensureTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(tick, TYPEWRITER_TICK_MS);
  }, [tick]);

  const begin = useCallback(
    (session: TypewriterSession) => {
      stopTimer();
      sessionRef.current = session;
      bufferCharsRef.current = [];
      displayedCountRef.current = 0;
      pendingResponseRef.current = null;
      streamDoneRef.current = false;
    },
    [stopTimer],
  );

  const pushTarget = useCallback(
    (text: string) => {
      if (!sessionRef.current) return;

      bufferCharsRef.current = Array.from(text);
      if (displayedCountRef.current > bufferCharsRef.current.length) {
        displayedCountRef.current = bufferCharsRef.current.length;
      }
      ensureTimer();
    },
    [ensureTimer],
  );

  const finishStream = useCallback(
    (response: AiResponse) => {
      if (!sessionRef.current) return;

      pendingResponseRef.current = response;
      streamDoneRef.current = true;
      bufferCharsRef.current = Array.from(response.text);
      if (displayedCountRef.current > bufferCharsRef.current.length) {
        displayedCountRef.current = bufferCharsRef.current.length;
      }

      if (displayedCountRef.current < bufferCharsRef.current.length) {
        sessionRef.current.onDisplay(
          sliceDisplayed(bufferCharsRef.current, displayedCountRef.current),
        );
        ensureTimer();
        return;
      }

      sessionRef.current.onDisplay(response.text);
      completeSession();
    },
    [completeSession, ensureTimer],
  );

  const abort = useCallback(() => {
    stopTimer();
    sessionRef.current = null;
    pendingResponseRef.current = null;
    streamDoneRef.current = false;
    bufferCharsRef.current = [];
    displayedCountRef.current = 0;
  }, [stopTimer]);

  useEffect(() => () => abort(), [abort]);

  return { begin, pushTarget, finishStream, abort };
}
