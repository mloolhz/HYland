import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { askGemini } from "../services/gemini";

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

router.post("/recommend", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "question이 필요합니다." });
    }

    const prompt = `
당신은 인천 섬 레저 추천 도우미입니다.
아래 종목 목록에서만 추천하세요. 목록에 없는 종목·섬은 절대 만들지 마세요.
반드시 목록에 있는 sportId와 islandName(islands 중 하나)을 그대로 사용하세요.

종목 목록:
${JSON.stringify(SPORTS, null, 2)}

사용자 질문: "${question}"

아래 JSON 형식으로만 답하세요. 마크다운(\`\`\`) 없이 순수 JSON만:
{
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

    const raw = await askGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return res.json({
        text: raw,
        recommendations: [],
        course: undefined,
        tips: [],
        followups: [],
      });
    }

    // DB에 질문 + AI 답변 저장
    await prisma.recommendation.create({
      data: {
        question,
        response: parsed,
      },
    });

    res.json(parsed);
  } catch (err) {
    console.error("추천 처리 오류:", err);
    res.status(500).json({ error: "추천 생성 중 오류가 발생했습니다." });
  }
});

export default router;