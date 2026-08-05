import { useState } from "react";
import {
  DEFAULT_PROFILE_CHARACTER_ID,
  getProfileCharacterById,
} from "@/data/profile-characters";
import { useProfileCharacter } from "@/context/ProfileCharacterContext";
import { ProfileCharacterSelectModal } from "./ProfileCharacterSelectModal";
import { ProfileCharacterVisual } from "./ProfileCharacterVisual";

export function PassportAvatarPicker() {
  const { selectedCharacterId, setSelectedCharacterId } = useProfileCharacter();
  const [modalOpen, setModalOpen] = useState(false);
  const selectedCharacter =
    getProfileCharacterById(selectedCharacterId) ??
    getProfileCharacterById(DEFAULT_PROFILE_CHARACTER_ID)!;

  return (
    <>
      <button
        type="button"
        className="passport-avatar-picker__trigger"
        aria-label="대표 프로필 변경"
        onClick={(event) => {
          event.stopPropagation();
          setModalOpen(true);
        }}
      >
        <ProfileCharacterVisual
          character={selectedCharacter}
          className="passport-avatar-picker__portrait"
          avatarOnly
        />
      </button>

      <ProfileCharacterSelectModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onApply={(characterId) => {
          setSelectedCharacterId(characterId);
          setModalOpen(false);
        }}
      />
    </>
  );
}
