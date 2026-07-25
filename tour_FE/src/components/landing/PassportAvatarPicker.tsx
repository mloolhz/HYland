import { useState } from "react";
import { PassportAvatarSelectModal } from "./PassportAvatarSelectModal";
import { PassportAvatarArt, usePassportAvatar } from "./passport-avatars";

export function PassportAvatarPicker() {
  const [avatarId, setAvatarId] = usePassportAvatar();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="passport-avatar-picker__trigger"
        aria-label="프로필 사진 변경"
        onClick={() => setModalOpen(true)}
      >
        <PassportAvatarArt id={avatarId} className="passport-avatar-picker__portrait" />
      </button>

      <PassportAvatarSelectModal
        open={modalOpen}
        currentId={avatarId}
        onCancel={() => setModalOpen(false)}
        onConfirm={(id) => {
          setAvatarId(id);
          setModalOpen(false);
        }}
      />
    </>
  );
}
