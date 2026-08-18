import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAiRecommendation,
  getAiRecommendationStream,
  getPopularQuestions,
  type ChatHistoryItem,
} from "@/api/ai-recommend";
import { postRecommendations } from "@/api/recommendation";
import { AiRecommendComposer } from "@/components/ai-recommend/AiRecommendComposer";
import { AiResponseContent } from "@/components/ai-recommend/AiResponseContent";
import { RecommendationResultsPanel } from "@/components/ai-recommend/RecommendationResultsPanel";
import type { TripIntentFormValue } from "@/components/ai-recommend/AiTripSettingsPanel";
import { buildApplyMessage } from "@/lib/ai-trip-labels";
import { CONTAINER } from "@/constants/layout";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import type { AiResponse } from "@/types/ai-recommend";
import type { RecommendationResponse } from "@/types/recommendation";
import { AI_RECOMMEND_COPY } from "@/pages/aiRecommendCopy";
import { TYPEWRITER_CHARS_PER_TICK, TYPEWRITER_TICK_MS } from "@/hooks/useStreamTypewriter";

type LocationState = {
  initialMessage?: string;
  islandBti?: {
    code: string;
    name: string;
  };
};

/**
 * top3-loading/top3-typing은 조건(persona)이 설정된 턴에서만 거친다.
 * 조건이 없으면 detail-loading에서 바로 시작해 TOP3 단계 자체가 없다.
 */
type TurnPhase = "top3-loading" | "top3-typing" | "detail-loading" | "detail-typing" | "done";

type AiTurn = {
  id: string;
  /** 채팅 말풍선에 보여줄 텍스트 (조건 나열 문구는 여기 넣지 않는다) */
  displayText: string;
  /** 백엔드 question으로 실제 전달되는 텍스트 (조건 문구가 반영될 수 있음) */
  promptText: string;
  hasTop3: boolean;
  phase: TurnPhase;
  recommendation: RecommendationResponse | null;
  /** TOP3 요약이 타이핑되는 중의 누적 텍스트 */
  top3Text: string;
  assistant: AiResponse | null;
  /** 상세 답변이 타이핑되는 중의 누적 텍스트 */
  streamText: string;
};

function createId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function snapTurnToTop(container: HTMLElement, turnEl: HTMLElement) {
  const containerTop = container.getBoundingClientRect().top;
  const turnTop = container.scrollTop + (turnEl.getBoundingClientRect().top - containerTop);
  container.scrollTop = Math.max(0, Math.ceil(turnTop));
}

function scrollTurnToTop(container: HTMLElement, turnEl: HTMLElement) {
  snapTurnToTop(container, turnEl);
  requestAnimationFrame(() => {
    snapTurnToTop(container, turnEl);
    requestAnimationFrame(() => snapTurnToTop(container, turnEl));
  });
}

function defaultTripForm(): TripIntentFormValue {
  const travelDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return {
    travelDate,
    travelEndDate: travelDate,
    duration: 1,
    companion: "friend",
    travelMood: "healing",
    activities: ["바다", "산책"],
  };
}

function buildTop3SummaryText(response: RecommendationResponse): string {
  const lead =
    response.useIslandBti && response.userIslandBti
      ? `${response.userIslandBti} 성향을 반영해 TOP ${response.recommendations.length} 섬을 골랐어요.`
      : `이번 여행 조건 중심으로 TOP ${response.recommendations.length} 섬을 골랐어요.`;

  const lines = response.recommendations.map(
    (item) => `${item.rank}위 ${item.islandName} · 추천도 ${item.finalScore}%`,
  );

  return [lead, ...lines].join("\n");
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="ai-bubble ai-bubble--assistant ai-bubble--loading" aria-busy="true">
      <span className="ai-loading-text">{label}</span>
      <span className="ai-typing-dots" aria-hidden="true">
        <span className="ai-dot"></span>
        <span className="ai-dot"></span>
        <span className="ai-dot"></span>
      </span>
    </div>
  );
}

export function AiRecommend() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as LocationState | null) ?? null;
  const initialMessage = locationState?.initialMessage?.trim();
  const { hasResult } = useIslandBti();

  const [tripForm, setTripForm] = useState<TripIntentFormValue>(() => defaultTripForm());
  const [turns, setTurns] = useState<AiTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showConditionsSummary, setShowConditionsSummary] = useState(false);
  const [popularQuestions, setPopularQuestions] = useState<string[]>([]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTurnCountRef = useRef(0);
  const initialHandled = useRef(false);
  const mountedRef = useRef(true);
  // 사용자가 타이핑 도중 위로 스크롤하면 false가 되어 자동 하단 추적을 멈춘다.
  // 프로그래매틱 스크롤은 항상 정확히 바닥까지 이동시키므로, scroll 이벤트 후
  // 바닥 근처가 아니면 사용자가 직접 올린 것으로 판단해도 안전하다.
  const autoScrollEnabledRef = useRef(true);

  // StrictMode의 개발 모드 mount→unmount→remount 시뮬레이션에서 cleanup만 있으면
  // remount 시 true로 복구되지 않아 이후 모든 타이핑이 첫 틱에서 즉시 중단된다.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasStarted = turns.length > 0 || loading;

  const setTurnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
  }, []);

  const scrollChatToBottom = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  /** 완성된 문자열을 캐릭터 단위로 타이핑해서 보여준다 (네트워크 스트리밍과 무관). */
  const typeOutText = useCallback((text: string, onTick: (partial: string) => void): Promise<void> => {
    const chars = Array.from(text);
    if (chars.length === 0) {
      onTick("");
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let count = 0;
      const timer = setInterval(() => {
        if (!mountedRef.current) {
          clearInterval(timer);
          resolve();
          return;
        }
        count = Math.min(count + TYPEWRITER_CHARS_PER_TICK, chars.length);
        onTick(chars.slice(0, count).join(""));
        if (count >= chars.length) {
          clearInterval(timer);
          resolve();
        }
      }, TYPEWRITER_TICK_MS);
    });
  }, []);

  const runStructuredRecommendation = useCallback(async () => {
    return postRecommendations({
      trip: {
        travelDate: tripForm.travelDate,
        travelEndDate: tripForm.travelEndDate ?? tripForm.travelDate,
        duration: tripForm.duration,
        companion: tripForm.companion,
        travelMood: tripForm.travelMood,
        activities: tripForm.activities,
        intensity: tripForm.intensity,
      },
      useIslandBti: hasResult,
    });
  }, [tripForm, hasResult]);

  const executeTurn = useCallback(
    async (
      displayText: string,
      promptText: string,
      options: { withRecommendation: boolean },
    ) => {
      if (loading) return;

      const turnId = createId();

      setLoading(true);
      setErrorMsg(null);
      setSettingsOpen(false);

      setTurns((prev) => [
        ...prev,
        {
          id: turnId,
          displayText,
          promptText,
          hasTop3: options.withRecommendation,
          phase: options.withRecommendation ? "top3-loading" : "detail-loading",
          recommendation: null,
          top3Text: "",
          assistant: null,
          streamText: "",
        },
      ]);

      // 이전 턴들을 sportId 중복 추천 방지용 히스토리로 변환 (실제 backend에 보낸 promptText 기준)
      const history: ChatHistoryItem[] = turns.flatMap((turn): ChatHistoryItem[] => {
        const entries: ChatHistoryItem[] = [{ role: "user", text: turn.promptText }];
        if (turn.assistant) {
          entries.push({
            role: "assistant",
            text: turn.assistant.text,
            sportIds: turn.assistant.recommendations.map((r) => r.sportId),
          });
        }
        return entries;
      });
      history.push({ role: "user", text: promptText });

      // 조건 패널(날짜·동행·분위기·관심활동)이 실제로 적용된 턴에만 persona를 함께 보낸다.
      const persona = options.withRecommendation
        ? {
            travelDate: tripForm.travelDate,
            travelEndDate: tripForm.travelEndDate,
            duration: tripForm.duration,
            companion: tripForm.companion,
            travelMood: tripForm.travelMood,
            activities: tripForm.activities,
          }
        : undefined;

      try {
        // 1단계: TOP3 (조건이 설정된 턴에서만) — 완전히 타이핑될 때까지 상세 답변은 시작하지 않는다.
        if (options.withRecommendation) {
          const recommendation = await runStructuredRecommendation().catch((err) => {
            console.error("[ai-recommend] 구조화 추천 실패", err);
            return null;
          });

          if (recommendation && recommendation.recommendations.length > 0) {
            setTurns((prev) =>
              prev.map((t) =>
                t.id === turnId ? { ...t, recommendation, phase: "top3-typing" } : t,
              ),
            );
            await typeOutText(buildTop3SummaryText(recommendation), (partial) => {
              setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, top3Text: partial } : t)));
            });
          }

          setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, phase: "detail-loading" } : t)));
        }

        // 2단계: 상세 답변(LLM) — 스트리밍 우선, 실패 시 논스트리밍 폴백
        let response: AiResponse;
        try {
          let streamed: AiResponse | null = null;
          await getAiRecommendationStream(
            promptText,
            history,
            persona,
            () => {}, // 부분 미리보기는 표시하지 않는다(순서 보장을 위해 완료 후 타이핑)
            (r) => {
              streamed = r;
            },
          );
          if (!streamed) throw new Error("스트림 응답 없음");
          response = streamed;
        } catch (streamErr) {
          console.warn("[ai-recommend] 스트리밍 실패, 논스트리밍 폴백", streamErr);
          response = await getAiRecommendation(promptText, history, persona);
        }

        setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, phase: "detail-typing" } : t)));
        await typeOutText(response.text, (partial) => {
          setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, streamText: partial } : t)));
        });

        setTurns((prev) =>
          prev.map((t) => (t.id === turnId ? { ...t, assistant: response, phase: "done" } : t)),
        );
        setLoading(false);
      } catch (err) {
        console.error(AI_RECOMMEND_COPY.requestFailedLog, err);
        setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, phase: "done" } : t)));
        setErrorMsg(AI_RECOMMEND_COPY.error);
        setLoading(false);
      }
    },
    [loading, runStructuredRecommendation, scrollChatToBottom, tripForm, turns, typeOutText],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await executeTurn(trimmed, trimmed, { withRecommendation: false });
    },
    [executeTurn],
  );

  const applyTripConditions = useCallback(async () => {
    await executeTurn(AI_RECOMMEND_COPY.applyLabel, buildApplyMessage(tripForm), {
      withRecommendation: true,
    });
  }, [executeTurn, tripForm]);

  const retryTurn = useCallback(
    (turn: AiTurn) => {
      void executeTurn(turn.displayText, turn.promptText, { withRecommendation: turn.hasTop3 });
    },
    [executeTurn],
  );

  // 사용자가 직접 스크롤하면(프로그래매틱 스크롤은 항상 바닥에서 끝나므로, 바닥 근처가
  // 아닌 상태로 scroll 이벤트가 오면 사용자가 올린 것) 자동 하단 추적을 끈다.
  // .ai-chat은 hasStarted가 true여야 DOM에 존재하므로, 그 시점에 맞춰 다시 등록해야 한다.
  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const BOTTOM_THRESHOLD = 40;
    const onScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      autoScrollEnabledRef.current = distanceFromBottom < BOTTOM_THRESHOLD;
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [hasStarted]);

  // turns 배열이 바뀔 때마다: 새 턴이 막 생겼으면(질문이 아직 안 보였으면) 상단에 한 번
  // 스냅하고, 같은 턴 안에서 내용만 자란 경우(타이핑·카드 등장)는 바닥으로 따라 내려간다.
  // 단, 사용자가 위로 스크롤해서 자동 추적을 끈 상태라면 따라 내려가지 않는다.
  // DOM 커밋 이후에 도는 useLayoutEffect라서 방금 렌더된 카드/텍스트 높이를 정확히 읽는다.
  useLayoutEffect(() => {
    const container = chatScrollRef.current;
    const lastTurn = turns[turns.length - 1];
    const isNewTurn = turns.length > prevTurnCountRef.current;
    prevTurnCountRef.current = turns.length;

    if (!container || !lastTurn) return;

    if (isNewTurn) {
      autoScrollEnabledRef.current = true;
      const turnEl = turnRefs.current.get(lastTurn.id);
      if (turnEl) scrollTurnToTop(container, turnEl);
    } else if (autoScrollEnabledRef.current) {
      scrollChatToBottom();
    }
  }, [turns, scrollChatToBottom]);

  useEffect(() => {
    void getPopularQuestions().then((qs) => {
      if (qs.length > 0) setPopularQuestions(qs);
    });
  }, []);

  useEffect(() => {
    if (initialHandled.current) return;

    if (initialMessage) {
      initialHandled.current = true;
      setBootstrapped(true);
      setSettingsOpen(false);
      void sendMessage(initialMessage);
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (locationState?.islandBti) {
      initialHandled.current = true;
      setBootstrapped(true);
      setSettingsOpen(false);
      void applyTripConditions();
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    setBootstrapped(true);
  }, [
    applyTripConditions,
    initialMessage,
    location.pathname,
    locationState?.islandBti,
    navigate,
    sendMessage,
  ]);

  if (!bootstrapped) {
    return <main className="ai-page" />;
  }

  return (
    <main className={`ai-page${hasStarted ? "" : " ai-page--intro"}`}>
      <div className={`${CONTAINER} ai-page-inner`}>
        {!hasStarted ? (
          <div className="ai-intro">
            <h1 className="ai-intro__title">어떤 섬 여행을 떠나볼까요?</h1>

            <div className="ai-example-chips">
              {(popularQuestions.length > 0
                ? popularQuestions
                : AI_RECOMMEND_COPY.exampleQuestions
              ).map((q) => (
                <button key={q} type="button" className="ai-example-chip" onClick={() => void sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>

            <AiRecommendComposer
              variant="intro"
              value={tripForm}
              onChange={setTripForm}
              onSubmit={(text) => void sendMessage(text)}
              onApplyConditions={() => void applyTripConditions()}
              loading={loading}
              hasBtiResult={hasResult}
              settingsOpen={settingsOpen}
              onSettingsOpenChange={setSettingsOpen}
            />
          </div>
        ) : (
          <>
            <div className="ai-chat" ref={chatScrollRef} aria-live="polite">
              {turns.map((turn, index) => {
                const isLast = index === turns.length - 1;
                const showTop3Bubble =
                  turn.hasTop3 && (turn.top3Text || turn.phase === "top3-typing");
                const showTop3Cards =
                  turn.recommendation && turn.phase !== "top3-loading" && turn.phase !== "top3-typing";

                return (
                  <div
                    key={turn.id}
                    ref={(el) => setTurnRef(turn.id, el)}
                    className={`ai-chat-turn${index === 0 ? " ai-fade-up" : ""}`}
                  >
                    <div className="ai-bubble ai-bubble--user">
                      <p>{turn.displayText}</p>
                    </div>

                    {turn.phase === "top3-loading" && <LoadingDots label={AI_RECOMMEND_COPY.loadingTop3} />}

                    {showTop3Bubble && (
                      <div className="ai-bubble ai-bubble--assistant">
                        <p
                          className="ai-response-text ai-response-text--streaming"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {turn.top3Text}
                        </p>
                      </div>
                    )}

                    {showTop3Cards && (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--recommendation ai-fade-up">
                        <RecommendationResultsPanel response={turn.recommendation!} />
                      </div>
                    )}

                    {turn.phase === "detail-loading" && <LoadingDots label={AI_RECOMMEND_COPY.loading} />}

                    {turn.assistant ? (
                      <div className="ai-bubble ai-bubble--assistant">
                        <AiResponseContent
                          response={turn.assistant}
                          onFollowup={(text) => void sendMessage(text)}
                        />
                      </div>
                    ) : turn.phase === "detail-typing" ? (
                      <div className="ai-bubble ai-bubble--assistant">
                        <p
                          className="ai-response-text ai-response-text--streaming"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {turn.streamText}
                        </p>
                      </div>
                    ) : null}

                    {isLast && !loading && errorMsg && (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--error" role="alert">
                        <p>{errorMsg}</p>
                        <button
                          type="button"
                          className="ai-retry-btn"
                          onClick={() => retryTurn(turn)}
                        >
                          {AI_RECOMMEND_COPY.retry}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div
                className={`ai-chat-spacer${loading ? " ai-chat-spacer--grow" : ""}`}
                aria-hidden="true"
              />
            </div>

            <AiRecommendComposer
              variant="chat"
              value={tripForm}
              onChange={setTripForm}
              onSubmit={(text) => void sendMessage(text)}
              onApplyConditions={() => void applyTripConditions()}
              loading={loading}
              hasBtiResult={hasResult}
              settingsOpen={settingsOpen}
              onSettingsOpenChange={setSettingsOpen}
              showConditionsSummary={showConditionsSummary}
              onConditionsSummaryChange={setShowConditionsSummary}
            />
          </>
        )}
      </div>
    </main>
  );
}
