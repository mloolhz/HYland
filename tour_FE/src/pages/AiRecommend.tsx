import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAiRecommendation,
  getAiRecommendationStream,
  getPopularQuestions,
  getSuggestedQuestions,
  getWeather,
  saveTop3Recommendation,
  type ChatHistoryItem,
} from "@/api/ai-recommend";
import { postRecommendations } from "@/api/recommendation";
import { AiRecommendComposer } from "@/components/ai-recommend/AiRecommendComposer";
import { AiResponseContent } from "@/components/ai-recommend/AiResponseContent";
import { IslandBtiPreferenceCard } from "@/components/ai-recommend/IslandBtiPreferenceCard";
import { RecommendationResultsPanel } from "@/components/ai-recommend/RecommendationResultsPanel";
import type { TripIntentFormValue } from "@/components/ai-recommend/AiTripSettingsPanel";
import { buildApplyMessage } from "@/lib/ai-trip-labels";
import { getAiSessionId } from "@/lib/ai-session-id";
import { CONTAINER } from "@/constants/layout";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import type { AiResponse, WeatherInfo } from "@/types/ai-recommend";
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
 * top3-loading은 조건(persona)이 설정된 턴에서만 거친다.
 * 조건이 없으면 detail-loading에서 바로 시작해 TOP3 단계 자체가 없다.
 */
type TurnPhase = "top3-loading" | "detail-loading" | "detail-typing" | "done";

type AiTurn = {
  id: string;
  /** 채팅 말풍선에 보여줄 텍스트 (조건 나열 문구는 여기 넣지 않는다) */
  displayText: string;
  /** 백엔드 question으로 실제 전달되는 텍스트 (조건 문구가 반영될 수 있음) */
  promptText: string;
  hasTop3: boolean;
  phase: TurnPhase;
  recommendation: RecommendationResponse | null;
  /** TOP3 단계에서 함께 조회한 여행 날짜 날씨 (없으면 null) */
  weather: WeatherInfo | null;
  assistant: AiResponse | null;
  /** 상세 답변이 타이핑되는 중의 누적 텍스트 */
  streamText: string;
  /** TOP3 턴 전용: 비슷한 조건의 다른 세션이 이어서 물어본 예상 질문 (null이면 미조회) */
  suggestedQuestions: string[] | null;
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
  const { hasResult, islandBtiResultCode } = useIslandBti();
  const [sessionId] = useState(() => getAiSessionId());

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
  const introOuterRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [introTopOffset, setIntroTopOffset] = useState<number | null>(null);

  // StrictMode의 개발 모드 mount→unmount→remount 시뮬레이션에서 cleanup만 있으면
  // remount 시 true로 복구되지 않아 이후 모든 타이핑이 첫 틱에서 즉시 중단된다.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasStarted = turns.length > 0 || loading;

  // intro 화면(.ai-page--intro)은 CSS의 justify-content:center 대신, 항상 이 값을
  // 계산해 .ai-page에 flex-start + padding-top으로 적용해서 수직 위치를 잡는다.
  // (overflow 상태에서 auto-height 컨테이너의 center 정렬은 브라우저마다 불안정
  // 하므로 아예 쓰지 않는다.) 인라인 padding-top은 CSS의 padding-top을 완전히
  // 대체해버리므로, 헤더 높이만큼의 여백(calc(--head-h + 40px), .ai-page CSS와
  // 동일한 값)을 직접 다시 더해줘야 헤더 아래로 내려가는 원래 위치가 유지된다.
  const measureIntroTopOffset = useCallback(() => {
    const outer = introOuterRef.current;
    const inner = introRef.current;
    if (!outer || !inner) return;

    const headHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--head-h")) || 74;
    const headerPadding = headHeight + 40;

    const availableHeight = Math.max(0, outer.clientHeight - headerPadding);
    const centeringBias = Math.max(0, (availableHeight - inner.offsetHeight) / 2);

    setIntroTopOffset(headerPadding + centeringBias);
  }, []);

  // settingsOpenRef: 아래 ResizeObserver 콜백이 설정 당시의 settingsOpen을
  // stale closure로 붙잡지 않고 항상 최신 값을 보도록 ref로 미러링한다.
  const settingsOpenRef = useRef(settingsOpen);
  useEffect(() => {
    settingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  // .ai-intro의 "닫힌" 높이는 폰트 로딩·인기질문 비동기 로딩 등으로 첫 렌더 이후에도
  // 계속 바뀔 수 있어, 의존성 배열로 트리거를 일일이 나열하는 대신 ResizeObserver로
  // 실제 크기 변화를 직접 감지해 패널이 닫혀 있는 동안 항상 최신 상태로 재측정한다.
  // (뷰포트 자체가 바뀌는 경우는 .ai-page의 min-height:100vh가 반응하므로 window
  // resize도 함께 듣는다.) 패널이 열려 있는 동안은 재측정하지 않아 이전에 잠가둔
  // 값이 유지되고, 그래서 입력창은 제자리에 남고 그 아래만 밀려 내려간다.
  useLayoutEffect(() => {
    if (hasStarted) return;

    const remeasureIfClosed = () => {
      if (settingsOpenRef.current) return;
      measureIntroTopOffset();
    };

    remeasureIfClosed();
    window.addEventListener("resize", remeasureIfClosed);

    const inner = introRef.current;
    const observer = inner ? new ResizeObserver(remeasureIfClosed) : null;
    observer?.observe(inner!);

    // 웹폰트가 늦게 로드되면 폴백 폰트로 렌더된 제목·칩 줄바꿈이 실제 폰트로
    // 교체되며 높이가 바뀌는데, 그 시점이 ResizeObserver 콜백보다 미묘하게
    // 어긋나는 경우가 있어 fonts.ready로 한 번 더 확실히 재측정한다.
    let cancelled = false;
    document.fonts?.ready
      ?.then(() => {
        if (!cancelled) remeasureIfClosed();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener("resize", remeasureIfClosed);
      observer?.disconnect();
    };
  }, [hasStarted, bootstrapped, measureIntroTopOffset]);

  // 조건 패널이 열리면 블록 전체 높이가 늘어나면서 입력창까지 함께 위로 밀리는
  // 문제가 있어, 패널을 "여는" 순간(state가 아직 바뀌기 전, 패널이 닫힌 채로 렌더된
  // 현재 위치)에 위 값을 다시 한번 동기적으로 못 박는다. 이후 패널이 열려있는
  // 동안은 위 effect가 재측정하지 않으므로 이 값이 그대로 유지되어 입력창까지는
  // 제자리에 남고, 그 아래(패널·섬BTI 버튼)만 정상적인 문서 흐름대로 밀려
  // 내려가며 페이지 자체가 늘어나 브라우저 스크롤로 볼 수 있다. 패널을 닫을 때는
  // 접힘 트랜지션이 끝난 뒤(300ms) 콘텐츠가 바뀌었을 수 있으니 다시 신선하게
  // 재측정한다 — 트랜지션 도중이 아니라서 값이 튀지 않는다.
  const handleSettingsOpenChange = useCallback(
    (open: boolean) => {
      if (!hasStarted) {
        if (open) {
          measureIntroTopOffset();
        } else {
          window.setTimeout(measureIntroTopOffset, 300);
        }
      }
      setSettingsOpen(open);
    },
    [hasStarted, measureIntroTopOffset],
  );

  const setTurnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) turnRefs.current.set(id, el);
    else turnRefs.current.delete(id);
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
          weather: null,
          assistant: null,
          streamText: "",
          suggestedQuestions: null,
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
      const basePersona = options.withRecommendation
        ? {
            travelDate: tripForm.travelDate,
            travelEndDate: tripForm.travelEndDate,
            duration: tripForm.duration,
            companion: tripForm.companion,
            travelMood: tripForm.travelMood,
            activities: tripForm.activities,
            // 섬BTI별 섬 선호도 집계용 스냅샷 (검사 이력이 없으면 생략)
            islandBti: hasResult ? islandBtiResultCode ?? undefined : undefined,
          }
        : undefined;

      // TOP3 단계에서 미리 조회하면 상세 답변 단계에서 같은 날짜를 다시 검색하지 않고 재사용한다.
      let weather: WeatherInfo | null = null;

      try {
        // 조건 패널(TOP3) 턴: 구조화 추천 + 날씨만 보여주고 끝낸다. 예전에는 이어서
        // Gemini에게 사용자 질문처럼 다시 물어 상세 답변까지 만들었는데, 그건 사용자가
        // 직접 입력한 질문에만 쓰는 걸로 분리했다. 대신 비슷한 조건의 다른 세션이
        // 이어서 물어본 질문을 예상 질문 칩으로 보여준다.
        if (options.withRecommendation) {
          const [recommendation, weatherResult] = await Promise.all([
            runStructuredRecommendation().catch((err) => {
              console.error("[ai-recommend] 구조화 추천 실패", err);
              return null;
            }),
            tripForm.travelDate ? getWeather(tripForm.travelDate, tripForm.travelEndDate) : null,
          ]);
          weather = weatherResult;

          // 카드(RecommendationResultsPanel)가 순위·추천도를 이미 보여주므로 같은 내용을
          // 타이핑 애니메이션으로 다시 보여주지 않는다 — 데이터가 오는 즉시 카드를 띄운다.
          setTurns((prev) =>
            prev.map((t) => (t.id === turnId ? { ...t, recommendation, weather, phase: "done" } : t)),
          );
          setLoading(false);

          if (recommendation && recommendation.recommendations.length > 0) {
            const persona = basePersona ? { ...basePersona, weather: weather ?? undefined } : {};
            void saveTop3Recommendation(promptText, recommendation, persona, sessionId);
          }

          // 예상 질문 칩은 세션 이력을 DB에서 집계하는 별도 조회라 느릴 수 있어(수 초 이상),
          // 카드 표시를 막지 않고 준비되는 대로 붙여준다. 섬BTI별 데이터가 아직 부족해
          // 집계 결과가 비어있으면, 첫 화면에 뜨던 인기 질문 상위 2개로 대신 보여준다.
          void getSuggestedQuestions(tripForm.companion, tripForm.travelMood)
            .catch(() => [] as string[])
            .then((suggestedQuestions) => {
              if (!mountedRef.current) return;
              const fallbackQuestions =
                popularQuestions.length > 0 ? popularQuestions : AI_RECOMMEND_COPY.exampleQuestions;
              const finalQuestions =
                suggestedQuestions.length > 0 ? suggestedQuestions : fallbackQuestions.slice(0, 2);
              setTurns((prev) =>
                prev.map((t) => (t.id === turnId ? { ...t, suggestedQuestions: finalQuestions } : t)),
              );
            });

          return;
        }

        // 아래부터는 사용자가 직접 입력한 질문 턴에서만 실행된다.
        const persona = basePersona ? { ...basePersona, weather: weather ?? undefined } : undefined;

        // 상세 답변(LLM) — 스트리밍 우선, 실패 시 논스트리밍 폴백
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
            sessionId,
          );
          if (!streamed) throw new Error("스트림 응답 없음");
          response = streamed;
        } catch (streamErr) {
          console.warn("[ai-recommend] 스트리밍 실패, 논스트리밍 폴백", streamErr);
          response = await getAiRecommendation(promptText, history, persona, sessionId);
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
    [
      hasResult,
      islandBtiResultCode,
      loading,
      popularQuestions,
      runStructuredRecommendation,
      sessionId,
      tripForm,
      turns,
      typeOutText,
    ],
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

  // turns 배열이 바뀔 때(새 턴 추가) 그 턴의 질문 말풍선을 채팅 영역 최상단에 한 번
  // 스냅한다. 그 아래로 답변이 채워지는 동안은 자동으로 따라 스크롤하지 않으며,
  // 사용자는 언제든 자유롭게 스크롤할 수 있다.
  // DOM 커밋 이후에 도는 useLayoutEffect라서 방금 렌더된 턴의 위치를 정확히 읽는다.
  useLayoutEffect(() => {
    const container = chatScrollRef.current;
    const lastTurn = turns[turns.length - 1];
    const isNewTurn = turns.length > prevTurnCountRef.current;
    prevTurnCountRef.current = turns.length;

    if (!container || !lastTurn || !isNewTurn) return;

    const turnEl = turnRefs.current.get(lastTurn.id);
    if (turnEl) scrollTurnToTop(container, turnEl);
  }, [turns]);

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
    <main
      className={`ai-page${hasStarted ? "" : " ai-page--intro"}`}
      ref={introOuterRef}
      style={
        !hasStarted && introTopOffset !== null
          ? { justifyContent: "flex-start", paddingTop: introTopOffset }
          : undefined
      }
    >
      <div className={`${CONTAINER} ai-page-inner`}>
        {!hasStarted ? (
          <div className="ai-intro" ref={introRef}>
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
              onSettingsOpenChange={handleSettingsOpenChange}
            />

            <IslandBtiPreferenceCard />
          </div>
        ) : (
          <>
            <div className="ai-chat" ref={chatScrollRef} aria-live="polite">
              {turns.map((turn, index) => {
                const isLast = index === turns.length - 1;
                const showTop3Cards = turn.recommendation && turn.phase !== "top3-loading";

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

                    {showTop3Cards && (
                      <div className="ai-bubble ai-bubble--assistant ai-bubble--recommendation ai-fade-up">
                        <RecommendationResultsPanel response={turn.recommendation!} weather={turn.weather} />
                      </div>
                    )}

                    {turn.hasTop3 &&
                      turn.phase === "done" &&
                      turn.suggestedQuestions &&
                      turn.suggestedQuestions.length > 0 && (
                        <div className="ai-bubble ai-bubble--assistant ai-fade-up">
                          <p className="ai-rec-lead">{AI_RECOMMEND_COPY.suggestedQuestionsLabel}</p>
                          <div className="ai-followups">
                            {turn.suggestedQuestions.map((q) => (
                              <button
                                key={q}
                                type="button"
                                className="ai-followup-chip"
                                onClick={() => void sendMessage(q)}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
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
              onSettingsOpenChange={handleSettingsOpenChange}
              showConditionsSummary={showConditionsSummary}
              onConditionsSummaryChange={setShowConditionsSummary}
            />
          </>
        )}
      </div>
    </main>
  );
}
