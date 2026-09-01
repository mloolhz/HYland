import { Link } from "react-router-dom";
import { ISLAND_BTI_RESULTS } from "@/data/island-bti/results";
import type { RecommendationResponse } from "@/types/recommendation";
import type { WeatherInfo } from "@/types/ai-recommend";

type RecommendationResultsPanelProps = {
  response: RecommendationResponse;
  weather?: WeatherInfo | null;
};

/**
 * 추천도(%)·순위는 화면에 노출하지 않는다.
 * "추천도 90%"처럼 숫자만 보여주면 "무슨 근거로 매긴 값이지?"라는 의문이 남는데,
 * 그 근거를 숫자로 납득시키기는 어렵다. 그래서 순위 경쟁이 아니라
 * "이런 이유로 이 3곳"이라는 설명 중심으로 바꿨다.
 * (내부 점수 계산·정렬은 그대로 유지 — 어떤 3곳을 고를지 정하는 데만 쓴다)
 */
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
          성향을 반영해 이런 섬 {response.recommendations.length}곳을 추천해요.
        </p>
      ) : (
        <p className="ai-rec-results__lead">
          이번 여행 조건에 맞춰 이런 섬 {response.recommendations.length}곳을 추천해요.
        </p>
      )}

      {response.recommendations.map((item) => (
        <article key={item.islandId} className="ai-rec-island-card">
          <header className="ai-rec-island-card__head">
            <h3>{item.islandName}</h3>
          </header>

          {response.useIslandBti ? (
            <p className="ai-rec-island-card__bti-note">당신의 섬BTI 성향을 반영했어요.</p>
          ) : null}

          {/* 숫자를 뺀 대신 이유가 본문이 된다. 다만 다 펼치면 카드가 다시 길어지므로 3개까지. */}
          <ul className="ai-rec-reasons">
            {item.recommendationReasons.slice(0, 3).map((reason) => (
              <li key={reason}>✓ {reason}</li>
            ))}
          </ul>

          {item.aiDescription ? (
            <p className="ai-rec-island-card__description">{item.aiDescription}</p>
          ) : null}

          {/* 실제 존재하는 시설 이름 — 추천 이유를 눈으로 확인할 수 있게 한다 */}
          {item.facilityHighlights && item.facilityHighlights.length > 0 ? (
            <ul className="ai-rec-facilities">
              {item.facilityHighlights.map((f) => (
                <li key={`${f.activity}-${f.name}`} className="ai-rec-facility">
                  <span className="ai-rec-facility__tag">{f.activity}</span>
                  {f.name}
                </li>
              ))}
            </ul>
          ) : null}

          {item.itinerary && item.itinerary.length > 0 ? (
            <details className="ai-rec-details">
              <summary className="ai-rec-details__summary">코스 자세히 보기</summary>
              <ol className="ai-rec-itinerary">
                {item.itinerary.map((step) => (
                  <li key={step.order}>
                    <span>{step.order}</span>
                    {step.name}
                  </li>
                ))}
              </ol>
            </details>
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
