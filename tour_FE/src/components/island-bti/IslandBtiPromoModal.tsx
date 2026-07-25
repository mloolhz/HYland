import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  dismissIslandBtiPromoSession,
  hideIslandBtiPromoFor24Hours,
  shouldShowIslandBtiPromo,
} from "@/lib/island-bti-promo-storage";
import "@/styles/island-bti-promo.css";

const ISLAND_BTI_INTRO_PATH = "/island-bti";

export function IslandBtiPromoModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const previousBodyOverflow = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let frameId = 0;

    const openWhenReady = () => {
      if (cancelled) return;
      if (shouldShowIslandBtiPromo()) {
        setIsOpen(true);
      }
    };

    frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(openWhenReady);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDismissSession = useCallback(() => {
    dismissIslandBtiPromoSession();
    closeModal();
  }, [closeModal]);

  const handleHideForToday = useCallback(() => {
    hideIslandBtiPromoFor24Hours();
    dismissIslandBtiPromoSession();
    closeModal();
  }, [closeModal]);

  const handleStart = useCallback(() => {
    dismissIslandBtiPromoSession();
    closeModal();
    navigate(ISLAND_BTI_INTRO_PATH);
  }, [closeModal, navigate]);

  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    previousBodyOverflow.current = prev;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow.current ?? prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    ctaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismissSession();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleDismissSession]);

  if (!isOpen) return null;

  return createPortal(
    <div className="ibti-promo-modal" role="presentation">
      <button
        type="button"
        className="ibti-promo-modal__overlay"
        aria-label="프로모션 닫기"
        tabIndex={-1}
        onClick={handleDismissSession}
      />
      <div
        className="ibti-promo-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ibti-promo-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="ibti-promo-modal__close"
          aria-label="프로모션 닫기"
          onClick={handleDismissSession}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="ibti-promo-modal__content">
          <span className="ibti-promo-modal__eyebrow">ISLAND BTI</span>
          <h2 id="ibti-promo-title" className="ibti-promo-modal__title">
            나와 꼭 맞는 인천 섬은 어디일까?
          </h2>
          <p className="ibti-promo-modal__desc">
            간단한 섬BTI 테스트로
            <br />
            나의 여행 성향과 잘 맞는 인천 섬을 찾아보세요.
          </p>
          <p className="ibti-promo-modal__meta">약 3분 소요</p>

          <div className="ibti-promo-modal__actions">
            <button
              ref={ctaRef}
              type="button"
              className="btn btn-navy ibti-promo-modal__cta"
              onClick={handleStart}
            >
              섬BTI 시작하기
            </button>
            <button
              type="button"
              className="btn btn-outline ibti-promo-modal__secondary"
              onClick={handleDismissSession}
            >
              나중에 볼게요
            </button>
          </div>

          <button
            type="button"
            className="ibti-promo-modal__snooze"
            onClick={handleHideForToday}
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
