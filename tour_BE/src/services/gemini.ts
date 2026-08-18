import { GoogleGenerativeAI, type Tool } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY가 .env에 없습니다.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Google Search grounding: 모델이 프롬프트 지시에 따라 실시간 웹(날씨 등)을 검색할 수 있게 한다.
// 설치된 @google/generative-ai(legacy) SDK의 타입은 구버전 `googleSearchRetrieval` 필드만
// 노출하지만, 2.x 세대 모델은 `google_search` 필드를 요구한다. 런타임에는 JSON이 그대로
// 전달되므로 타입만 우회한다.
const GOOGLE_SEARCH_TOOL = [{ googleSearch: {} }] as unknown as Tool[];

const model = genAI.getGenerativeModel({
  model: "gemini-flash-lite-latest",
  tools: GOOGLE_SEARCH_TOOL,
});

export async function askGemini(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function* askGeminiStream(
  prompt: string
): AsyncGenerator<string> {
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    try {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    } catch {
      // 일부 청크는 text가 없거나 finishReason만 포함할 수 있음
    }
  }
}