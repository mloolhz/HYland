import type { CourseStep } from "@/types/ai-recommend";

type AiCourseTimelineProps = {
  title: string;
  steps: CourseStep[];
};

export function AiCourseTimeline({ title, steps }: AiCourseTimelineProps) {
  // 시간이 하나라도 있으면 시간표(타임라인), 아니면 단순 목록으로 본다.
  // 종목 추천처럼 "2개만" 나열할 땐 시간이 없어 목록으로 렌더된다.
  const hasTimes = steps.some((step) => Boolean(step.time));

  return (
    <div className="ai-course">
      <h4 className="ai-course-title">{title}</h4>
      <ol className={`ai-course-list${hasTimes ? "" : " ai-course-list--plain"}`}>
        {steps.map((step, index) => (
          <li key={`${step.time ?? ""}-${step.activity}-${index}`} className="ai-course-step">
            <span className="ai-course-dot" aria-hidden="true" />
            <div className="ai-course-body">
              {step.time ? <p className="ai-course-time">{step.time}</p> : null}
              <strong className="ai-course-activity">{step.activity}</strong>
              <p className="ai-course-desc">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
