type StepIndicatorProps = {
  step: 1 | 2;
  step2Label: string;
};

export function StepIndicator({ step, step2Label }: StepIndicatorProps) {
  const steps = [
    { num: 1 as const, label: "본인 확인" },
    { num: 2 as const, label: step2Label },
  ];

  return (
    <ol className="auth-steps" aria-label="진행 단계">
      {steps.map((s, i) => {
        const done = step > s.num;
        const active = step === s.num;
        return (
          <li
            key={s.num}
            className="auth-step-item"
            aria-current={active ? "step" : undefined}
          >
            {i > 0 && <span className="auth-step-line" aria-hidden="true" />}
            <span
              className={`auth-step-circle${done ? " is-done" : ""}${active ? " is-active" : ""}`}
            >
              {done ? (
                <i className="ti ti-check" aria-label="완료" />
              ) : (
                s.num
              )}
            </span>
            <span className={`auth-step-label${active ? " is-active" : ""}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
