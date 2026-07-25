import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";
import { ISLAND_BTI_QUESTIONS, ISLAND_BTI_QUESTION_COUNT } from "@/data/island-bti/questions";
import { calculateIslandBtiResult } from "@/lib/island-bti";

export function IslandBtiTest() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const currentQuestion = ISLAND_BTI_QUESTIONS[currentQuestionIndex];
  const selectedOptionIndex = answers[currentQuestion.id] ?? null;
  const progress = ((currentQuestionIndex + 1) / ISLAND_BTI_QUESTION_COUNT) * 100;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === ISLAND_BTI_QUESTION_COUNT - 1;
  const canGoNext = selectedOptionIndex !== null;

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handlePrevious = () => {
    if (isFirstQuestion) return;
    setCurrentQuestionIndex((index) => index - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (isLastQuestion) {
      try {
        const resultData = calculateIslandBtiResult(answers, ISLAND_BTI_QUESTIONS);
        navigate("/island-bti/result", { state: resultData });
      } catch (error) {
        console.error("Island BTI result calculation failed:", error);
      }
      return;
    }
    setCurrentQuestionIndex((index) => index + 1);
  };

  return (
    <main className="ibti-page">
      <div className={CONTAINER}>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI TEST</span>
          <h1 className="ibti-head__title">섬BTI 검사</h1>
          <p className="ibti-head__sub">가장 가까운 선택지 하나를 골라 주세요.</p>
        </header>

        <section className="ibti-card" aria-labelledby="ibti-question-title">
          <div className="ibti-progress" aria-label="검사 진행률">
            <div className="ibti-progress__head">
              <span>
                문항 {currentQuestionIndex + 1} / {ISLAND_BTI_QUESTION_COUNT}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div
              className="ibti-progress__track"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="ibti-progress__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <h2 id="ibti-question-title" className="ibti-question">
            {currentQuestion.question}
          </h2>

          <div className="ibti-options" role="listbox" aria-label="답변 선택">
            {currentQuestion.options.map((option, optionIndex) => {
              const selected = selectedOptionIndex === optionIndex;
              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`ibti-option${selected ? " is-selected" : ""}`}
                  onClick={() => handleSelectOption(optionIndex)}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          <div className="ibti-nav">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
            >
              이전
            </button>
            <button
              type="button"
              className="btn btn-navy"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              {isLastQuestion ? "결과 보기" : "다음"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
