import { Link } from "react-router-dom";
import { AiCourseTimeline } from "@/components/ai-recommend/AiCourseTimeline";
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

          {/* 다녀온 사람의 후기 — 가장 설득력 있는 근거라 시설보다 먼저 보여준다 */}
          {item.communityHighlights && item.communityHighlights.length > 0 ? (
            <ul className="ai-rec-community">
              {item.communityHighlights.map((post) => (
                <li key={post.postId} className="ai-rec-community__item">
                  <Link to={`/community/${post.postId}`} className="ai-rec-community__link">
                    <span className="ai-rec-community__tag">후기</span>
                    <span className="ai-rec-community__title">{post.highlight ?? post.title}</span>
                    <span className="ai-rec-community__likes">♥ {post.likes}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {/* 여러 방문객이 남긴 주의·팁 — 후기 합의라 개별 글보다 신뢰도가 높다 */}
          {item.communityCautions && item.communityCautions.length > 0 ? (
            <ul className="ai-rec-cautions">
              {item.communityCautions.map((caution) => (
                <li key={caution} className="ai-rec-caution">
                  <span className="ai-rec-caution__icon" aria-hidden="true">
                    💡
                  </span>
                  방문객 팁: {caution}
                </li>
              ))}
            </ul>
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

          {/* 일반 질문 답변과 같은 타임라인을 쓴다. 접어두는 만큼 펼쳤을 때
              시간·장소·설명이 있는 실제 일정이 나와야 한다. */}
          {item.course && item.course.steps.length > 0 ? (
            <details className="ai-rec-details">
              <summary className="ai-rec-details__summary">
                코스 자세히 보기 ({item.course.steps.length}단계)
              </summary>
              <AiCourseTimeline title={item.course.title} steps={item.course.steps} />
            </details>
          ) : null}

          {/* 레저스포츠 탭과 같은 이용정보 출처 — 추천에서 바로 예약·문의로 넘어간다 */}
          {item.externalLinks && item.externalLinks.length > 0 ? (
            <div className="ai-rec-links">
              {item.externalLinks.map((link) => (
                <a
                  key={link.url}
                  className="ai-rec-link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="ai-rec-link__copy">
                    <span className="ai-rec-link__sport">{link.sportName}</span>
                    <span className="ai-rec-link__label">{link.label}</span>
                    {link.tel ? <span className="ai-rec-link__tel">전화 {link.tel}</span> : null}
                  </span>
                  <span className="ai-rec-link__external" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
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
