import type { CSSProperties } from "react";
import type { CoursePeriod, CourseStep } from "@/types/ai-recommend";

const PERIOD_META: Record<
  CoursePeriod,
  { label: string; icon: string; color: string }
> = {
  dawn: { label: "새벽", icon: "🌅", color: "#E07A1F" },
  morning: { label: "오전", icon: "☀️", color: "#1F4FB8" },
  noon: { label: "점심", icon: "🌤️", color: "#2F8F3C" },
  afternoon: { label: "오후", icon: "🌥️", color: "#7A3FD8" },
  sunset: { label: "저녁", icon: "🌇", color: "#E23B3B" },
};

type AiCourseTimelineProps = {
  title: string;
  steps: CourseStep[];
};

export function AiCourseTimeline({ title, steps }: AiCourseTimelineProps) {
  return (
    <div className="ai-course">
      <h4 className="ai-course-title">{title}</h4>
      <ol className="ai-course-list">
        {steps.map((step, index) => {
          const meta = PERIOD_META[step.period];
          const isLast = index === steps.length - 1;
          return (
            <li
              key={`${step.time}-${step.activity}`}
              className="ai-course-step"
              style={{ "--step-color": meta.color } as CSSProperties}
            >
              <div className="ai-course-track" aria-hidden="true">
                <span className="ai-course-dot" />
                {!isLast && <span className="ai-course-line" />}
              </div>
              <div className="ai-course-body">
                <div className="ai-course-badge">
                  <span className="ai-course-badge-icon" aria-hidden="true">
                    {meta.icon}
                  </span>
                  <span className="ai-course-badge-time">{step.time}</span>
                  <span className="ai-course-badge-period">{meta.label}</span>
                </div>
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
