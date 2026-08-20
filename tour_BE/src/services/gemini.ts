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

// grounding(검색) quota는 일반 호출 quota와 별도로 훨씬 좁게 책정돼 있어서, 검색이
// 필요 없는 요청까지 매번 붙이면 금방 소진된다. 실제로 실시간 웹검색이 필요한 요청
// (날씨 검색)에만 groundedModel을 쓰고, 나머지는 plainModel을 쓴다.
const plainModel = genAI.getGenerativeModel({
  model: "gemini-flash-lite-latest",
});

const groundedModel = genAI.getGenerativeModel({
  model: "gemini-flash-lite-latest",
  tools: GOOGLE_SEARCH_TOOL,
});

export async function askGemini(
  prompt: string,
  options?: { grounded?: boolean }
): Promise<string> {
  const model = options?.grounded ? groundedModel : plainModel;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function* askGeminiStream(
  prompt: string,
  options?: { grounded?: boolean }
): AsyncGenerator<string> {
  const model = options?.grounded ? groundedModel : plainModel;
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