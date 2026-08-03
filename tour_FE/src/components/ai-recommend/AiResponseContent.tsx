import type { AiResponse } from "@/types/ai-recommend";
import { AiCourseTimeline } from "./AiCourseTimeline";
import { AiRecCard } from "./AiRecCard";

type AiResponseContentProps = {
  response: AiResponse;
  onFollowup: (text: string) => void;
};

export function AiResponseContent({ response, onFollowup }: AiResponseContentProps) {
  const infoOnly = response.recommendations.every(
    (r) => r.reservationType === "free" || r.reservationType === "info" || r.reservationType === "community",
  );

  return (
    <div className="ai-response">
      <p className="ai-response-text">{response.text}</p>

      {response.recommendations.length > 0 && (
        <div className="ai-rec-list">
          <p className="ai-rec-lead">
            {infoOnly
              ? "예약 없이 즐기는 활동입니다. 코스·이용 정보를 확인하세요."
              : "이 활동은 아래 예약처에서 예약할 수 있습니다."}
          </p>
          {response.recommendations.map((item) => (
            <AiRecCard key={`${item.sportId}-${item.islandName}`} item={item} />
          ))}
        </div>
      )}

      {response.course && (
        <AiCourseTimeline title={response.course.title} steps={response.course.steps} />
      )}

      {response.tips && response.tips.length > 0 && (
        <div className="ai-tips">
          <h4 className="ai-tips-title">예약·이용 팁</h4>
          <ul>
            {response.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {response.followups && response.followups.length > 0 && (
        <div className="ai-followups">
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
