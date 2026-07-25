type StepBarProps = {
  current: "checkout" | "complete";
};

export function ReservationStepBar({ current }: StepBarProps) {
  return (
    <div className="rv-steps" aria-label="예약 진행">
      <span className="rv-step is-done">날짜·인원 ✓</span>
      <span className="rv-step-sep">→</span>
      <span className={`rv-step${current === "checkout" ? " is-current" : " is-done"}`}>
        정보·결제{current === "complete" ? " ✓" : ""}
      </span>
      <span className="rv-step-sep">→</span>
      <span className={`rv-step${current === "complete" ? " is-done" : ""}`}>완료</span>
    </div>
  );
}
