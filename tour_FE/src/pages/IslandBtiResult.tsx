import { Link } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";

const DUMMY_RESULT = {
  code: "AWCP",
  name: "파도 위 플래너",
  description:
    "활기찬 바다와 친구들과의 여행을 좋아하는 계획형 탐험가예요. 일정을 세우고 해양 액티비티를 즐기는 섬 여행에 잘 맞습니다.",
};

export function IslandBtiResult() {
  return (
    <main className="ibti-page">
      <div className={CONTAINER}>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI RESULT</span>
          <h1 className="ibti-head__title">나의 섬BTI 결과</h1>
          <p className="ibti-head__sub">검사를 완료했어요. 아래는 UI 확인용 더미 결과입니다.</p>
        </header>

        <section className="ibti-card ibti-result-layout" aria-labelledby="ibti-result-name">
          <div className="ibti-result-hero">
            <span className="ibti-result-code">{DUMMY_RESULT.code}</span>
            <div className="ibti-result-avatar" aria-hidden="true">
              캐릭터
            </div>
            <h2 id="ibti-result-name" className="ibti-result-name">
              {DUMMY_RESULT.name}
            </h2>
            <p className="ibti-result-desc">{DUMMY_RESULT.description}</p>
          </div>

          <div className="ibti-actions">
            <Link to="/island-bti/test" className="btn btn-navy">
              다시 검사하기
            </Link>
            <Link to="/island-bti" className="btn btn-outline">
              소개로 돌아가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
