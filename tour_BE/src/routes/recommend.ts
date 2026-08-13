import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { askGemini, askGeminiStream } from "../services/gemini";

dotenv.config();

const router = Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SPORTS = [
  { sportId: "kayak", name: "카약", islands: ["무의도"] },
  { sportId: "surf", name: "서핑", islands: ["무의도"] },
  { sportId: "walk", name: "해안 산책", islands: ["영흥도"] },
  { sportId: "sunset", name: "일몰 감상", islands: ["영흥도"] },
  { sportId: "mud", name: "갯벌체험", islands: ["강화도", "영흥도"] },
  { sportId: "forest", name: "산림욕", islands: ["덕적도"] },
  { sportId: "spa", name: "온천·스파", islands: ["석모도"] },
  { sportId: "camp", name: "캠핑", islands: ["자월도"] },
  { sportId: "star", name: "은하수 체험", islands: ["자월도"] },
  { sportId: "zip", name: "짚라인", islands: ["무의도"] },
  { sportId: "luge", name: "루지", islands: ["강화도"] },
  { sportId: "monorail", name: "모노레일", islands: ["강화도"] },
  { sportId: "trekking", name: "트레킹", islands: ["백령도"] },
];

function buildRecommendPrompt(question: string): string {
  return `
당신은 인천 섬 레저 추천 도우미입니다.
아래 종목 목록에서만 추천하세요. 목록에 없는 종목·섬은 절대 만들지 마세요.
반드시 목록에 있는 sportId와 islandName(islands 중 하나)을 그대로 사용하세요.

종목 목록:
${JSON.stringify(SPORTS, null, 2)}

사용자 질문: "${question}"

먼저 사용자 질문이 "인천 섬 레저 활동·코스 추천"과 관련 있는지 판단하세요.
날씨, 일반 상식, 예약 취소, 길 안내, 정치 등 레저 추천과 무관한 질문이면
아래 형식으로 정중히 안내만 하세요:
{
  "outOfScope": true,
  "text": "저는 인천 섬 레저 활동 추천을 도와드려요.\\n찾으시는 활동이나 코스를 알려주시면 추천해 드릴게요.",
  "recommendations": [],
  "course": null,
  "tips": [],
  "followups": ["가족 당일치기 코스 추천", "커플끼리 즐기는 곳 추천", "힐링 여행 추천"]
}

레저 추천과 관련 있으면 아래 형식으로 답하세요.
어느 경우든 마크다운(\`\`\`) 없이 순수 JSON만 출력하세요:
{
  "outOfScope": false,
  "text": "사용자에게 건네는 대화체 추천 설명. 각 문장이 끝나면 줄바꿈 문자(\\n)로 구분하세요.",
  "recommendations": [
    { "sportId": "목록의 sportId", "islandName": "그 종목의 islands 중 하나" }
  ],
  "course": {
    "title": "코스 제목",
    "steps": [
      { "time": "10:00", "activity": "섬 · 종목명", "desc": "한 줄 설명" }
    ]
  },
  "tips": ["팁 1~3개"],
  "followups": ["후속 질문 칩 2~3개"]
}
`.trim();
}

function parseGeminiResponse(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      text: raw,
      recommendations: [],
      course: undefined,
      tips: [],
      followups: [],
    };
  }
}

function saveRecommendation(question: string, response: unknown) {
  prisma.recommendation
    .create({
      data: {
        question,
        response: response as object,
      },
    })
    .catch((err) => {
      console.error("[saveRecommendation] 저장 실패:", err);
      if (err instanceof Error) {
        console.error("[saveRecommendation] 에러 메시지:", err.message);
        console.error("[saveRecommendation] 에러 스택:", err.stack);
      }
    });
}

function writeSSE(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function streamErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "추천 생성 중 오류가 발생했습니다.";
}

router.post("/recommend/stream", async (req, res) => {
  console.log("[stream] 라우트 진입");

  const { question } = req.body;

  if (!question || typeof question !== "string") {
    console.log("[stream] question 검증 실패:", req.body);
    return res.status(400).json({ error: "question이 필요합니다." });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  let fullText = "";
  let chunkCount = 0;

  try {
    console.log("[stream] 요청 받음, question:", question);
    const prompt = buildRecommendPrompt(question);

    console.log("[stream] Gemini 스트림 호출 시작");
    try {
      for await (const chunk of askGeminiStream(prompt)) {
        chunkCount++;
        if (chunkCount <= 5 || chunkCount % 10 === 0) {
          console.log("[stream] 청크 수신", chunkCount);
        }
        fullText += chunk;
        writeSSE(res, "chunk", { text: chunk });
      }
    } catch (streamErr) {
      console.error("[stream] Gemini 스트림 실패, 논스트리밍 폴백 시도:", streamErr);
      if (streamErr instanceof Error) {
        console.error("[stream] 스트림 실패 메시지:", streamErr.message);
        console.error("[stream] 스트림 실패 스택:", streamErr.stack);
      }

      const raw = await askGemini(prompt);
      fullText = raw;
      chunkCount = 1;
      console.log("[stream] 논스트리밍 폴백 성공, 전체 길이:", fullText.length);
      writeSSE(res, "chunk", { text: raw });
    }

    if (chunkCount > 5) {
      console.log("[stream] 청크 총 개수:", chunkCount);
    }

    console.log("[stream] 스트림 종료, 전체 길이:", fullText.length);
    console.log("[stream] JSON 파싱 시도");
    const parsed = parseGeminiResponse(fullText);
    console.log("[stream] 파싱 성공");

    writeSSE(res, "done", parsed);
    res.end();

    console.log("[stream] DB 저장 호출");
    saveRecommendation(question, parsed);
  } catch (err) {
    console.error("[stream] 에러 발생:", err);
    if (err instanceof Error) {
      console.error("[stream] 에러 메시지:", err.message);
      console.error("[stream] 에러 스택:", err.stack);
    }
    writeSSE(res, "error", { error: streamErrorMessage(err) });
    res.end();
  }
});

router.post("/recommend", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "question이 필요합니다." });
    }

    const prompt = buildRecommendPrompt(question);
    const raw = await askGemini(prompt);
    const parsed = parseGeminiResponse(raw);

    res.json(parsed);

    saveRecommendation(question, parsed);
  } catch (err) {
    console.error("추천 처리 오류:", err);
    res.status(500).json({ error: "추천 생성 중 오류가 발생했습니다." });
  }
});

// 인기 질문 TOP 5 반환
router.get("/popular-questions", async (req, res) => {
  try {
    const grouped = await prisma.recommendation.groupBy({
      by: ["question"],
      _count: { question: true },
      orderBy: { _count: { question: "desc" } },
      take: 4,
    });

    const questions = grouped.map((g) => g.question);
    res.json({ questions });
  } catch (err) {
    console.error("인기 질문 조회 실패:", err);
    res.status(500).json({ error: "인기 질문을 불러오지 못했어요." });
  }
});

export default router;
