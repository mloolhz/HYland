import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAiRecommendation } from "@/api/ai-recommend";
import { postRecommendations } from "@/api/recommendation";
import { AiResponseContent } from "@/components/ai-recommend/AiResponseContent";
import { RecommendationResultsPanel } from "@/components/ai-recommend/RecommendationResultsPanel";
import { TripIntentForm, type TripIntentFormValue } from "@/components/ai-recommend/TripIntentForm";
import { CONTAINER } from "@/constants/layout";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import type { ChatMessage } from "@/types/ai-recommend";
import type { RecommendationResponse } from "@/types/recommendation";

const EXAMPLE_QUESTIONS = [
  "가족 당일치기 코스 추천해줘",
  "커플에게 어울리는 섬 추천",
  "비 오는 날 대체 코스",
  "힐링 여행 추천",
];

type LocationState = {
  initialMessage?: string;
  islandBti?: {
    code: string;
    name: string;
  };
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
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const scrollToUserIdRef = useRef<string | null>(null);
  const activeTurnIdRef = useRef<string | null>(null);
  const initialHandled = useRef(false);

  const turns = useMemo(() => groupTurns(messages), [messages]);

  const setTurnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
  }, []);

  const runStructuredRecommendation = useCallback(async () => {
    setRecommendLoading(true);
    try {
      const response = await postRecommendations({
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
      setRecommendation(response);
    } finally {
      setRecommendLoading(false);
    }
  }, [tripForm, hasResult]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { id: createId(), role: "user", text: trimmed };
      scrollToUserIdRef.current = userMsg.id;
      activeTurnIdRef.current = userMsg.id;
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = [...messages, userMsg]
          .filter((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
          .map((m) => ({ role: "user" as const, text: m.text }));

        const response = await getAiRecommendation(trimmed, history);
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", response },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
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
      return;
    }

    if (locationState?.islandBti) {
      initialHandled.current = true;
      setBootstrapped(true);
      void runStructuredRecommendation();
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    setBootstrapped(true);
  }, [
    initialMessage,
    location.pathname,
    locationState?.islandBti,
    navigate,
    runStructuredRecommendation,
    sendMessage,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const isEmpty = bootstrapped && messages.length === 0 && !loading && !recommendation;

  return (
    <main className="ai-page">
      <div className={`${CONTAINER} ai-page-inner`}>
        <header className="ai-page-head">
          <h1>인천섬 레저누리 AI 추천</h1>
        </header>

        <div className="ai-chat" ref={chatScrollRef} aria-live="polite">
          <TripIntentForm
            value={tripForm}
            onChange={setTripForm}
            onSubmit={() => void runStructuredRecommendation()}
            loading={recommendLoading}
            hasBtiResult={hasResult}
          />

          {recommendation ? <RecommendationResultsPanel response={recommendation} /> : null}

          {isEmpty && (
            <div className="ai-empty">
              <p>조건을 입력하고 TOP 3 섬 추천을 받거나, 아래 예시 질문으로 대화할 수 있어요.</p>
              <div className="ai-example-chips">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button key={q} type="button" className="ai-example-chip" onClick={() => void sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, index) => {
            const isLast = index === turns.length - 1;
            return (
              <div
                key={turn.user.id}
                ref={(el) => setTurnRef(turn.user.id, el)}
                className="ai-chat-turn"
              >
                <div className="ai-bubble ai-bubble--user">
                  <p>{turn.user.text}</p>
                </div>

                {turn.assistant && (
                  <div className="ai-bubble ai-bubble--assistant">
                    <AiResponseContent
                      response={turn.assistant.response}
                      onFollowup={(text) => void sendMessage(text)}
                    />
                  </div>
                )}

                {isLast && loading && (
                  <div className="ai-bubble ai-bubble--assistant ai-bubble--loading" aria-busy="true">
                    <p>AI가 추천을 준비하고 있어요…</p>
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
            className="ai-composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="예: 1위 추천 섬 일정을 더 자세히 알려줘"
            rows={2}
            aria-label="AI에게 질문하기"
            disabled={loading}
          />
          <button type="submit" className="ai-composer-send" disabled={loading || !input.trim()} aria-label="전송">
            전송
          </button>
        </form>

        <p className="ai-demo-note">추천 순위는 규칙 기반 엔진이 계산하고, AI는 설명·코스 문구를 생성합니다.</p>
      </div>
    </main>
  );
}
