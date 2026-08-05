import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IslandBtiContainer } from "@/components/island-bti/IslandBtiContainer";
import { ISLAND_BTI_QUESTIONS } from "@/data/island-bti/questions";
import { isIslandBtiResultCode } from "@/data/island-bti/results";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { calculateIslandBtiResult, shuffleIslandBtiQuestions } from "@/lib/island-bti";

export function IslandBtiTest() {
  const navigate = useNavigate();
  const { saveResult } = useIslandBti();
  const [questions] = useState(() => shuffleIslandBtiQuestions(ISLAND_BTI_QUESTIONS));
  const questionCount = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const savedForCompletionRef = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionIndex = answers[currentQuestion.id] ?? null;
  const progress = ((currentQuestionIndex + 1) / questionCount) * 100;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questionCount - 1;
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
      if (savedForCompletionRef.current) return;

      try {
        const resultData = calculateIslandBtiResult(answers, questions);
        if (!isIslandBtiResultCode(resultData.result)) {
          throw new Error(`Invalid Island BTI result code: ${resultData.result}`);
        }

        savedForCompletionRef.current = true;
        saveResult(resultData.result, resultData.scores);
        navigate("/island-bti/result", { state: resultData });
      } catch (error) {
        savedForCompletionRef.current = false;
        console.error("Island BTI result calculation failed:", error);
      }
      return;
    }

    setCurrentQuestionIndex((index) => index + 1);
  };

  return (
    <main className="ibti-page">
      <IslandBtiContainer>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND MBTI TEST</span>
          <h1 className="ibti-head__title">섬BTI 검사</h1>
          <p className="ibti-head__sub">가장 가까운 선택지 하나를 골라 주세요.</p>
        </header>

        <section className="ibti-card" aria-labelledby="ibti-question-title">
          <div className="ibti-progress" aria-label="검사 진행률">
            <div className="ibti-progress__head">
              <span>
                문항 {currentQuestionIndex + 1} / {questionCount}
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
      </IslandBtiContainer>
    </main>
  );
}
