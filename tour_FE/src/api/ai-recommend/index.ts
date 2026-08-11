import type { AiResponse, RecItem } from "@/types/ai-recommend";
import { buildRec } from "./mockData";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  text: string;
};

const API_BASE = "http://localhost:4000";

/** 백엔드 AI 추천 호출 → 실제 종목 데이터로 채워서 반환 */
export async function getAiRecommendation(
  userMessage: string,
  history?: ChatHistoryItem[],
): Promise<AiResponse> {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userMessage, history }),
  });

  if (!res.ok) {
    throw new Error("추천 요청 실패");
  }

  const data = await res.json();

  // 백엔드가 준 sportId·islandName을 실제 종목 데이터(regionColor·예약링크)로 변환
  const recommendations: RecItem[] = (data.recommendations ?? [])
    .map((r: { sportId: string; islandName: string }) =>
      buildRec(r.sportId, r.islandName),
    )
    .filter((r: RecItem | null): r is RecItem => r !== null);

  return {
    text: data.text ?? "",
    recommendations,
    course: data.course,
    tips: data.tips,
    followups: data.followups,
  };
}