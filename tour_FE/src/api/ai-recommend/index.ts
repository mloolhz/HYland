import type { AiResponse } from "@/types/ai-recommend";
import { buildMockAiResponse } from "./mockData";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  text: string;
};

function delay<T>(data: T, ms = 900): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

/** 나중에 실제 백엔드 API로 교체될 함수 */
export async function getAiRecommendation(
  userMessage: string,
  history?: ChatHistoryItem[],
): Promise<AiResponse> {
  const response = buildMockAiResponse(userMessage, history);
  return delay(response);
}
