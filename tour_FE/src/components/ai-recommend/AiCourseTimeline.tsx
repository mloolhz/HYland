import type { CourseStep } from "@/types/ai-recommend";

type AiCourseTimelineProps = {
  title: string;
  steps: CourseStep[];
};

export function AiCourseTimeline({ title, steps }: AiCourseTimelineProps) {
  return (
    <div className="ai-course">
      <h4 className="ai-course-title">{title}</h4>
      <ol className="ai-course-list">
        {steps.map((step) => {
          return (
            <li
              key={`${step.time}-${step.activity}`}
              className="ai-course-step"
            >
              <span className="ai-course-dot" aria-hidden="true" />
              <div className="ai-course-body">
                <p className="ai-course-time">{step.time}</p>
                <strong className="ai-course-activity">{step.activity}</strong>
                <p className="ai-course-desc">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
