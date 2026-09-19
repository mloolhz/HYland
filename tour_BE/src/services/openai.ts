import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY가 .env에 없습니다.");
}

const client = new OpenAI({ apiKey });

// gpt-4o보다 입력·출력 단가가 낮은 gpt-4.1을 사용한다.
// (모델명·단가는 platform.openai.com/docs/models 에서 최종 확인)
const MODEL = "gpt-4.1";

/**
 * 기존 Gemini 서비스와 시그니처를 동일하게 유지해 호출부(recommend.ts 등)를 바꾸지 않는다.
 * options.grounded(실시간 웹검색)는 OpenAI 기본 Chat Completions엔 없으므로 무시한다.
 * 날씨 등 실시간 정보는 별도 API(weather.ts, 기상청)로 받아 프롬프트에 넣는다.
 */
export async function askGemini(
  prompt: string,
  _options?: { grounded?: boolean },
): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function* askGeminiStream(
  prompt: string,
  _options?: { grounded?: boolean },
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
