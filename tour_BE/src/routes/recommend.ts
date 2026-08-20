import { Router, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import { askGemini, askGeminiStream } from "../services/gemini";

dotenv.config();

// mariadb 드라이버의 문자열 생성자는 "mariadb://" 스킴을 요구해 관례적인
// "mysql://" DATABASE_URL과 맞지 않는다. URL을 직접 파싱해 객체 형태로 넘긴다.
function parseMysqlConnectionOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };
}

const router = Router();
const adapter = new PrismaMariaDb(parseMysqlConnectionOptions(process.env.DATABASE_URL!));
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

interface HistoryItem {
  role: "user" | "assistant";
  text: string;
  /** 해당 assistant 턴에서 실제로 추천한 sportId 목록 (중복 추천 방지용) */
  sportIds?: string[];
}

interface WeatherInfo {
  date: string;
  summary: string;
  recommendation: string;
}

interface PersonaInput {
  travelDate?: string;
  travelEndDate?: string;
  duration?: number;
  companion?: string;
  travelMood?: string;
  activities?: string[];
  /** 사용자의 섬BTI 결과 코드 (섬BTI별 섬 선호도 집계용) */
  islandBti?: string;
  /** TOP3 단계에서 이미 조회한 날씨 — 있으면 재검색하지 않고 그대로 재사용 */
  weather?: WeatherInfo;
}

function buildHistorySection(history?: HistoryItem[]): string {
  if (!history || history.length === 0) {
    return "";
  }

  const lines = history
    .map((item) => {
      const speaker = item.role === "user" ? "사용자" : "AI";
      return `${speaker}: ${item.text}`;
    })
    .join("\n");

  return `

[이전 대화]
${lines}

"다른 거", "그거 말고", "다시 추천해줘" 같은 후속 표현이 나오면 위 이전 대화의 맥락(무엇을 추천했었는지)을 참고해서 의도를 파악하세요.`;
}

function extractRecommendedSportIds(history?: HistoryItem[]): string[] {
  if (!history) return [];

  const ids = new Set<string>();
  for (const item of history) {
    if (item.role !== "assistant" || !Array.isArray(item.sportIds)) continue;
    for (const id of item.sportIds) {
      if (typeof id === "string" && id) ids.add(id);
    }
  }
  return [...ids];
}

function buildExcludedSportsSection(excludedSportIds: string[]): string {
  if (excludedSportIds.length === 0) {
    return "";
  }

  return `

이미 추천한 종목 (재추천 금지): ${JSON.stringify(excludedSportIds)}
위 sportId들은 이전 대화에서 이미 추천했습니다. 절대 다시 추천하지 말고, 목록에 있는 다른 sportId로 새롭게 추천하세요.
단, 사용자가 위 종목에 대해 더 자세히 묻거나("그거 자세히 알려줘" 등) 명시적으로 같은 것을 다시 원하는 경우에만 예외적으로 다시 언급하세요.`;
}

/** persona.weather가 이미 있으면 재검색이 필요 없으므로, travelDate가 있고 weather가 아직 없을 때만 검색이 필요하다. */
function needsWeatherSearch(persona?: PersonaInput): boolean {
  return !!(persona?.travelDate && !persona?.weather);
}

function buildWeatherDateLabel(travelDate: string, travelEndDate?: string): string {
  return travelEndDate && travelEndDate !== travelDate
    ? `${travelDate} ~ ${travelEndDate}`
    : travelDate;
}

/** TOP3 단계 등에서 답변 본문 없이 날씨만 빠르게 조회할 때 쓰는 최소 프롬프트 */
function buildWeatherOnlyPrompt(travelDate: string, travelEndDate?: string): string {
  const dateLabel = buildWeatherDateLabel(travelDate, travelEndDate);

  return `
검색 도구를 사용해 "${dateLabel}" 기준 인천 섬 지역(강화도·영흥도·무의도·덕적도·자월도·석모도·백령도 등)의 실제 날씨 예보를 검색하세요.
검색에 성공하면 마크다운(\`\`\`) 없이 순수 JSON만 출력하세요:
{
  "date": "검색한 날짜(${dateLabel})",
  "summary": "간단한 날씨 요약 (예: '맑음, 최고 27도', '오후부터 비, 강수확률 70%' 등)",
  "recommendation": "날씨를 반영한 짧은 활동 추천도 한 문장 (강수확률이 높으면 실내·체험 활동 위주로, 맑으면 야외·수상 레저 위주로 추천)"
}
검색에 실패했거나 신뢰할 만한 정보를 찾지 못하면 정확히 이 JSON만 출력하세요: { "unavailable": true }
`.trim();
}

function buildWeatherSection(persona?: PersonaInput): string {
  if (persona?.weather) {
    return `

[날씨 정보 - 이미 조회됨]
아래 날씨 정보를 신뢰하고 그대로 사용하세요(다시 검색하지 마세요):
${JSON.stringify(persona.weather)}
이 정보를 recommendations·course·tips 선택에 반영하고, 응답 JSON의 "weather" 필드에 그대로(또는 문장만 자연스럽게 다듬어) 포함하세요.`;
  }

  if (!persona?.travelDate) {
    return "";
  }

  const dateLabel = buildWeatherDateLabel(persona.travelDate, persona.travelEndDate);

  return `

[날씨 검색 지시]
검색 도구를 사용해 "${dateLabel}" 기준 인천 섬 지역(강화도·영흥도·무의도·덕적도·자월도·석모도·백령도 등)의 실제 날씨 예보를 검색하세요.
검색에 성공하면 응답 JSON에 "weather" 필드를 아래 형식으로 포함하세요:
{
  "date": "검색한 날짜(${dateLabel})",
  "summary": "간단한 날씨 요약 (예: '맑음, 최고 27도', '오후부터 비, 강수확률 70%' 등)",
  "recommendation": "날씨를 반영한 활동 추천도 설명. 강수확률이 높으면 실내·체험 활동 추천도를 높이고 카약·서핑 같은 수상 레저 추천도는 낮추는 식으로, 맑으면 반대로 구체적으로 안내하세요."
}
이 날씨 정보를 recommendations·course·tips 선택에도 실제로 반영하세요(비 예보면 실내·체험 위주, 맑으면 수상 레저·야외 활동 위주).
날씨 검색에 실패했거나 신뢰할 만한 정보를 찾지 못하면 "weather" 필드를 아예 생략하세요(추측으로 채우지 마세요).`;
}

function buildRecommendPrompt(
  question: string,
  history?: HistoryItem[],
  persona?: PersonaInput,
): string {
  const excludedSportIds = extractRecommendedSportIds(history);

  return `
당신은 인천 섬 여행 도우미입니다. 레저 활동 추천뿐 아니라 각 섬의 특산물·향토음식·교통·숙소 등 인천 섬 여행과 관련된 질문에도 아는 대로 성실하게 답변하세요.
다만 실제로 존재하는지 확인할 수 없는 특정 음식점 이름·주소·전화번호 등은 절대 지어내지 마세요. 그런 질문에는 지역 특산물·음식 종류처럼 일반적으로 알려진 정보 위주로 안내하고, 구체적인 상호는 직접 검색해보시라고 안내하세요.

레저 활동을 추천해야 하는 질문(활동·코스 추천 등)이면 "recommendations"·"course"는 아래 종목 목록에서만 채우세요. 목록에 없는 종목·섬은 절대 만들지 마세요.
반드시 목록에 있는 sportId와 islandName(islands 중 하나)을 그대로 사용하세요.

종목 목록:
${JSON.stringify(SPORTS, null, 2)}
${buildHistorySection(history)}
${buildExcludedSportsSection(excludedSportIds)}
${buildWeatherSection(persona)}

조건 기반 필터: 질문에 아래와 같은 조건이 있으면 반드시 반영해서 추천하세요.
- 인원수·동행자(예: "가족 4명", "아이랑", "커플", "친구들과") → 동행자에 적합한 활동 위주로 선택 (아이 동반이면 아이도 참여 가능한 활동 위주)
- 예산(예: "2만원 이하", "저렴하게") → 예산에 맞는/저렴한 활동 위주로 선택
- 소요시간(예: "반나절", "당일치기", "1박2일") → 소요시간에 맞는 짧거나 긴 코스로 구성
- 계절(예: "여름", "겨울") → 해당 계절에 어울리는 활동 위주로 선택
- 난이도(예: "초보", "쉬운 거") → 난이도에 맞는 활동 위주로 선택
해당 조건이 질문에 없으면 이 규칙은 무시하세요.

사용자 질문: "${question}"

레저 활동 추천과 무관한 질문(맛집·특산물, 일반 상식, 날씨만 단순히 묻는 질문, 예약 취소, 길 안내, 정치 등)이어도 회피하지 말고
"text" 필드에 아는 대로 성실하게 답변하세요. 이 경우 "recommendations"는 빈 배열, "course"는 null로 두세요.

마크다운(\`\`\`) 없이 순수 JSON만 출력하세요:
{
  "text": "사용자에게 건네는 대화체 답변. 각 문장이 끝나면 줄바꿈 문자(\\n)로 구분하세요.",
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
  "followups": ["후속 질문 칩 2~3개"],
  "weather": { "date": "...", "summary": "...", "recommendation": "..." }
}
레저 활동 추천과 무관한 질문이면 recommendations는 [], course는 null, tips·followups도 관련 없으면 빈 배열로 두세요.
중요: "text"·"tips"·"followups"는 서로 모순되면 안 됩니다. text에서 특정 정보를 모른다고 하거나 제공할 수 없다고 답했다면, tips나 followups에도 그 정보(예: 구체적인 음식점 추천)를 채워 넣지 마세요.
"weather" 필드는 [날씨 검색 지시]가 있을 때만, 검색에 성공한 경우에만 포함하세요. 그 외에는 필드 자체를 생략하세요.
`.trim();
}

function parseGeminiResponse(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // 검색 그라운딩을 켜면 모델이 JSON 앞뒤에 안내 문구를 덧붙이는 경우가 있어,
    // 가장 바깥 중괄호 구간만 다시 잘라서 재시도한다.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fall through to raw-text fallback below
      }
    }
    return {
      text: raw,
      recommendations: [],
      course: undefined,
      tips: [],
      followups: [],
    };
  }
}

function saveRecommendation(
  question: string,
  response: unknown,
  persona?: PersonaInput,
  sessionId?: string,
) {
  // Json? 필드는 일반 null이 아니라 Prisma.JsonNull 센티널로 SQL NULL을 표현해야 한다.
  const personaValue = persona ? (persona as Prisma.InputJsonValue) : Prisma.JsonNull;
  const islandBti = typeof persona?.islandBti === "string" ? persona.islandBti : null;

  prisma.recommendation
    .create({
      data: {
        question,
        persona: personaValue,
        response: response as object,
        islandBti,
        sessionId: typeof sessionId === "string" ? sessionId : null,
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

  const { question, history, persona, sessionId } = req.body;

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
    const prompt = buildRecommendPrompt(question, history, persona);
    const grounded = needsWeatherSearch(persona);

    console.log("[stream] Gemini 스트림 호출 시작");
    try {
      for await (const chunk of askGeminiStream(prompt, { grounded })) {
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

      const raw = await askGemini(prompt, { grounded });
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
    saveRecommendation(question, parsed, persona, sessionId);
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
    const { question, history, persona, sessionId } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "question이 필요합니다." });
    }

    const prompt = buildRecommendPrompt(question, history, persona);
    const raw = await askGemini(prompt, { grounded: needsWeatherSearch(persona) });
    const parsed = parseGeminiResponse(raw);

    res.json(parsed);

    saveRecommendation(question, parsed, persona, sessionId);
  } catch (err) {
    console.error("추천 처리 오류:", err);
    res.status(500).json({ error: "추천 생성 중 오류가 발생했습니다." });
  }
});

// 조건 패널(TOP3) 결과 저장. Gemini를 호출하지 않는다 — FE 로컬 추천 엔진 결과를
// 그대로 받아 저장만 한다(섬BTI 선호도 집계·예상 질문 집계용 데이터).
router.post("/top3/save", async (req, res) => {
  const { question, persona, response, sessionId } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question이 필요합니다." });
  }
  if (!response || typeof response !== "object") {
    return res.status(400).json({ error: "response가 필요합니다." });
  }

  try {
    saveRecommendation(question, response, persona, sessionId);
    res.json({ ok: true });
  } catch (err) {
    console.error("TOP3 결과 저장 실패:", err);
    res.status(500).json({ error: "저장에 실패했어요." });
  }
});

// 비슷한 조건(동행·분위기)으로 TOP3를 받은 다른 세션들이 그 직후 무엇을 물었는지
// 집계해서 예상 질문으로 제안한다. companion·travelMood 둘 다 없으면 빈 배열.
router.get("/suggested-questions", async (req, res) => {
  try {
    const companion = typeof req.query.companion === "string" ? req.query.companion : undefined;
    const travelMood = typeof req.query.travelMood === "string" ? req.query.travelMood : undefined;

    if (!companion && !travelMood) {
      return res.json({ questions: [] });
    }

    const personaFilters: Prisma.RecommendationWhereInput[] = [{ persona: { not: Prisma.JsonNull } }];
    if (companion) personaFilters.push({ persona: { path: "$.companion", equals: companion } });
    if (travelMood) personaFilters.push({ persona: { path: "$.travelMood", equals: travelMood } });

    const conditionedRows = await prisma.recommendation.findMany({
      where: { AND: personaFilters },
      select: { sessionId: true },
    });

    const sessionIds = [
      ...new Set(conditionedRows.map((r) => r.sessionId).filter((id): id is string => !!id)),
    ];
    if (sessionIds.length === 0) {
      return res.json({ questions: [] });
    }

    const sessionRows = await prisma.recommendation.findMany({
      where: { sessionId: { in: sessionIds } },
      orderBy: [{ sessionId: "asc" }, { createdAt: "asc" }],
      select: { sessionId: true, question: true, persona: true },
    });

    // 세션별로 시간순으로 훑으며, "조건 매칭 턴 바로 다음에 온 일반 질문"만 모은다.
    const counts = new Map<string, number>();
    let prevSessionId: string | null = null;
    let prevWasConditionMatch = false;

    for (const row of sessionRows) {
      if (row.sessionId !== prevSessionId) {
        prevWasConditionMatch = false;
        prevSessionId = row.sessionId;
      }

      const personaObj = row.persona as { companion?: string; travelMood?: string } | null;
      const isPlainQuestion = !personaObj;

      if (isPlainQuestion && prevWasConditionMatch) {
        counts.set(row.question, (counts.get(row.question) ?? 0) + 1);
      }

      const isConditionMatch =
        !!personaObj &&
        (!companion || personaObj.companion === companion) &&
        (!travelMood || personaObj.travelMood === travelMood);
      prevWasConditionMatch = isConditionMatch;
    }

    const questions = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([question]) => question);

    res.json({ questions });
  } catch (err) {
    console.error("예상 질문 조회 실패:", err);
    res.status(500).json({ error: "예상 질문을 불러오지 못했어요." });
  }
});

// TOP3 구조화 추천 단계 등에서 답변 본문 없이 날씨만 빠르게 조회.
// 실패해도 500이 아니라 { weather: null }로 응답해 FE가 조용히 생략할 수 있게 한다.
router.post("/weather", async (req, res) => {
  const { travelDate, travelEndDate } = req.body;

  if (!travelDate || typeof travelDate !== "string") {
    return res.status(400).json({ error: "travelDate가 필요합니다." });
  }

  try {
    const prompt = buildWeatherOnlyPrompt(
      travelDate,
      typeof travelEndDate === "string" ? travelEndDate : undefined,
    );
    const raw = await askGemini(prompt, { grounded: true });
    const parsed = parseGeminiResponse(raw);

    if (!parsed || parsed.unavailable || typeof parsed.summary !== "string") {
      return res.json({ weather: null });
    }

    res.json({
      weather: {
        date: typeof parsed.date === "string" ? parsed.date : travelDate,
        summary: parsed.summary,
        recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "",
      },
    });
  } catch (err) {
    console.error("날씨 조회 실패:", err);
    res.json({ weather: null });
  }
});

// 인기 질문 TOP 5 반환
router.get("/popular-questions", async (req, res) => {
  try {
    // persona가 붙은 질문은 조건 패널이 자동 생성한 문장("당일치기 · 친구 · ... 조건으로
    // 섬 추천해줘")이라 사용자가 직접 입력한 질문이 아니다. 예시 칩으로 노출되면 클릭 시
    // 조건 문구가 그대로 채팅에 뜨고 TOP3도 안 나오는 것처럼 보이므로 랭킹에서 제외한다.
    const grouped = await prisma.recommendation.groupBy({
      by: ["question"],
      where: { persona: { equals: Prisma.JsonNull } },
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

// 섬BTI 유형별 섬 선호도 집계.
// query ?code=AWCP 로 특정 유형만, 생략하면 전체 유형을 반환한다.
router.get("/bti-preferences", async (req, res) => {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;

    const rows = await prisma.recommendation.findMany({
      where: { islandBti: code ? code : { not: null } },
      select: { islandBti: true, response: true },
    });

    // islandBti별로 response.recommendations[].islandName 등장 횟수를 집계한다.
    const counters = new Map<string, Map<string, number>>();
    for (const row of rows) {
      if (!row.islandBti) continue;
      const recommendations = (row.response as { recommendations?: { islandName?: string }[] } | null)
        ?.recommendations;
      if (!Array.isArray(recommendations)) continue;

      let islandCounts = counters.get(row.islandBti);
      if (!islandCounts) {
        islandCounts = new Map();
        counters.set(row.islandBti, islandCounts);
      }

      for (const item of recommendations) {
        if (!item?.islandName) continue;
        islandCounts.set(item.islandName, (islandCounts.get(item.islandName) ?? 0) + 1);
      }
    }

    const preferences = [...counters.entries()].map(([islandBti, islandCounts]) => ({
      islandBti,
      sampleCount: rows.filter((r) => r.islandBti === islandBti).length,
      topIslands: [...islandCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([islandName, count]) => ({ islandName, count })),
    }));

    res.json({ preferences });
  } catch (err) {
    console.error("섬BTI 선호도 조회 실패:", err);
    res.status(500).json({ error: "섬BTI 선호도를 불러오지 못했어요." });
  }
});

export default router;
