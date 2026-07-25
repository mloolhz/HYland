import { useState } from "react";
import { Link } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";

const DUMMY_QUESTION = {
  number: 1,
  total: 4,
  text: "주말에 섬에 간다면, 어떤 하루가 더 끌리나요?",
  choices: [
    "일찍 일어나 예약한 레저를 차례로 즐긴다",
    "느긋하게 카페에서 바다를 보며 쉰다",
    "친구들과 함께 바다·육상 액티비티를 번갈아 한다",
    "그날 기분에 맞춰 즉흥적으로 움직인다",
  ],
};

export function IslandBtiTest() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const progress = (DUMMY_QUESTION.number / DUMMY_QUESTION.total) * 100;

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
                문항 {DUMMY_QUESTION.number} / {DUMMY_QUESTION.total}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="ibti-progress__track">
              <span className="ibti-progress__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <h2 id="ibti-question-title" className="ibti-question">
            {DUMMY_QUESTION.text}
          </h2>
          <p className="ibti-question-hint">STEP 1 UI 골격 — 더미 문항 1개</p>

          <div className="ibti-options" role="listbox" aria-label="답변 선택">
            {DUMMY_QUESTION.choices.map((choice, index) => {
              const selected = selectedIndex === index;
              return (
                <button
                  key={choice}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`ibti-option${selected ? " is-selected" : ""}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          <div className="ibti-nav">
            <Link to="/island-bti" className="btn btn-outline">
              이전
            </Link>
            <Link to="/island-bti/result" className="btn btn-navy">
              다음
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
