import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addMonths,
  clampTripEndDate,
  computeTripDurationDays,
  formatTripDateRangeLabel,
  formatYmd,
  isDateInRange,
  isValidYmd,
  MAX_TRIP_DURATION_DAYS,
  normalizeTripRange,
  parseYmd,
  startOfMonth,
  todayStart,
  TRIP_WEEKDAYS,
} from "@/lib/trip-date";

type TripDateRangePickerProps = {
  startDate?: string;
  endDate?: string;
  onChange: (next: { travelDate: string; travelEndDate: string; duration: number }) => void;
};

type SelectPhase = "start" | "end";

const POPOVER_WIDTH = 268;
const POPOVER_ESTIMATED_HEIGHT = 320;

function buildCalendarCells(month: Date) {
  const first = startOfMonth(month);
  const startPad = first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: ({ day: number; date: string } | null)[] = [];

  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: formatYmd(new Date(month.getFullYear(), month.getMonth(), day)),
    });
  }

  return cells;
}

function computePopoverPosition(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect();
  const margin = 12;
  const gap = 6;

  let left = rect.left;
  if (left + POPOVER_WIDTH > window.innerWidth - margin) {
    left = window.innerWidth - POPOVER_WIDTH - margin;
  }
  left = Math.max(margin, left);

  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const openAbove = spaceBelow < POPOVER_ESTIMATED_HEIGHT && rect.top > POPOVER_ESTIMATED_HEIGHT;

  const top = openAbove ? rect.top - gap : rect.bottom + gap;

  return {
    position: "fixed" as const,
    top: openAbove ? top - POPOVER_ESTIMATED_HEIGHT : top,
    left,
    width: POPOVER_WIDTH,
    zIndex: 1200,
  };
}

export function TripDateRangePicker({ startDate, endDate, onChange }: TripDateRangePickerProps) {
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const today = todayStart();

  const resolvedStart = isValidYmd(startDate) ? startDate : formatYmd(today);
  const resolvedEnd = isValidYmd(endDate) ? endDate : resolvedStart;

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => startOfMonth(parseYmd(resolvedStart)));
  const [phase, setPhase] = useState<SelectPhase>("start");
  const [draftStart, setDraftStart] = useState(resolvedStart);
  const [draftEnd, setDraftEnd] = useState(resolvedEnd);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const updatePopoverPosition = useCallback(() => {
    if (!triggerRef.current) return;
    setPopoverStyle(computePopoverPosition(triggerRef.current));
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePopoverPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleReposition = () => updatePopoverPosition();

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePopoverPosition]);

  useEffect(() => {
    setDraftStart(resolvedStart);
    setDraftEnd(resolvedEnd);
    setMonth(startOfMonth(parseYmd(resolvedStart)));
  }, [resolvedStart, resolvedEnd]);

  const calendarCells = useMemo(() => buildCalendarCells(month), [month]);
  const summaryLabel = formatTripDateRangeLabel(draftStart, draftEnd);

  const commitRange = (start: string, end: string) => {
    const clampedEnd = clampTripEndDate(start, end);
    const normalized = normalizeTripRange(start, clampedEnd);
    onChange({
      travelDate: normalized.start,
      travelEndDate: normalized.end,
      duration: computeTripDurationDays(normalized.start, normalized.end),
    });
  };

  const handleDayClick = (date: string) => {
    if (phase === "start") {
      setDraftStart(date);
      setDraftEnd(date);
      setPhase("end");
      return;
    }

    const nextEnd = clampTripEndDate(draftStart, date);
    const normalized = normalizeTripRange(draftStart, nextEnd);
    setDraftStart(normalized.start);
    setDraftEnd(normalized.end);
    commitRange(normalized.start, normalized.end);
    setPhase("start");
    setOpen(false);
  };

  const openCalendar = () => {
    setPhase("start");
    setDraftStart(resolvedStart);
    setDraftEnd(resolvedEnd);
    setMonth(startOfMonth(parseYmd(resolvedStart)));
    setOpen(true);
  };

  const popover = open ? (
    <div
      ref={popoverRef}
      className="ai-trip-date-popover ai-trip-date-popover--portal"
      style={popoverStyle}
      role="dialog"
      aria-label="여행 날짜 선택"
    >
      <div className="ai-trip-date-popover__head">
        <button
          type="button"
          className="ai-trip-date-nav"
          onClick={() => setMonth((prev) => addMonths(prev, -1))}
          aria-label="이전 달"
        >
          ‹
        </button>
        <strong>
          {month.getFullYear()}년 {month.getMonth() + 1}월
        </strong>
        <button
          type="button"
          className="ai-trip-date-nav"
          onClick={() => setMonth((prev) => addMonths(prev, 1))}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <p className="ai-trip-date-popover__hint">
        {phase === "start"
          ? "출발일을 선택하세요."
          : "종료일을 선택하세요. 같은 날을 다시 누르면 당일치기예요."}
      </p>

      <div className="ai-trip-date-weekdays">
        {TRIP_WEEKDAYS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="ai-trip-date-grid">
        {calendarCells.map((cell, index) => {
          if (!cell) {
            return <span key={`empty-${index}`} className="ai-trip-date-cell ai-trip-date-cell--empty" />;
          }

          const cellDate = parseYmd(cell.date);
          const disabled = cellDate.getTime() < today.getTime();
          const inRange = isDateInRange(cell.date, draftStart, draftEnd);
          const isStart = cell.date === draftStart;
          const isEnd = cell.date === draftEnd;

          return (
            <button
              key={cell.date}
              type="button"
              className={[
                "ai-trip-date-cell",
                inRange ? "ai-trip-date-cell--in-range" : "",
                isStart ? "ai-trip-date-cell--start" : "",
                isEnd ? "ai-trip-date-cell--end" : "",
                disabled ? "ai-trip-date-cell--disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              onClick={() => handleDayClick(cell.date)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="ai-trip-date-popover__footer">
        <span>{summaryLabel}</span>
        <span className="ai-trip-date-popover__limit">최대 {MAX_TRIP_DURATION_DAYS}일</span>
      </div>
    </div>
  ) : null;

  return (
    <div className="ai-trip-date-range" ref={rootRef}>
      <label className="ai-trip-field ai-trip-field--range" htmlFor={fieldId}>
        <span>여행 날짜 · 기간</span>
        <button
          id={fieldId}
          ref={triggerRef}
          type="button"
          className="ai-trip-date-trigger"
          onClick={openCalendar}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span>{formatTripDateRangeLabel(resolvedStart, resolvedEnd)}</span>
          <span className="ai-trip-date-trigger__icon" aria-hidden="true">
            ▾
          </span>
        </button>
      </label>

      {typeof document !== "undefined" ? createPortal(popover, document.body) : null}
    </div>
  );
}
