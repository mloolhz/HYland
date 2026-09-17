/**
 * AI 추천 입구 — 질문이 **인천 섬** 여행·레저 서비스 범위인지 LLM이 판단한다.
 * 0~1 점수 + 임의 임계값 대신 inScope + 판단 이유를 받는다.
 */
import { askGemini } from "./gemini";

/** 유사도 비교 기준 — 일반 '관광 코스'가 아니라 **인천 섬** 전용 서비스 */
export const SCOPE_ANCHOR_TOPIC =
  "인천광역시 관할 섬(강화·영흥·무의·덕적·자월·석모·백령 등) 관광·레저 코스 추천 및 섬 여행 계획(일정, 동행, 날씨, 배편·교통, 숙소, 섬별 활동·맛집·특산물)";

export const SCOPE_OUT_OF_REGION_HINT =
  "타 지역(제주·부산·서울 등) 관광이나 인천 내륙만 다루는 질문(송도·차이나타운·월미 등 섬 코스가 아닌 내륙 관광)은 서비스 범위 밖";

export type ScopeHistoryItem = {
  role: "user" | "assistant";
  text: string;
};

export type ScopeEvaluation = {
  summary: string;
  inScope: boolean;
  /** inScope 여부를 내린 근거 (한국어, 1~2문장) */
  reason: string;
};

type ScopeCheckPromptHistory = ScopeHistoryItem[];

function buildScopeCheckPrompt(question: string, history?: ScopeCheckPromptHistory): string {
  const historyBlock =
    history && history.length > 0
      ? `\n[직전 대화 맥락]\n${history
          .slice(-4)
          .map((h) => `${h.role === "user" ? "사용자" : "AI"}: ${h.text.slice(0, 400)}`)
          .join("\n")}\n`
      : "";

  return `
당신은 질문 분류기입니다. 아래 사용자 질문의 "전체적인 맥락"을 파악한 뒤,
이 서비스가 답변해도 되는지 "inScope" (true/false)로 판단하고, 그 "이유"를 짧게 적으세요.
숫자 점수는 내지 마세요.

[기준 주제 — inScope=true 가 담당하는 범위]
"${SCOPE_ANCHOR_TOPIC}"

[서비스 지역 경계]
- inScope=true: 위 섬들 여행·레저·코스, 섬 간 이동, 인천항/연안부두→섬 배편·교통, 직전 대화가 인천 섬 추천인 후속 질문
- inScope=false: ${SCOPE_OUT_OF_REGION_HINT}
- inScope=false: 프로그래밍·과제·번역 등 여행과 무관한 요청, 여행 포장이지만 실제 목적이 다른 작업
- "인천"만 있고 섬·배편·레저 없이 내륙 관광만 원하면 inScope=false (reason에 내륙/타지역 등 구체적 근거)

앞부분만 여행처럼 보여도 "실제 목적지·주제" 기준으로 판단하세요.
애매하지만 인천 "섬" 여행으로 해석 가능하면 inScope=true, 명확히 범위 밖이면 false.
${historyBlock}
[사용자 질문]
${question}

마크다운(\`\`\`) 없이 순수 JSON만 출력:
{
  "summary": "질문 의도 한 줄 요약 (한국어)",
  "inScope": true,
  "reason": "inScope 판단 근거 1~2문장 (한국어). 예: 제주도 코스만 요청해 타 지역 범위. / 영흥도 당일 레저 추천으로 섬 여행 범위."
}
`.trim();
}

function parseInScope(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function parseScopeEvaluation(raw: string): ScopeEvaluation | null {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const jsonStr = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    const parsed = JSON.parse(jsonStr) as {
      summary?: unknown;
      inScope?: unknown;
      reason?: unknown;
      /** 구버전 프롬프트 호환 — 점수만 오면 임계 0.55 대신 보수적으로 inScope 추론 */
      relevanceScore?: unknown;
    };

    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    let inScope = parseInScope(parsed.inScope);
    let reason = typeof parsed.reason === "string" ? parsed.reason.trim() : "";

    if (inScope === null && parsed.relevanceScore !== undefined) {
      let score = parsed.relevanceScore;
      if (typeof score === "string") score = Number(score);
      if (typeof score === "number" && Number.isFinite(score)) {
        inScope = score >= 0.55;
        reason = reason || `(레거시 relevanceScore ${score} 기준 판정)`;
      }
    }

    if (inScope === null) return null;

    return {
      summary: summary || "(요약 없음)",
      inScope,
      reason: reason || (inScope ? "서비스 범위로 판단" : "서비스 범위 밖으로 판단"),
    };
  } catch {
    return null;
  }
}

/** 분류 실패 시 null — 호출 측에서 fail-open(본 추천 진행) 처리 */
export async function evaluateQuestionScope(
  question: string,
  history?: ScopeHistoryItem[],
): Promise<ScopeEvaluation | null> {
  try {
    const raw = await askGemini(buildScopeCheckPrompt(question, history));
    return parseScopeEvaluation(raw);
  } catch (err) {
    console.error("[evaluateQuestionScope] 범위 판별 실패:", err);
    return null;
  }
}

/** 메인 Gemini와 동일한 JSON 형태 — FE parse 그대로 사용 */
export function buildOutOfScopeRecommendResponse() {
  return {
    text:
      "저는 인천 섬 레저·여행 코스 추천을 도와드리는 AI예요.\n" +
      "다른 지역이나 인천 내륙만 다루는 질문이나 그 밖의 주제는 여기서 답하기 어려워요. 양해 부탁드려요.\n" +
      "강화·영흥·무의도 등, 인천 섬에 대한 일정·레저·배편·날씨가 궁금하시면 편하게 물어봐 주세요.",
    recommendations: [] as { sportId: string; islandName: string }[],
    course: null,
    tips: [] as string[],
    followups: [
      "가족 당일치기로 갈 만한 섬 추천",
      "비 오는 날 실내에서 할 수 있는 레저",
      "섬BTI에 맞는 인기 섬 알려줘",
    ],
  };
}
