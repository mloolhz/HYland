import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAiRecommendation } from "@/api/ai-recommend";
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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showConditionsSummary, setShowConditionsSummary] = useState(false);
  const [pendingTurnId, setPendingTurnId] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const turnRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollToTurnIdRef = useRef<string | null>(null);
  const initialHandled = useRef(false);

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
      setSettingsOpen(false);
      setShowConditionsSummary(true);

      setTurns((prev) => [
        ...prev,
        {
          id: turnId,
          userText,
          recommendation: null,
          assistant: null,
        },
      ]);
      setInput("");

      try {
        const recommendation = options.withRecommendation ? await runStructuredRecommendation() : null;

        const history = [
          ...turns.map((turn) => ({ role: "user" as const, text: turn.userText })),
          { role: "user" as const, text: userText },
        ];

        const assistant = await getAiRecommendation(userText, history);

        setTurns((prev) =>
          prev.map((turn) =>
            turn.id === turnId ? { ...turn, recommendation, assistant } : turn,
          ),
        );
      } finally {
        setPendingTurnId(null);
        setLoading(false);
      }
    },
    [loading, runStructuredRecommendation, turns],
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
            <AiRecommendComposer
              variant="intro"
              value={tripForm}
              onChange={setTripForm}
              input={input}
              onInputChange={setInput}
              onSubmit={() => void sendMessage(input)}
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
              {turns.map((turn) => (
                <div key={turn.id} ref={(el) => setTurnRef(turn.id, el)} className="ai-chat-turn">
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
                  ) : null}

                  {loading && turn.id === pendingTurnId ? (
                    <div className="ai-bubble ai-bubble--assistant ai-bubble--loading" aria-busy="true">
                      <p>AI가 추천을 준비하고 있어요…</p>
                    </div>
                  ) : null}
                </div>
              ))}

              <div
                className={`ai-chat-spacer${loading ? " ai-chat-spacer--grow" : ""}`}
                aria-hidden="true"
              />
            </div>

            <AiRecommendComposer
              variant="chat"
              value={tripForm}
              onChange={setTripForm}
              input={input}
              onInputChange={setInput}
              onSubmit={() => void sendMessage(input)}
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
