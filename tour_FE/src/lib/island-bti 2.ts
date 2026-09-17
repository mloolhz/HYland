import { ISLAND_BTI_AXIS_VALUES } from "@/types/island-bti";
import type { IslandBtiAxisScores, IslandBtiAxisValue, IslandBtiDimension, IslandBtiQuestion } from "@/types/island-bti";

/** @alias IslandBtiAxisScores */
export type IslandBtiScoreMap = IslandBtiAxisScores;

/** questionId → 선택한 option index (0 | 1) */
export type IslandBtiAnswers = Record<number, number>;

export type IslandBtiCalculationResult = {
  result: string;
  scores: IslandBtiScoreMap;
};

const ALL_AXIS_VALUES: IslandBtiAxisValue[] = ["A", "B", "W", "L", "C", "I", "P", "F"];

const DIMENSION_ORDER: IslandBtiDimension[] = ["AB", "WL", "CI", "PF"];

function createEmptyScores(): IslandBtiScoreMap {
  return { A: 0, B: 0, W: 0, L: 0, C: 0, I: 0, P: 0, F: 0 };
}

function assertAxisSum(
  dimension: IslandBtiDimension,
  scores: IslandBtiScoreMap,
  expectedTotal: number,
): void {
  const [left, right] = ISLAND_BTI_AXIS_VALUES[dimension];
  const sum = scores[left] + scores[right];
  if (sum !== expectedTotal) {
    throw new Error(
      `${dimension} axis score sum must be ${expectedTotal}, got ${sum} (${left}=${scores[left]}, ${right}=${scores[right]})`,
    );
  }
}

function assertNoTie(dimension: IslandBtiDimension, scores: IslandBtiScoreMap): IslandBtiAxisValue {
  const [left, right] = ISLAND_BTI_AXIS_VALUES[dimension];
  const leftScore = scores[left];
  const rightScore = scores[right];

  if (leftScore === rightScore) {
    console.error(`${dimension} axis tie detected`, { [left]: leftScore, [right]: rightScore });
    throw new Error(`${dimension} axis tie: ${left}=${leftScore}, ${right}=${rightScore}`);
  }

  return leftScore > rightScore ? left : right;
}

export function calculateIslandBtiResult(
  answers: IslandBtiAnswers,
  questions: IslandBtiQuestion[],
): IslandBtiCalculationResult {
  const questionCount = questions.length;
  const answerCount = Object.keys(answers).length;

  if (answerCount !== questionCount) {
    throw new Error(`Expected ${questionCount} answers, got ${answerCount}`);
  }

  if (questionCount < 1) {
    throw new Error("Question list is empty");
  }

  const scores = createEmptyScores();

  for (const question of questions) {
    const optionIndex = answers[question.id];

    if (optionIndex === undefined) {
      throw new Error(`Missing answer for question id ${question.id}`);
    }

    if (optionIndex !== 0 && optionIndex !== 1) {
      throw new Error(`Invalid option index ${optionIndex} for question id ${question.id}`);
    }

    const selectedOption = question.options[optionIndex];
    if (!selectedOption) {
      throw new Error(`Option index ${optionIndex} out of range for question id ${question.id}`);
    }

    const [allowedLeft, allowedRight] = ISLAND_BTI_AXIS_VALUES[question.dimension];
    if (selectedOption.value !== allowedLeft && selectedOption.value !== allowedRight) {
      throw new Error(
        `Selected value "${selectedOption.value}" does not match dimension ${question.dimension} on question id ${question.id}`,
      );
    }

    scores[selectedOption.value] += 1;
  }

  for (const dimension of DIMENSION_ORDER) {
    assertAxisSum(dimension, scores, questionCount / DIMENSION_ORDER.length);
  }

  const result = DIMENSION_ORDER.map((dimension) => assertNoTie(dimension, scores)).join("");

  if (result.length !== DIMENSION_ORDER.length) {
    throw new Error(`Result must be ${DIMENSION_ORDER.length} characters, got "${result}"`);
  }

  for (const value of ALL_AXIS_VALUES) {
    if (!Number.isFinite(scores[value])) {
      throw new Error(`Invalid score for value ${value}`);
    }
  }

  return { result, scores };
}

/** Fisher–Yates — 검사 시작 시 문항 순서 랜덤 */
export function shuffleIslandBtiQuestions(questions: IslandBtiQuestion[]): IslandBtiQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isIslandBtiCalculationResult(value: unknown): value is IslandBtiCalculationResult {
  if (!value || typeof value !== "object") return false;

  const candidate = value as IslandBtiCalculationResult;
  if (typeof candidate.result !== "string" || candidate.result.length !== 4) return false;
  if (!candidate.scores || typeof candidate.scores !== "object") return false;

  return ALL_AXIS_VALUES.every((key) => typeof candidate.scores[key] === "number");
}
