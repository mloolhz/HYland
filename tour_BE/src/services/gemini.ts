import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY가 .env에 없습니다.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

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