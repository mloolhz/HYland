import { Link, useLocation } from "react-router-dom";
import { CONTAINER } from "@/constants/layout";
import {
  getIslandBtiAxisRatios,
  getIslandBtiResult,
  ISLAND_BTI_RESULTS,
} from "@/data/island-bti/results";
import { isIslandBtiCalculationResult } from "@/lib/island-bti";
import type { IslandBtiResultCode } from "@/types/island-bti";

function ResultEmptyState() {
  return (
    <main className="ibti-page">
      <div className={CONTAINER}>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI RESULT</span>
          <h1 className="ibti-head__title">나의 섬BTI</h1>
          <p className="ibti-head__sub">검사를 완료한 후 결과를 확인할 수 있습니다.</p>
        </header>

        <section className="ibti-card ibti-result-layout">
          <div className="ibti-actions">
            <Link to="/island-bti/test" className="btn btn-navy">
              검사하러 가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchItem({ label, code }: { label: string; code: IslandBtiResultCode }) {
  const match = ISLAND_BTI_RESULTS[code];
  return (
    <li className="ibti-match-item">
      <span className="ibti-match-item__label">{label}</span>
      <span className="ibti-match-item__value">
        <strong>{code}</strong> · {match.name}
      </span>
    </li>
  );
}

export function IslandBtiResult() {
  const location = useLocation();
  const calculation = isIslandBtiCalculationResult(location.state) ? location.state : null;
  const profile = calculation ? getIslandBtiResult(calculation.result) : null;

  if (!calculation || !profile) {
    return <ResultEmptyState />;
  }

  const axisRatios = getIslandBtiAxisRatios(calculation.scores);
  const rankLabels = ["1순위", "2순위", "3순위", "4순위"];

  return (
    <main className="ibti-page">
      <div className={CONTAINER}>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI RESULT</span>
          <h1 className="ibti-head__title">나의 섬BTI</h1>
        </header>

        <section className="ibti-card ibti-result-layout" aria-labelledby="ibti-result-name">
          <div className="ibti-result-main">
            <span className="ibti-result-code">{profile.code}</span>
            <h2 id="ibti-result-name" className="ibti-result-name">
              {profile.name}
            </h2>
            <p className="ibti-result-traits">{profile.englishTraits.join(" · ")}</p>
            <p className="ibti-result-tagline">{profile.tagline}</p>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">성향 비율</h3>
            <ul className="ibti-axis-list">
              {axisRatios.map((axis) => (
                <li key={axis.dimension} className="ibti-axis-item">
                  <div className="ibti-axis-item__head">
                    <span className="ibti-axis-item__label">{axis.label}</span>
                    <span className="ibti-axis-item__value">
                      {axis.winner} · {axis.winnerLabel} {axis.percent}%
                    </span>
                  </div>
                  <div
                    className="ibti-axis-item__track"
                    role="progressbar"
                    aria-valuenow={axis.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${axis.label} ${axis.percent}%`}
                  >
                    <span className="ibti-axis-item__fill" style={{ width: `${axis.percent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">성향 설명</h3>
            <ul className="ibti-desc-list">
              {profile.description.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">추천 활동</h3>
            <div className="ibti-tag-list">
              {profile.recommendedActivities.map((activity) => (
                <span key={activity} className="ibti-tag">
                  {activity}
                </span>
              ))}
            </div>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">추천 섬</h3>
            <ol className="ibti-island-rank">
              {profile.recommendedIslands.map((island, index) => (
                <li key={island}>
                  <span className="ibti-island-rank__label">{rankLabels[index] ?? `${index + 1}순위`}</span>
                  <span className="ibti-island-rank__name">{island}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">추천 이유</h3>
            <p className="ibti-result-text">{profile.recommendationReason}</p>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">여행 팁</h3>
            <p className="ibti-result-text">{profile.travelTip}</p>
          </div>

          <div className="ibti-result-section">
            <h3 className="ibti-result-section__title">여행 궁합</h3>
            <ul className="ibti-match-list">
              <MatchItem label="찰떡 메이트" code={profile.bestMatch} />
              <MatchItem label="보완 메이트" code={profile.complementaryMatch} />
              <MatchItem label="파도주의 메이트" code={profile.cautionMatch} />
            </ul>
          </div>

          <p className="ibti-result-notice">
            추천 활동은 계절과 기상 상황에 따라 운영 여부가 달라질 수 있습니다. 예약 전 최신 운항 및
            체험 정보를 확인해 주세요.
          </p>

          <div className="ibti-actions ibti-actions--result">
            <Link to="/island-bti/test" className="btn btn-navy">
              다시 검사하기
            </Link>
            <Link to="/island-bti" className="btn btn-outline">
              소개로 돌아가기
            </Link>
            <button type="button" className="btn btn-outline ibti-passport-save" disabled>
              섬 여권에 저장하기
            </button>
            <p className="ibti-passport-save-note">준비 중인 기능입니다.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
