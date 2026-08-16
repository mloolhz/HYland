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
import { useStreamTypewriter } from "@/hooks/useStreamTypewriter";

type LocationState = {
  initialMessage?: string;
  islandBti?: {
    code: string;
    name: string;
  };
};

type AiTurn = {
  id: string;
  userText: string;
  recommendation: RecommendationResponse | null;
  assistant: AiResponse | null;
  /** LLM 응답이 타자기 효과로 들어오는 중일 때의 누적 텍스트 */
  streamText: string;
  isStreamingAssistant: boolean;
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
  const [pendingTurnId, setPendingTurnId] = useState<string | null>(null);
  const [popularQuestions, setPopularQuestions] = useState<string[]>([]);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollToTurnIdRef = useRef<string | null>(null);
  const initialHandled = useRef(false);
  const { begin: beginTypewriter, pushTarget, finishStream, abort: abortTypewriter } =
    useStreamTypewriter();

  const hasStarted = turns.length > 0 || loading;

  const setTurnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
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
    async (userText: string, options: { withRecommendation: boolean }) => {
      if (loading) return;

      const turnId = createId();
      scrollToTurnIdRef.current = turnId;
      setPendingTurnId(turnId);

      setLoading(true);
      setErrorMsg(null);
      setSettingsOpen(false);
      setShowConditionsSummary(true);

      setTurns((prev) => [
        ...prev,
        {
          id: turnId,
          userText,
          recommendation: null,
          assistant: null,
          streamText: "",
          isStreamingAssistant: true,
        },
      ]);

      // 이전 턴들을 sportId 중복 추천 방지용 히스토리로 변환
      const history: ChatHistoryItem[] = turns.flatMap((turn): ChatHistoryItem[] => {
        const entries: ChatHistoryItem[] = [{ role: "user", text: turn.userText }];
        if (turn.assistant) {
          entries.push({
            role: "assistant",
            text: turn.assistant.text,
            sportIds: turn.assistant.recommendations.map((r) => r.sportId),
          });
        }
        return entries;
      });
      history.push({ role: "user", text: userText });

      // 구조화 추천(섬BTI + 조건 스코어링)은 LLM 대화 응답과 독립적으로 진행 —
      // 실패해도 대화 자체는 계속되도록 별도로 흡수
      const recommendationPromise = options.withRecommendation
        ? runStructuredRecommendation().catch((err) => {
            console.error("[ai-recommend] 구조화 추천 실패", err);
            return null;
          })
        : Promise.resolve(null);

      beginTypewriter({
        onDisplay: (streamText) => {
          setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, streamText } : t)));
        },
        onComplete: (response) => {
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turnId ? { ...t, assistant: response, isStreamingAssistant: false } : t,
            ),
          );
          setLoading(false);
          setPendingTurnId(null);
        },
      });

      try {
        try {
          await getAiRecommendationStream(
            userText,
            history,
            (streamText) => pushTarget(streamText),
            (response) => finishStream(response),
          );
        } catch (streamErr) {
          console.warn("[ai-recommend] 스트리밍 실패, 논스트리밍 폴백", streamErr);
          const response = await getAiRecommendation(userText, history);
          finishStream(response);
        }

        const recommendation = await recommendationPromise;
        setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, recommendation } : t)));
      } catch (err) {
        abortTypewriter();
        console.error(AI_RECOMMEND_COPY.requestFailedLog, err);
        // 사용자 턴 자체는 남겨서(질문 텍스트 유지) 에러+재시도 버튼을 그 턴에 붙여 보여준다.
        // 통째로 지우면 첫 턴 실패 시 intro 화면으로 되돌아가 에러가 보일 곳이 없어진다.
        setTurns((prev) =>
          prev.map((t) => (t.id === turnId ? { ...t, isStreamingAssistant: false } : t)),
        );
        setErrorMsg(AI_RECOMMEND_COPY.error);
        setLoading(false);
        setPendingTurnId(null);
      }
    },
    [
      abortTypewriter,
      beginTypewriter,
      finishStream,
      loading,
      pushTarget,
      runStructuredRecommendation,
      turns,
    ],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await executeTurn(trimmed, { withRecommendation: turns.length === 0 });
    },
    [executeTurn, turns.length],
  );

  const applyTripConditions = useCallback(async () => {
    await executeTurn(buildApplyMessage(tripForm), { withRecommendation: true });
  }, [executeTurn, tripForm]);

  useLayoutEffect(() => {
    const turnId = scrollToTurnIdRef.current;
    if (!turnId) return;

    const container = chatScrollRef.current;
    const turnEl = turnRefs.current.get(turnId);
    if (!container || !turnEl) return;

    scrollTurnToTop(container, turnEl);
  }, [turns, loading]);

  useEffect(() => {
    const turnId = scrollToTurnIdRef.current;
    if (!turnId || loading) return;

    const container = chatScrollRef.current;
    const turnEl = turnRefs.current.get(turnId);
    if (!container || !turnEl) return;

    scrollToTurnIdRef.current = null;
    scrollTurnToTop(container, turnEl);

    const observer = new ResizeObserver(() => {
      scrollTurnToTop(container, turnEl);
    });
    observer.observe(turnEl);

    return () => observer.disconnect();
  }, [turns, loading]);

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
                const showStreamingText = turn.isStreamingAssistant && !!turn.streamText;
                const showLoadingDots =
                  isLast && loading && turn.id === pendingTurnId && turn.isStreamingAssistant && !showStreamingText;

                return (
                  <div
                    key={turn.id}
                    ref={(el) => setTurnRef(turn.id, el)}
                    className={`ai-chat-turn${index === 0 ? " ai-fade-up" : ""}`}
                  >
                    <div className="ai-bubble ai-bubble--user">
                      <p>{turn.userText}</p>
                    </div>

                    {turn.recommendation ? (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--recommendation">
                        <RecommendationResultsPanel response={turn.recommendation} />
                      </div>
                    ) : null}

                    {turn.assistant ? (
                      <div className="ai-bubble ai-bubble--assistant">
                        <AiResponseContent
                          response={turn.assistant}
                          onFollowup={(text) => void sendMessage(text)}
                        />
                      </div>
                    ) : showStreamingText ? (
                      <div className="ai-bubble ai-bubble--assistant">
                        <p
                          className="ai-response-text ai-response-text--streaming"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {turn.streamText}
                        </p>
                      </div>
                    ) : null}

                    {showLoadingDots && (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--loading" aria-busy="true">
                        <span className="ai-loading-text">{AI_RECOMMEND_COPY.loading}</span>
                        <span className="ai-typing-dots" aria-hidden="true">
                          <span className="ai-dot"></span>
                          <span className="ai-dot"></span>
                          <span className="ai-dot"></span>
                        </span>
                      </div>
                    )}

                    {isLast && !loading && errorMsg && (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--error" role="alert">
                        <p>{errorMsg}</p>
                        <button
                          type="button"
                          className="ai-retry-btn"
                          onClick={() => void sendMessage(turn.userText)}
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
