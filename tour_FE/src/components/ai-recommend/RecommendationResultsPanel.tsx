import { Link } from "react-router-dom";
import { ISLAND_BTI_RESULTS } from "@/data/island-bti/results";
import type { RecommendationResponse } from "@/types/recommendation";
import type { WeatherInfo } from "@/types/ai-recommend";

type RecommendationResultsPanelProps = {
  response: RecommendationResponse;
  weather?: WeatherInfo | null;
};

function ScoreRow({ label, value }: { label: string; value: number }) {
  if (value <= 0) return null;
  return (
    <li className="ai-rec-score-item">
      <span>{label}</span>
      <strong>{value}%</strong>
    </li>
  );
}

export function RecommendationResultsPanel({ response, weather }: RecommendationResultsPanelProps) {
  if (response.recommendations.length === 0) {
    return (
      <div className="ai-rec-results ai-rec-results--empty">
        <p>현재 조건으로 추천 가능한 섬이 없어요. 날짜나 여행 조건을 조정해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="ai-rec-results">
      {weather && (
        <div className="ai-weather-card ai-weather-card--compact">
          <div className="ai-weather-card__head">
            <span className="ai-weather-card__badge">날씨</span>
            <span className="ai-weather-card__date">{weather.date}</span>
          </div>
          <p className="ai-weather-card__summary">{weather.summary}</p>
          {weather.recommendation ? (
            <p className="ai-weather-card__recommendation">{weather.recommendation}</p>
          ) : null}
        </div>
      )}

      {response.useIslandBti && response.userIslandBti ? (
        <p className="ai-rec-results__lead">
          {response.userIslandBti}
          {ISLAND_BTI_RESULTS[response.userIslandBti]
            ? `(${ISLAND_BTI_RESULTS[response.userIslandBti].name})`
            : ""}{" "}
          성향을 반영해 TOP {response.recommendations.length} 섬을 골랐어요.
        </p>
      ) : (
        <p className="ai-rec-results__lead">이번 여행 조건 중심으로 TOP {response.recommendations.length} 섬을 골랐어요.</p>
      )}

      {response.recommendations.map((item) => (
        <article key={item.islandId} className="ai-rec-island-card">
          <header className="ai-rec-island-card__head">
            <div>
              <span className="ai-rec-island-card__rank">{item.rank}위</span>
              <h3>{item.islandName}</h3>
            </div>
            <div className="ai-rec-island-card__score">
              <span>추천도</span>
              <strong>{item.finalScore}%</strong>
            </div>
          </header>

          {response.useIslandBti ? (
            <p className="ai-rec-island-card__bti-note">당신의 섬BTI 성향을 반영했어요.</p>
          ) : null}

          {/* 근거는 2개까지만. 예전엔 4~5개가 모두 펼쳐져 카드가 화면 4배까지 길어졌다. */}
          <ul className="ai-rec-reasons">
            {item.recommendationReasons.slice(0, 2).map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>

          {item.aiDescription ? (
            <p className="ai-rec-island-card__description">{item.aiDescription}</p>
          ) : null}

          {/* 점수 상세·코스는 기본 접힘. 수치(%)는 이 안에서만 보여준다. */}
          <details className="ai-rec-details">
            <summary className="ai-rec-details__summary">추천 점수·코스 자세히 보기</summary>

            <ul className="ai-rec-score-list">
              <ScoreRow label="섬BTI 성향 일치도" value={item.scores.islandBtiMatch} />
              <ScoreRow label="이번 여행 스타일 일치" value={item.scores.currentTripMatch} />
              <ScoreRow label="날씨 조건" value={item.scores.weather} />
              <ScoreRow label="교통 접근성" value={item.scores.transport} />
              <ScoreRow label="여행 기간 적합" value={item.scores.condition} />
              <ScoreRow label="탐험 보너스" value={item.scores.exploration} />
            </ul>

            {item.itinerary && item.itinerary.length > 0 ? (
              <ol className="ai-rec-itinerary">
                {item.itinerary.map((step) => (
                  <li key={step.order}>
                    <span>{step.order}</span>
                    {step.name}
                  </li>
                ))}
              </ol>
            ) : null}
          </details>

          <div className="ai-rec-island-card__actions">
            <Link to={`/islands/${item.islandId}`} className="ai-rec-island-card__link">
              {item.islandName} 자세히 보기
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
