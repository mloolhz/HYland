export type CourseStep = {
  /** 하루 일정 전체를 잡는 코스에만 넣는다. 단순 종목·활동 나열이면 생략. */
  time?: string;
  activity: string;
  desc: string;
};

export type RecItemBooking = {
  label: string;
  url?: string;
  tel?: string;
  note?: string;
};

export type RecItem = {
  islandId: string;
  islandName: string;
  regionColor: string;
  category: string;
  categoryKey: string;
  sportId: string;
  name: string;
  reservationType?: "reservable" | "free" | "community" | "info" | "mixed";
  sources?: RecItemBooking[];
  /** @deprecated 첫 번째 출처 — sources 사용 권장 */
  booking?: RecItemBooking;
};

export type WeatherInfo = {
  date: string;
  summary: string;
  recommendation: string;
};

export type AiResponse = {
  text: string;
  recommendations: RecItem[];
  course?: { title: string; steps: CourseStep[] };
  tips?: string[];
  followups?: string[];
  weather?: WeatherInfo;
};

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; isStreaming: true; streamText: string }
  | { id: string; role: "assistant"; isStreaming?: false; response: AiResponse };

export function isStreamingAssistant(
  msg: ChatMessage,
): msg is Extract<ChatMessage, { role: "assistant"; isStreaming: true }> {
  return msg.role === "assistant" && msg.isStreaming === true;
}
