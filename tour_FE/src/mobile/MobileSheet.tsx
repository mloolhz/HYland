import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./MobileIcons";

type MobileSheetProps = {
  open: boolean;
  onClose: () => void;
  /** 시트 제목 — 없으면 머리글 줄을 그리지 않는다 */
  title?: ReactNode;
  /** auto: 내용만큼 / tall: 화면의 92% 고정 (여러 단계짜리 폼용) */
  height?: "auto" | "tall";
  /** 왼쪽 위 뒤로가기 (회원가입 단계 이동 등) */
  onBack?: () => void;
  children: ReactNode;
  labelledBy?: string;
};

/**
 * 모바일 바텀시트
 *
 * 화면 아래에서 올라오고, 배경을 누르거나 손잡이를 아래로 끌면 닫힌다.
 * 열려 있는 동안 뒤 화면은 스크롤을 막는다 (iOS 사파리 포함).
 */
export function MobileSheet({
  open,
  onClose,
  title,
  height = "auto",
  onBack,
  children,
  labelledBy,
}: MobileSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const dragStartRef = useRef<number | null>(null);
  // 닫히는 애니메이션이 끝날 때까지 DOM 에 남겨 둔다
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setDragY(0);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 260);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // 시트가 열리면 첫 입력칸으로 초점을 옮긴다
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>(
        "input:not([type=hidden]), button, [href], select, textarea",
      );
      el?.focus({ preventScroll: true });
    }, 280);
    return () => window.clearTimeout(t);
  }, [open]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStartRef.current === null) return;
    const delta = e.clientY - dragStartRef.current;
    setDragY(delta > 0 ? delta : 0);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (dragStartRef.current === null) return;
    dragStartRef.current = null;
    setDragY((current) => {
      // 100px 넘게 끌어내리면 닫는다
      if (current > 100) onClose();
      return 0;
    });
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`m-sheet-root${open ? " is-open" : ""}`}>
      <div className="m-sheet-backdrop" onClick={onClose} role="presentation" />
      <div
        ref={panelRef}
        className={`m-sheet m-sheet--${height}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: "none" } : undefined}
      >
        <div
          className="m-sheet__grip"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <span className="m-sheet__grip-bar" />
        </div>

        {(title || onBack) && (
          <div className="m-sheet__head">
            {onBack ? (
              <button type="button" className="m-sheet__back" onClick={onBack} aria-label="이전 단계">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M14.5 5.5 8 12l6.5 6.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <span className="m-sheet__head-spacer" />
            )}
            <h2 className="m-sheet__title" id={labelledBy}>
              {title}
            </h2>
            <button type="button" className="m-sheet__close" onClick={onClose} aria-label="닫기">
              <CloseIcon size={22} />
            </button>
          </div>
        )}

        <div className="m-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
