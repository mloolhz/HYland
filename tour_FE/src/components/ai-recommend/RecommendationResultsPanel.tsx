import { Link } from "react-router-dom";
import type { RecommendationResponse } from "@/types/recommendation";

type RecommendationResultsPanelProps = {
  response: RecommendationResponse;
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

export function RecommendationResultsPanel({ response }: RecommendationResultsPanelProps) {
  if (response.recommendations.length === 0) {
    return (
      <div className="ai-rec-results ai-rec-results--empty">
        <p>현재 조건으로 추천 가능한 섬이 없어요. 날짜·예산·이동 수단을 조정해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="ai-rec-results">
      {response.useIslandBti && response.userIslandBti ? (
        <p className="ai-rec-results__lead">
          {response.userIslandBti} 성향을 반영해 TOP {response.recommendations.length} 섬을 골랐어요.
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

          <ul className="ai-rec-score-list">
            <ScoreRow label="섬BTI 성향 일치도" value={item.scores.islandBtiMatch} />
            <ScoreRow label="이번 여행 스타일 일치" value={item.scores.currentTripMatch} />
            <ScoreRow label="날씨 조건" value={item.scores.weather} />
            <ScoreRow label="교통 접근성" value={item.scores.transport} />
            <ScoreRow label="여행 기간 적합" value={item.scores.condition} />
            <ScoreRow label="탐험 보너스" value={item.scores.exploration} />
          </ul>

          <ul className="ai-rec-reasons">
            {item.recommendationReasons.map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>

          {item.aiDescription ? (
            <p className="ai-rec-island-card__description">{item.aiDescription}</p>
          ) : null}

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
