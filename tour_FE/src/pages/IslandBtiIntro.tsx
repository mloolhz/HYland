import { Link } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";

export function IslandBtiIntro() {
  return (
    <main className="ibti-page">
      <div className={CONTAINER}>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI</span>
          <h1 className="ibti-head__title">섬BTI로 나의 여행 성향 찾기</h1>
          <p className="ibti-head__sub">
            20가지 질문으로 나만의 섬 여행 유형을 발견해 보세요.
          </p>
          <p className="ibti-head__sub">
            결과에 따라 추천 섬과 레저 활동을 안내해 드립니다.
          </p>
        </header>

        <section className="ibti-card ibti-intro-card" aria-labelledby="ibti-intro-title">
          <h2 id="ibti-intro-title" className="ibti-question">
            어떤 검사인가요?
          </h2>
          <p className="ibti-head__sub">
            네 가지 성향 축을 바탕으로 16가지 섬BTI 유형 중 하나를 알려드려요.
          </p>

          <ul className="ibti-intro-list">
            <li>Active / Breezy — 활동적인지, 여유로운지</li>
            <li>Water / Land — 바다와 육상 중 어디에 더 끌리는지</li>
            <li>Crew / Independent — 함께할지, 혼자 즐길지</li>
            <li>Planned / Flow — 계획형인지, 즉흥형인지</li>
          </ul>

          <span className="ibti-meta">예상 소요 시간 · 약 3분</span>

          <div className="ibti-actions ibti-actions--intro">
            <Link to="/island-bti/test" className="btn btn-navy ibti-start-btn">
              시작하기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
