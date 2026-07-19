import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PASSPORT_AVATAR_OPTIONS,
  PassportAvatarArt,
  type PassportAvatarId,
} from "./passport-avatars";

type PassportAvatarSelectModalProps = {
  open: boolean;
  currentId: PassportAvatarId;
  onConfirm: (id: PassportAvatarId) => void;
  onCancel: () => void;
};

export function PassportAvatarSelectModal({
  open,
  currentId,
  onConfirm,
  onCancel,
}: PassportAvatarSelectModalProps) {
  const [draftId, setDraftId] = useState(currentId);

  useEffect(() => {
    if (open) setDraftId(currentId);
  }, [open, currentId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="passport-avatar-modal" role="presentation">
      <button
        type="button"
        className="passport-avatar-modal__overlay"
        aria-label="프로필 사진 선택 닫기"
        onClick={onCancel}
      />
      <div
        className="passport-avatar-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passport-avatar-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="passport-avatar-modal-title" className="passport-avatar-modal__title">
          프로필 사진 선택
        </h3>
        <div className="passport-avatar-modal__grid" role="listbox" aria-label="프로필 사진">
          {PASSPORT_AVATAR_OPTIONS.map((option) => {
            const selected = option.id === draftId;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={option.label}
                title={option.label}
                className={`passport-avatar-modal__option${selected ? " passport-avatar-modal__option--selected" : ""}`}
                onClick={() => setDraftId(option.id)}
              >
                <PassportAvatarArt id={option.id} className="passport-avatar-modal__art" />
              </button>
            );
          })}
        </div>
        <div className="passport-avatar-modal__actions">
          <button type="button" className="passport-avatar-modal__btn passport-avatar-modal__btn--cancel" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="passport-avatar-modal__btn passport-avatar-modal__btn--confirm"
            onClick={() => onConfirm(draftId)}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
