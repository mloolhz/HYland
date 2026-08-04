import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { ProfileCharacterVisual } from "./ProfileCharacterVisual";
import {
  DEFAULT_PROFILE_CHARACTERS,
  getMyIslandBtiProfileCharacter,
  getProfileCharacterById,
  isProfileCharacterUnlocked,
} from "@/data/profile-characters";
import { useProfileCharacter } from "@/context/ProfileCharacterContext";
import type { ProfileCharacter } from "@/types/profile-character";

type ProfileCharacterSelectModalProps = {
  open: boolean;
  onApply: (characterId: string) => void;
  onCancel: () => void;
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 12L10 16L18 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CharacterCard({
  character,
  selected,
  onSelect,
}: {
  character: ProfileCharacter;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={[
        "profile-character-card",
        selected ? "profile-character-card--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
    >
      <div className="profile-character-card__art">
        <ProfileCharacterVisual character={character} className="profile-character-card__visual" compact />
        {selected ? (
          <span className="profile-character-card__check" aria-hidden="true">
            <CheckIcon />
          </span>
        ) : null}
      </div>
      <span className="profile-character-card__name">{character.name}</span>
      {character.islandBtiCode ? (
        <span className="profile-character-card__code">{character.islandBtiCode}</span>
      ) : null}
    </button>
  );
}

function CharacterSection({
  title,
  characters,
  draftId,
  onSelect,
}: {
  title: string;
  characters: ProfileCharacter[];
  draftId: string;
  onSelect: (id: string) => void;
}) {
  if (characters.length === 0) return null;

  return (
    <section className="profile-character-modal__section">
      <h4 className="profile-character-modal__section-title">{title}</h4>
      <div className="profile-character-modal__grid" role="listbox" aria-label={title}>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={character.id === draftId}
            onSelect={() => onSelect(character.id)}
          />
        ))}
      </div>
    </section>
  );
}

function IslandBtiEmptyPrompt({ onCancel }: { onCancel: () => void }) {
  return (
    <section className="profile-character-modal__section profile-character-modal__empty-island-bti">
      <h4 className="profile-character-modal__section-title">나의 섬BTI 캐릭터</h4>
      <div className="profile-character-modal__empty-panel">
        <p className="profile-character-modal__empty-text">
          섬BTI 검사를 완료하면 나의 여행 유형 캐릭터가 추가돼요.
        </p>
        <p className="profile-character-modal__empty-sub">
          해금된 캐릭터는 섬여권의 대표 프로필로 선택할 수 있습니다.
        </p>
        <Link
          to="/island-bti"
          className="profile-character-modal__test-link btn btn-navy"
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
        >
          섬BTI 검사하러 가기
        </Link>
      </div>
    </section>
  );
}

export function ProfileCharacterSelectModal({
  open,
  onApply,
  onCancel,
}: ProfileCharacterSelectModalProps) {
  const { selectedCharacterId, islandBtiResultCode, setProfileSelectModalOpen } = useProfileCharacter();
  const [draftId, setDraftId] = useState(selectedCharacterId);

  useEffect(() => {
    setProfileSelectModalOpen(open);
    return () => setProfileSelectModalOpen(false);
  }, [open, setProfileSelectModalOpen]);

  useEffect(() => {
    if (open) setDraftId(selectedCharacterId);
  }, [open, selectedCharacterId]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, onCancel]);

  if (!open) return null;

  const myIslandBtiCharacter = getMyIslandBtiProfileCharacter(islandBtiResultCode);
  const draftCharacter = getProfileCharacterById(draftId);
  const canApply =
    draftCharacter !== undefined &&
    isProfileCharacterUnlocked(draftCharacter, islandBtiResultCode);

  return createPortal(
    <div className="profile-character-modal" role="presentation">
      <button
        type="button"
        className="profile-character-modal__overlay"
        aria-label="대표 프로필 선택 닫기"
        onClick={onCancel}
      />
      <div
        className="profile-character-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-character-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="profile-character-modal__close"
          aria-label="닫기"
          onClick={onCancel}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <header className="profile-character-modal__head">
          <h3 id="profile-character-modal-title" className="profile-character-modal__title">
            대표 프로필 선택
          </h3>
          <p className="profile-character-modal__desc">섬여권에 표시할 캐릭터를 선택해 주세요.</p>
        </header>

        <div className="profile-character-modal__body">
          <CharacterSection
            title="기본 캐릭터"
            characters={DEFAULT_PROFILE_CHARACTERS}
            draftId={draftId}
            onSelect={setDraftId}
          />

          {myIslandBtiCharacter ? (
            <CharacterSection
              title="나의 섬BTI 캐릭터"
              characters={[myIslandBtiCharacter]}
              draftId={draftId}
              onSelect={setDraftId}
            />
          ) : (
            <IslandBtiEmptyPrompt onCancel={onCancel} />
          )}
        </div>

        <div className="profile-character-modal__actions">
          <button
            type="button"
            className="profile-character-modal__btn profile-character-modal__btn--cancel"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="profile-character-modal__btn profile-character-modal__btn--confirm"
            onClick={() => onApply(draftId)}
            disabled={!canApply}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
