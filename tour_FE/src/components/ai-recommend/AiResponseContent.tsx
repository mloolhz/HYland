import type { AiResponse } from "@/types/ai-recommend";
import { getIslandEditorialByName } from "@/data/island-editorial";
import { renderBoldText } from "@/lib/render-bold-text";
import { AiCourseTimeline } from "./AiCourseTimeline";
import { AiRecCard } from "./AiRecCard";

type AiResponseContentProps = {
  response: AiResponse;
  onFollowup: (text: string) => void;
};

export function AiResponseContent({ response, onFollowup }: AiResponseContentProps) {
  // 답변이 추천한 활동이 걸린 섬들 중, 직접 수집한 특징이 있는 섬을 골라
  // "이 섬은 이런 곳이라 추천"을 채팅 답변에도 함께 설명한다. (같은 섬 중복 제거)
  // 스트림 응답 추천 항목은 islandId 없이 islandName만 담겨 오므로 이름으로 조회한다.
  const islandCharacteristics = [
    ...new Map(
      response.recommendations
        .map((r) => {
          const editorial = getIslandEditorialByName(r.islandName);
          return editorial ? ([r.islandName, { name: r.islandName, editorial }] as const) : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null),
    ).values(),
  ];

  const infoOnly = response.recommendations.every(
    (r) =>
      r.reservationType === "free" ||
      r.reservationType === "info" ||
      r.reservationType === "community",
  );
  const hasMixed = response.recommendations.some((r) => r.reservationType === "mixed");

  return (
    <div className="ai-response">
      {response.weather && (
        <div className="ai-weather-card ai-fade-up">
          <div className="ai-weather-card__head">
            <span className="ai-weather-card__badge">날씨</span>
            <span className="ai-weather-card__date">{response.weather.date}</span>
          </div>
          <p className="ai-weather-card__summary">{response.weather.summary}</p>
          <p className="ai-weather-card__recommendation">{response.weather.recommendation}</p>
        </div>
      )}

      <p className="ai-response-text" style={{ whiteSpace: "pre-line" }}>{renderBoldText(response.text)}</p>

      {islandCharacteristics.length > 0 && (
        <div className="ai-response-islands ai-fade-up">
          {islandCharacteristics.map(({ name, editorial }) => (
            <div key={name} className="ai-island-note">
              <p className="ai-island-note__summary">
                <span className="ai-island-note__name">{name}</span>
                {editorial.summary}
              </p>
              {editorial.highlights.length > 0 && (
                <ul className="ai-island-note__tags">
                  {editorial.highlights.map((tag) => (
                    <li key={tag} className="ai-island-note__tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {response.recommendations.length > 0 && (
        <div className="ai-rec-list ai-fade-up ai-fade-up-1">
          <p className="ai-rec-lead">
            {infoOnly
              ? "예약 없이 즐기는 활동입니다. 코스·이용 정보를 확인하세요."
              : hasMixed
                ? "아래에서 예약·이용 정보를 확인할 수 있습니다."
                : "이 활동은 아래 예약처에서 예약할 수 있습니다."}
          </p>
          {response.recommendations.map((item) => (
            <AiRecCard key={`${item.sportId}-${item.islandName}`} item={item} />
          ))}
        </div>
      )}

      {response.course && (
        <div className="ai-fade-up ai-fade-up-2">
          <AiCourseTimeline title={response.course.title} steps={response.course.steps} />
        </div>
      )}

      {response.tips && response.tips.length > 0 && (
        <div className="ai-tips ai-fade-up ai-fade-up-3">
          <h4 className="ai-tips-title">예약·이용 팁</h4>
          <ul>
            {response.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {response.followups && response.followups.length > 0 && (
        <div className="ai-followups ai-fade-up ai-fade-up-4">
          {response.followups.map((chip) => (
            <button key={chip} type="button" className="ai-followup-chip" onClick={() => onFollowup(chip)}>
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}