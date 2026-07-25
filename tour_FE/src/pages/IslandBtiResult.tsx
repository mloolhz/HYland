import type { CSSProperties } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IslandBtiContainer } from "@/components/island-bti/IslandBtiContainer";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import {
  getIslandBtiAxisRatios,
  getIslandBtiPercentages,
  getIslandBtiResult,
  ISLAND_BTI_AI_RECOMMEND_PATH,
  ISLAND_BTI_RESULTS,
} from "@/data/island-bti/results";
import { formatIslandBtiDate } from "@/lib/format-island-bti-date";
import { isIslandBtiCalculationResult, type IslandBtiCalculationResult } from "@/lib/island-bti";
import type { IslandBtiResultCode } from "@/types/island-bti";

function ResultEmptyState() {
  return (
    <main className="ibti-page">
      <IslandBtiContainer>
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
      </IslandBtiContainer>
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
  const navigate = useNavigate();
  const { latestResult } = useIslandBti();

  const calculationFromState = isIslandBtiCalculationResult(location.state)
    ? location.state
    : null;

  const calculationFromStorage: IslandBtiCalculationResult | null = latestResult
    ? { result: latestResult.code, scores: latestResult.scores }
    : null;

  const calculation = calculationFromState ?? calculationFromStorage;
  const profile = calculation ? getIslandBtiResult(calculation.result) : null;
  const testedAtLabel = latestResult ? formatIslandBtiDate(latestResult.testedAt) : null;

  if (!calculation || !profile) {
    return <ResultEmptyState />;
  }

  const axisRatios = getIslandBtiAxisRatios(calculation.scores);
  const rankLabels = ["1순위", "2순위", "3순위", "4순위"];
  const topIsland = profile.recommendedIslands[0];
  const highlightActivities = profile.recommendedActivities.slice(0, 3);
  const themeStyle = { "--island-bti-theme": profile.themeColor } as CSSProperties;
  const aiRecommendEnabled = ISLAND_BTI_AI_RECOMMEND_PATH !== null;

  const handleAiRecommend = () => {
    if (!ISLAND_BTI_AI_RECOMMEND_PATH) return;

    navigate(ISLAND_BTI_AI_RECOMMEND_PATH, {
      state: {
        islandBti: {
          code: profile.code,
          name: profile.name,
          scores: calculation.scores,
          percentages: getIslandBtiPercentages(calculation.scores),
        },
      },
    });
  };

  return (
    <main className="ibti-page">
      <IslandBtiContainer>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND BTI RESULT</span>
          <h1 className="ibti-head__title">나의 섬BTI</h1>
          {testedAtLabel ? (
            <p className="ibti-head__sub">검사일 {testedAtLabel}</p>
          ) : null}
        </header>

        <section
          className="ibti-card ibti-result-layout ibti-result-layout--themed"
          style={themeStyle}
          aria-labelledby="ibti-result-name"
        >
          <div className="ibti-result-main">
            <span className="ibti-result-code">{profile.code}</span>
            <h2 id="ibti-result-name" className="ibti-result-name">
              {profile.name}
            </h2>
            <p className="ibti-result-tagline">{profile.tagline}</p>

            {topIsland ? (
              <div className="ibti-result-highlight ibti-result-highlight--island">
                <span className="ibti-result-highlight__label">대표 추천 섬</span>
                <strong className="ibti-result-highlight__value">{topIsland}</strong>
              </div>
            ) : null}

            {highlightActivities.length > 0 ? (
              <div className="ibti-result-highlight">
                <span className="ibti-result-highlight__label">추천 활동</span>
                <div className="ibti-tag-list ibti-tag-list--hero">
                  {highlightActivities.map((activity) => (
                    <span key={activity} className="ibti-tag">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="ibti-ai-cta">
            <p className="ibti-ai-cta__desc">
              교통, 일정, 예산, 체력 조건까지 반영해 실제로 갈 수 있는 섬을 추천받아보세요.
            </p>
            <button
              type="button"
              className="btn btn-navy ibti-ai-cta__btn"
              onClick={handleAiRecommend}
              disabled={!aiRecommendEnabled}
            >
              내 섬BTI로 맞춤 여행 찾기
            </button>
            {!aiRecommendEnabled ? (
              <p className="ibti-ai-cta__note">맞춤 추천 기능을 준비 중입니다.</p>
            ) : null}
          </div>

          <div className="ibti-result-details">
            <p className="ibti-result-traits">{profile.englishTraits.join(" · ")}</p>

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
                    <span className="ibti-island-rank__label">
                      {rankLabels[index] ?? `${index + 1}순위`}
                    </span>
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
          </div>

          <div className="ibti-result-notices">
            <p className="ibti-result-notice">
              섬BTI는 현재의 여행 취향을 기반으로 한 재미형 테스트이며, 동행·계절·여행 목적에 따라 결과가
              달라질 수 있습니다.
            </p>
            <p className="ibti-result-notice">
              추천 활동은 계절과 기상 상황에 따라 운영 여부가 달라질 수 있습니다. 예약 전 최신 운항 및 체험
              정보를 확인해 주세요.
            </p>
          </div>

          <div className="ibti-actions ibti-actions--result">
            <button type="button" className="btn btn-outline ibti-passport-save" disabled>
              섬 여권에 등록하기
            </button>
            <p className="ibti-passport-save-note">준비 중인 기능입니다.</p>
            <Link to="/island-bti/test" className="btn btn-outline">
              다시 검사하기
            </Link>
            <Link to="/island-bti" className="btn btn-outline">
              소개로 돌아가기
            </Link>
          </div>
        </section>
      </IslandBtiContainer>
    </main>
  );
}
