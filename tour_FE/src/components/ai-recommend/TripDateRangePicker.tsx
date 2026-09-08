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

  // 종료일 선택 단계에선 출발일부터 최대 기간(5일)까지만 고를 수 있게 한다.
  // 그 바깥 날짜는 비활성(회색)으로 막아, 클릭 후 조용히 잘리는 대신 미리 보여준다.
  const maxEndDate = useMemo(() => {
    const d = parseYmd(draftStart);
    d.setDate(d.getDate() + MAX_TRIP_DURATION_DAYS - 1);
    return formatYmd(d);
  }, [draftStart]);

  const commitRange = (start: string, end: string) => {
    const clampedEnd = clampTripEndDate(start, end);
    const normalized = normalizeTripRange(start, clampedEnd);
    onChange({
      travelDate: normalized.start,
      travelEndDate: normalized.end,
      duration: computeTripDurationDays(normalized.start, normalized.end),
    });
  };

  /** 출발일 기준 종료 가능 상한 (출발일 + 최대기간-1일) */
  const windowEndOf = (anchor: string) => {
    const d = parseYmd(anchor);
    d.setDate(d.getDate() + MAX_TRIP_DURATION_DAYS - 1);
    return formatYmd(d);
  };

  // 선택은 화면(draft)에 바로 반영하고 부모에도 즉시 커밋한다.
  // 예전엔 종료일 클릭 시 창을 닫아버렸지만, 이제 "완료" 버튼으로만 닫는다.
  const applySelection = (start: string, end: string) => {
    setDraftStart(start);
    setDraftEnd(end);
    commitRange(start, end);
  };

  // ── 드래그 선택 ──────────────────────────────────────────
  // 셀에서 마우스를 누르고 끌면 그 범위가 선택된다. 움직임 없이 누르기만 하면
  // 기존처럼 "출발일 → 종료일" 두 번 클릭으로도 고를 수 있다.
  const mouseDownDateRef = useRef<string | null>(null);
  const draggedRef = useRef(false);

  const handleDayMouseDown = (date: string) => {
    mouseDownDateRef.current = date;
    draggedRef.current = false;
  };

  const handleDayMouseEnter = (date: string) => {
    const anchor = mouseDownDateRef.current;
    if (anchor === null) return; // 버튼을 누른 채 이동할 때만 드래그로 본다

    if (!draggedRef.current) {
      // 첫 이동 순간 드래그 시작: 누른 날을 출발일로 확정
      draggedRef.current = true;
      setPhase("end");
      applySelection(anchor, anchor);
    }
    // 출발일 이후 방향으로만, 최대 기간 안에서 종료일을 늘린다
    const maxEnd = windowEndOf(anchor);
    let end = date;
    if (end < anchor) end = anchor;
    if (end > maxEnd) end = maxEnd;
    applySelection(anchor, end);
  };

  // 클릭(움직임 없는 누르기) 처리 — 드래그였으면 무시
  const finishTap = (date: string) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      mouseDownDateRef.current = null;
      setPhase("start");
      return;
    }
    mouseDownDateRef.current = null;

    if (phase === "start") {
      applySelection(date, date);
      setPhase("end");
      return;
    }
    // 종료일 클릭: 출발일보다 이르면 새 출발일로, 아니면 종료일로
    if (date < draftStart) {
      applySelection(date, date);
      setPhase("end");
      return;
    }
    const maxEnd = windowEndOf(draftStart);
    applySelection(draftStart, date > maxEnd ? maxEnd : date);
    setPhase("start");
  };

  // 드래그 중 셀 밖에서 손을 떼도 상태를 정리한다.
  useEffect(() => {
    if (!open) return;
    const onUp = () => {
      if (draggedRef.current) setPhase("start");
      draggedRef.current = false;
      mouseDownDateRef.current = null;
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [open]);

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
          ? "출발일을 누르거나, 눌러서 드래그하면 기간이 선택돼요."
          : "종료일을 누르세요. 선택이 끝나면 완료를 눌러주세요."}
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
          const isPast = cellDate.getTime() < today.getTime();
          // 종료일 단계: 출발일 이전이거나 최대 기간을 넘는 날짜는 막는다.
          const outOfWindow =
            phase === "end" && (cell.date < draftStart || cell.date > maxEndDate);
          const disabled = isPast || outOfWindow;
          const inRange = isDateInRange(cell.date, draftStart, draftEnd);
          const isStart = cell.date === draftStart;
          const isEnd = cell.date === draftEnd;
          const isMultiDay = draftStart !== draftEnd;
          // 출발/복귀 라벨: 여러 날 선택 중일 때만 (당일치기는 라벨 없이 날짜만)
          const tag =
            isStart && (isMultiDay || phase === "end")
              ? "출발"
              : isEnd && isMultiDay
                ? "복귀"
                : null;

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
              onMouseDown={() => handleDayMouseDown(cell.date)}
              onMouseEnter={() => handleDayMouseEnter(cell.date)}
              onMouseUp={() => finishTap(cell.date)}
              // 키보드(Enter/Space)로 누른 경우만 처리 — 마우스는 위 핸들러가 담당
              onClick={(e) => {
                if (e.detail === 0) finishTap(cell.date);
              }}
            >
              <span className="ai-trip-date-cell__day">{cell.day}</span>
              {tag ? <span className="ai-trip-date-cell__tag">{tag}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="ai-trip-date-popover__footer">
        <div className="ai-trip-date-popover__info">
          <span>{summaryLabel}</span>
          <span className="ai-trip-date-popover__limit">최대 {MAX_TRIP_DURATION_DAYS}일</span>
        </div>
        <button
          type="button"
          className="ai-trip-date-done"
          onClick={() => {
            commitRange(draftStart, draftEnd);
            setPhase("start");
            setOpen(false);
          }}
        >
          완료
        </button>
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
