import type { AiResponse, RecItem, WeatherInfo } from "@/types/ai-recommend";
import { API_BASE } from "@/lib/api-base";
import type { RecommendationResponse, TripIntent } from "@/types/recommendation";
import { buildRec } from "./mockData";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  text: string;
  /** assistant 턴에서 실제로 추천한 sportId 목록 (백엔드가 중복 추천 방지에 사용) */
  sportIds?: string[];
};


type RecommendPayload = {
  text?: string;
  recommendations?: Array<{ sportId: string; islandName: string }>;
  course?: AiResponse["course"];
  tips?: string[];
  followups?: string[];
  weather?: WeatherInfo;
};

function toAiResponse(data: RecommendPayload): AiResponse {
  const recommendations: RecItem[] = (data.recommendations ?? [])
    .map((r) => buildRec(r.sportId, r.islandName))
    .filter((r): r is RecItem => r !== null);

  return {
    text: data.text ?? "",
    recommendations,
    course: data.course,
    tips: data.tips,
    followups: data.followups,
    weather: data.weather,
  };
}

/** 부분 JSON에서 대화 text 필드만 추출 (스트리밍 미리보기용) */
function extractPartialText(raw: string): string {
  const marker = raw.match(/"text"\s*:\s*"/);
  if (!marker || marker.index === undefined) return "";

  let i = marker.index + marker[0].length;
  let result = "";

  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "\\") {
      if (i + 1 >= raw.length) break;
      const next = raw[i + 1];
      if (next === "n") result += "\n";
      else if (next === "t") result += "\t";
      else if (next === "r") result += "\r";
      else if (next === '"') result += '"';
      else if (next === "\\") result += "\\";
      else result += next;
      i += 2;
      continue;
    }
    if (ch === '"') break;
    result += ch;
    i += 1;
  }

  return result;
}

type SSEEvent = { event: string; data: string };

function parseSSEBuffer(buffer: string): { events: SSEEvent[]; remainder: string } {
  const events: SSEEvent[] = [];
  let rest = buffer.replace(/\r\n/g, "\n");

  while (true) {
    const sep = rest.indexOf("\n\n");
    if (sep === -1) break;

    const block = rest.slice(0, sep);
    rest = rest.slice(sep + 2);

    let event = "message";
    let data = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7).trim();
      else if (line.startsWith("data: ")) data += line.slice(6);
    }
    if (data) events.push({ event, data });
  }

  return { events, remainder: rest };
}

function handleSSEEvents(
  events: SSEEvent[],
  rawAccum: { value: string },
  onTextChunk: (accumulatedText: string) => void,
  onDone: (response: AiResponse) => void,
): boolean {
  for (const evt of events) {
    if (evt.event === "chunk") {
      const payload = JSON.parse(evt.data) as { text?: string };
      rawAccum.value += payload.text ?? "";
      onTextChunk(extractPartialText(rawAccum.value));
      continue;
    }

    if (evt.event === "done") {
      const payload = JSON.parse(evt.data) as RecommendPayload;
      onDone(toAiResponse(payload));
      return true;
    }

    if (evt.event === "error") {
      const payload = JSON.parse(evt.data) as { error?: string };
      throw new Error(payload.error ?? "추천 생성 중 오류가 발생했습니다.");
    }
  }

  return false;
}

/** 백엔드 AI 추천 호출 → 실제 종목 데이터로 채워서 반환 (논스트리밍 폴백) */
/** 질문 출처 — "chip"은 인기질문·AI followup 칩 클릭, "user"는 직접 입력 */
export type QuestionSource = "user" | "chip";

export async function getAiRecommendation(
  userMessage: string,
  history?: ChatHistoryItem[],
  persona?: TripIntent,
  sessionId?: string,
  questionSource?: QuestionSource,
): Promise<AiResponse> {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userMessage, history, persona, sessionId, questionSource }),
  });

  if (!res.ok) {
    throw new Error("추천 요청 실패");
  }

  const data = (await res.json()) as RecommendPayload;
  return toAiResponse(data);
}

/** SSE 스트리밍 AI 추천 */
export async function getAiRecommendationStream(
  userMessage: string,
  history: ChatHistoryItem[] | undefined,
  persona: TripIntent | undefined,
  onTextChunk: (accumulatedText: string) => void,
  onDone: (response: AiResponse) => void,
  sessionId?: string,
  questionSource?: QuestionSource,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/recommend/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userMessage, history, persona, sessionId, questionSource }),
  });

  if (!res.ok) {
    throw new Error("추천 요청 실패");
  }

  if (!res.body) {
    throw new Error("스트림 응답 없음");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let sseBuffer = "";
  const rawAccum = { value: "" };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        sseBuffer += decoder.decode(value, { stream: true });
        const parsed = parseSSEBuffer(sseBuffer);
        sseBuffer = parsed.remainder;
        if (handleSSEEvents(parsed.events, rawAccum, onTextChunk, onDone)) return;
      }

      if (done) break;
    }

    sseBuffer += decoder.decode(undefined, { stream: false });
    const parsed = parseSSEBuffer(sseBuffer);
    if (handleSSEEvents(parsed.events, rawAccum, onTextChunk, onDone)) return;

    throw new Error("스트림이 예기치 않게 종료되었습니다.");
  } finally {
    reader.releaseLock();
  }
}

/** 인기 질문 TOP N 조회. 실패 시 빈 배열(프론트에서 고정 예시로 폴백) */
export async function getPopularQuestions(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/popular-questions`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.questions ?? [];
  } catch {
    return [];
  }
}

/** TOP3 단계에서 답변 본문 없이 날짜 기준 날씨만 빠르게 조회. 실패 시 null(폴백) */
export async function getWeather(
  travelDate: string,
  travelEndDate?: string,
): Promise<WeatherInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/api/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ travelDate, travelEndDate }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { weather?: WeatherInfo | null };
    return data.weather ?? null;
  } catch {
    return null;
  }
}

/** 조건 패널(TOP3) 결과를 Gemini 호출 없이 그대로 저장(섬BTI 선호도·예상 질문 집계용). */
export async function saveTop3Recommendation(
  question: string,
  response: RecommendationResponse,
  persona: TripIntent & { islandBti?: string },
  sessionId?: string,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/top3/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, persona, response, sessionId }),
    });
  } catch {
    // 저장 실패해도 화면 흐름에는 영향 없음(기존 saveRecommendation과 동일한 폴백)
  }
}

/** 비슷한 조건(동행·분위기)으로 TOP3를 받은 다른 세션들이 이어서 물어본 질문. 실패 시 빈 배열 */
export async function getSuggestedQuestions(
  companion?: string,
  travelMood?: string,
): Promise<string[]> {
  try {
    const params = new URLSearchParams();
    if (companion) params.set("companion", companion);
    if (travelMood) params.set("travelMood", travelMood);

    const res = await fetch(`${API_BASE}/api/suggested-questions?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { questions?: string[] };
    return data.questions ?? [];
  } catch {
    return [];
  }
}
