import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAiRecommendation, getAiRecommendationStream, getPopularQuestions } from "@/api/ai-recommend";
import { AiResponseContent } from "@/components/ai-recommend/AiResponseContent";
import { CONTAINER } from "@/constants/layout";
import { isStreamingAssistant, type ChatMessage } from "@/types/ai-recommend";
import { AI_RECOMMEND_COPY } from "@/pages/aiRecommendCopy";
import { useStreamTypewriter } from "@/hooks/useStreamTypewriter";

type LocationState = {
  initialMessage?: string;
};

type Turn = {
  user: Extract<ChatMessage, { role: "user" }>;
  assistant?: Extract<ChatMessage, { role: "assistant" }>;
};

function createId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function groupTurns(messages: ChatMessage[]): Turn[] {
  const turns: Turn[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    const next = messages[i + 1];
    const assistant = next?.role === "assistant" ? next : undefined;
    turns.push({ user: msg, assistant });
    if (assistant) i++;
  }
  return turns;
}

function getMaxScrollTop(container: HTMLElement) {
  return Math.max(0, container.scrollHeight - container.clientHeight);
}

function clampScrollBottom(container: HTMLElement) {
  const max = getMaxScrollTop(container);
  if (container.scrollTop > max) {
    container.scrollTop = max;
  }
}

function snapTurnToTop(container: HTMLElement, turnEl: HTMLElement) {
  const containerTop = container.getBoundingClientRect().top;
  const turnTop =
    container.scrollTop + (turnEl.getBoundingClientRect().top - containerTop);

  const prev = turnEl.previousElementSibling as HTMLElement | null;
  let target = turnTop;
  if (prev) {
    const prevBottom =
      container.scrollTop + (prev.getBoundingClientRect().bottom - containerTop);
    target = Math.max(turnTop, Math.ceil(prevBottom) + 1);
  }

  container.scrollTop = Math.ceil(target);
}

function scrollTurnToContainerTop(container: HTMLElement, turnEl: HTMLElement) {
  snapTurnToTop(container, turnEl);
  requestAnimationFrame(() => {
    snapTurnToTop(container, turnEl);
    requestAnimationFrame(() => {
      snapTurnToTop(container, turnEl);
      setTimeout(() => snapTurnToTop(container, turnEl), 0);
    });
  });
}

export function AiRecommend() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = (location.state as LocationState | null)?.initialMessage?.trim();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasInput, setHasInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const scrollToUserIdRef = useRef<string | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const initialHandled = useRef(false);
  const { begin: beginTypewriter, pushTarget, finishStream, abort: abortTypewriter } =
    useStreamTypewriter();

  const turns = useMemo(() => groupTurns(messages), [messages]);

  const setTurnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
  }, []);

  const clearInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setHasInput(false);
  }, []);

  const readInput = useCallback(() => inputRef.current?.value ?? "", []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { id: createId(), role: "user", text: trimmed };
      const assistantId = createId();
      scrollToUserIdRef.current = userMsg.id;
      activeTurnIdRef.current = userMsg.id;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", isStreaming: true, streamText: "" },
      ]);
      clearInput();
      setLoading(true);
      setErrorMsg(null);

      beginTypewriter({
        onDisplay: (streamText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId && isStreamingAssistant(m) ? { ...m, streamText } : m,
            ),
          );
        },
        onComplete: (response) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { id: assistantId, role: "assistant", response } : m,
            ),
          );
          setLoading(false);
        },
      });

      try {
        const history = [...messages, userMsg]
          .filter((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
          .map((m) => ({ role: "user" as const, text: m.text }));

        try {
          await getAiRecommendationStream(
            trimmed,
            history,
            (streamText) => pushTarget(streamText),
            (response) => finishStream(response),
          );
        } catch (streamErr) {
          console.warn("[ai-recommend] 스트리밍 실패, 논스트리밍 폴백", streamErr);
          const response = await getAiRecommendation(trimmed, history);
          finishStream(response);
        }
      } catch (err) {
        abortTypewriter();
        console.error(AI_RECOMMEND_COPY.requestFailedLog, err);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setErrorMsg(AI_RECOMMEND_COPY.error);
        setLoading(false);
      }
    },
    [abortTypewriter, beginTypewriter, clearInput, finishStream, loading, messages, pushTarget],
  );

  const trySnapActiveTurn = useCallback(() => {
    const turnId = activeTurnIdRef.current;
    if (!turnId) return;

    const container = chatScrollRef.current;
    const turnEl = turnRefs.current.get(turnId);
    if (!container || !turnEl) return;

    snapTurnToTop(container, turnEl);
  }, []);

  useLayoutEffect(() => {
    const id = scrollToUserIdRef.current;
    if (!id) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "user" || lastMsg.id !== id) return;

    const container = chatScrollRef.current;
    const turnEl = turnRefs.current.get(id);
    if (!container || !turnEl) return;

    scrollToUserIdRef.current = null;
    scrollTurnToContainerTop(container, turnEl);
  }, [messages, loading]);

  useLayoutEffect(() => {
    const turnId = activeTurnIdRef.current;
    if (!turnId) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "assistant") return;

    const container = chatScrollRef.current;
    const turnEl = turnRefs.current.get(turnId);
    if (!container || !turnEl) return;

    activeTurnIdRef.current = null;
    scrollTurnToContainerTop(container, turnEl);
    requestAnimationFrame(() => clampScrollBottom(container));
  }, [messages]);

  useLayoutEffect(() => {
    if (loading) return;
    const container = chatScrollRef.current;
    if (!container) return;
    clampScrollBottom(container);
  }, [loading, messages]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const onScroll = () => {
      if (loading) return;
      clampScrollBottom(container);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [loading]);

  const [popularQuestions, setPopularQuestions] = useState<string[]>([]);

  useEffect(() => {
    void getPopularQuestions().then((qs) => {
      if (qs.length > 0) setPopularQuestions(qs);
    });
  }, []);

  useEffect(() => {
    if (!loading || !activeTurnIdRef.current) return;

    const container = chatScrollRef.current;
    if (!container) return;

    trySnapActiveTurn();

    const observer = new ResizeObserver(() => {
      trySnapActiveTurn();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [loading, messages, trySnapActiveTurn]);

  useEffect(() => {
    if (initialHandled.current) return;
    if (initialMessage) {
      initialHandled.current = true;
      setBootstrapped(true);
      void sendMessage(initialMessage);
      navigate(location.pathname, { replace: true, state: null });
    } else {
      setBootstrapped(true);
    }
  }, [initialMessage, location.pathname, navigate, sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(readInput());
  };

  const isEmpty = bootstrapped && messages.length === 0 && !loading;

  return (
    <main className="ai-page">
      <div className={`${CONTAINER} ai-page-inner`}>
        <header className="ai-page-head">
          <h1>{AI_RECOMMEND_COPY.title}</h1>
        </header>

        <div className="ai-chat" ref={chatScrollRef} aria-live="polite">
          {isEmpty && (
            <div className="ai-empty">
              <p>{AI_RECOMMEND_COPY.emptyPrompt}</p>
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
            </div>
          )}

          {turns.map((turn, index) => {
            const isLast = index === turns.length - 1;
            const streamingAssistant =
              turn.assistant && isStreamingAssistant(turn.assistant) ? turn.assistant : null;
            const showStreamingText = !!streamingAssistant?.streamText;
            const showLoadingDots = isLast && loading && streamingAssistant && !showStreamingText;

            return (
              <div
                key={turn.user.id}
                ref={(el) => setTurnRef(turn.user.id, el)}
                className="ai-chat-turn"
              >
                <div className="ai-bubble ai-bubble--user">
                  <p>{turn.user.text}</p>
                </div>

                {turn.assistant && !showLoadingDots && (
                  <div className="ai-bubble ai-bubble--assistant">
                    {streamingAssistant ? (
                      <p className="ai-response-text ai-response-text--streaming" style={{ whiteSpace: "pre-line" }}>
                        {streamingAssistant.streamText}
                      </p>
                    ) : !isStreamingAssistant(turn.assistant) ? (
                      <AiResponseContent
                        response={turn.assistant.response}
                        onFollowup={(text) => void sendMessage(text)}
                      />
                    ) : null}
                  </div>
                )}

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
                      onClick={() => void sendMessage(turn.user.text)}
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

        <form className="ai-composer" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="ai-composer-input"
            defaultValue=""
            onInput={() => setHasInput(!!inputRef.current?.value.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void sendMessage(readInput());
              }
            }}
            placeholder={AI_RECOMMEND_COPY.placeholder}
            rows={2}
            aria-label={AI_RECOMMEND_COPY.inputLabel}
            disabled={loading}
          />
          <button
            type="submit"
            className="ai-composer-send"
            disabled={loading || !hasInput}
            aria-label={AI_RECOMMEND_COPY.send}
          >
            {AI_RECOMMEND_COPY.send}
          </button>
        </form>

        <p className="ai-demo-note">{AI_RECOMMEND_COPY.demoNote}</p>
      </div>
    </main>
  );
}
