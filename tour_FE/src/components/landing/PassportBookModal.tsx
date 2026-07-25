import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useOptionalProfileCharacter } from "@/context/ProfileCharacterContext";
import type { UserProfile } from "@/lib/user-profile";
import { PassportBook, type PassportBookHandle } from "./PassportBook";
import { PassportFrontCover } from "./PassportFrontCover";
import { buildBookSpreads, type BookNavState } from "./passport-book-spreads";
import { PASSPORT_BADGES } from "./passport-book-data";
import "@/styles/passport-book.css";

type PassportBookModalProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const OPEN_MS = 650;
const BOOK_SPREADS = buildBookSpreads(PASSPORT_BADGES);

const INITIAL_NAV: BookNavState = {
  spread: 0,
  totalSpreads: BOOK_SPREADS.length,
  canPrev: false,
  canNext: BOOK_SPREADS.length > 1,
  flipping: false,
};

export function PassportBookModal({ open, onClose, profile, returnFocusRef }: PassportBookModalProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [nav, setNav] = useState<BookNavState>(INITIAL_NAV);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const bookRef = useRef<PassportBookHandle>(null);
  const profileCharacterContext = useOptionalProfileCharacter();
  const isProfileSelectModalOpen = profileCharacterContext?.isProfileSelectModalOpen ?? false;

  useEffect(() => {
    if (open) {
      setMounted(true);
      setNav(INITIAL_NAV);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setExpanded(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setExpanded(false);
    const timer = window.setTimeout(() => setMounted(false), OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!expanded) return;
    closeBtnRef.current?.focus();
  }, [expanded]);

  const handleClose = useCallback(() => {
    onClose();
    window.setTimeout(() => returnFocusRef?.current?.focus(), OPEN_MS + 20);
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, handleClose]);

  if (!mounted) return null;

  const modalClass = ["passport-modal", expanded ? "passport-modal--open" : ""].filter(Boolean).join(" ");
  const bookClass = ["passport-book", expanded ? "passport-book--open" : ""].filter(Boolean).join(" ");

  return createPortal(
    <div className={modalClass} role="presentation">
      <button
        type="button"
        className="passport-modal__overlay"
        aria-label="여권 닫기"
        tabIndex={-1}
        onClick={handleClose}
      />
      <div
        className="passport-modal__stage"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={bookClass}>
          <div className="passport-book__shell">
            <div className="passport-book__frame">
              <div className="passport-book__scene">
                {expanded && (
                  <PassportBook
                    ref={bookRef}
                    spreads={BOOK_SPREADS}
                    profile={profile}
                    titleId="passport-modal-title"
                    onNavStateChange={setNav}
                  />
                )}

                <div className="passport-book__back-board" aria-hidden="true" />
                <div className="passport-book__cover-shadow" aria-hidden="true" />
                <div className="passport-book__cover">
                  <PassportFrontCover />
                </div>
              </div>
            </div>

            {expanded && (
              <div className="passport-book__controls">
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="passport-book__close"
                  aria-label="여권 닫기"
                  onClick={handleClose}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </button>

                {nav.canPrev && (
                  <button
                    type="button"
                    className="passport-book__tab passport-book__tab--prev"
                    aria-label="이전 페이지"
                    disabled={nav.flipping || isProfileSelectModalOpen}
                    onClick={() => bookRef.current?.goPrev()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 7L9 12L14 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {nav.canNext && (
                  <button
                    type="button"
                    className="passport-book__tab passport-book__tab--next"
                    aria-label="다음 페이지"
                    disabled={nav.flipping || isProfileSelectModalOpen}
                    onClick={() => bookRef.current?.goNext()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M10 7L15 12L10 17" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
