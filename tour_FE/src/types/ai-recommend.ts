export type CourseStep = {
  time: string;
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

export type AiResponse = {
  text: string;
  recommendations: RecItem[];
  course?: { title: string; steps: CourseStep[] };
  tips?: string[];
  followups?: string[];
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
