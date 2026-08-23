import { Router, type Request, type Response } from "express";
import { prisma } from "./prisma";
import { optionalAuth } from "./auth";

const router = Router();

// 차원별 축 글자 (FE data/island-bti/questions.ts 기준)
// AB: Active/Breezy · WL: Water/Land · CI: Crew/Independent · PF: Planned/Flow
const AXES: { dim: string; a: string; b: string }[] = [
  { dim: "AB", a: "A", b: "B" },
  { dim: "WL", a: "W", b: "L" },
  { dim: "CI", a: "C", b: "I" },
  { dim: "PF", a: "P", b: "F" },
];

// ── 문항 조회 (20문항) ──
router.get("/questions", async (_req: Request, res: Response) => {
  const questions = await prisma.islandBtiQuestion.findMany({ orderBy: { id: "asc" } });
  res.json(
    questions.map((q) => ({
      id: q.id,
      dimension: q.dimension,
      question: q.text,
      options: [
        { text: q.optionA, value: q.axisA },
        { text: q.optionB, value: q.axisB },
      ],
    })),
  );
});

// ── 결과 유형 전체 (16코드) ──
router.get("/results", async (_req: Request, res: Response) => {
  const results = await prisma.islandBtiResult.findMany({ orderBy: { code: "asc" } });
  res.json(results);
});

// ── 결과 유형 상세 ──
router.get("/results/:code", async (req: Request, res: Response) => {
  const result = await prisma.islandBtiResult.findUnique({
    where: { code: req.params.code.toUpperCase() },
  });
  if (!result) return res.status(404).json({ error: "해당 BTI 유형을 찾을 수 없어요" });
  res.json(result);
});

// ── 검사 제출 → 결과 계산 (+ 로그인 시 저장) ──
// body: { answers: [{ questionId: 1, value: "A" }, ...] }  (value = 선택한 축 글자)
router.post("/submit", optionalAuth, async (req: Request, res: Response) => {
  const { answers } = req.body ?? {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "answers 배열이 필요해요" });
  }

  // 축 글자별 카운트
  const count: Record<string, number> = {};
  for (const ans of answers) {
    const v = typeof ans === "string" ? ans : ans?.value;
    if (typeof v === "string") count[v] = (count[v] ?? 0) + 1;
  }

  // 차원별 승자 → 4글자 코드 + 점수
  let code = "";
  const scores: Record<string, { a: number; b: number; winner: string }> = {};
  for (const { dim, a, b } of AXES) {
    const av = count[a] ?? 0;
    const bv = count[b] ?? 0;
    const winner = av >= bv ? a : b; // 동점이면 a축
    code += winner;
    scores[dim] = { a: av, b: bv, winner };
  }

  const result = await prisma.islandBtiResult.findUnique({ where: { code } });
  if (!result) {
    return res.status(422).json({ error: `계산된 코드(${code})에 해당하는 유형이 없어요`, code });
  }

  // 로그인 상태면 결과 이력 저장
  const userId = (req as any).userId as string | undefined;
  let saved = false;
  if (userId) {
    await prisma.userIslandBtiResult.create({
      data: { userId, resultCode: code, scores },
    });
    // 프로필에도 최신 BTI 코드 반영 (선택)
    await prisma.userProfile.update({ where: { userId }, data: { bti: code } }).catch(() => {});
    saved = true;
  }

  res.json({ code, scores, result, saved });
});

// ── 내 BTI 검사 이력 (로그인 필요) ──
router.get("/my", optionalAuth, async (req: Request, res: Response) => {
  const userId = (req as any).userId as string | undefined;
  if (!userId) return res.status(401).json({ error: "로그인이 필요해요" });
  const history = await prisma.userIslandBtiResult.findMany({
    where: { userId },
    orderBy: { testedAt: "desc" },
    include: { result: true },
  });
  res.json(history);
});

export default router;
