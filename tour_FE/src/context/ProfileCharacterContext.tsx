import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PROFILE_CHARACTER_ID } from "@/data/profile-characters";
import type { IslandBtiResultCode } from "@/types/island-bti";

type ProfileCharacterContextValue = {
  selectedCharacterId: string;
  setSelectedCharacterId: (id: string) => void;
  islandBtiResultCode: IslandBtiResultCode | null;
  setIslandBtiResultCode: (code: IslandBtiResultCode | null) => void;
  isProfileSelectModalOpen: boolean;
  setProfileSelectModalOpen: (open: boolean) => void;
};

const ProfileCharacterContext = createContext<ProfileCharacterContextValue | null>(null);

export function ProfileCharacterProvider({ children }: { children: ReactNode }) {
  const [selectedCharacterId, setSelectedCharacterId] = useState(DEFAULT_PROFILE_CHARACTER_ID);
  const [islandBtiResultCode, setIslandBtiResultCode] = useState<IslandBtiResultCode | null>(null);
  const [isProfileSelectModalOpen, setProfileSelectModalOpen] = useState(false);

  const value = useMemo(
    () => ({
      selectedCharacterId,
      setSelectedCharacterId,
      islandBtiResultCode,
      setIslandBtiResultCode,
      isProfileSelectModalOpen,
      setProfileSelectModalOpen,
    }),
    [selectedCharacterId, islandBtiResultCode, isProfileSelectModalOpen],
  );

  return (
    <ProfileCharacterContext.Provider value={value}>{children}</ProfileCharacterContext.Provider>
  );
}

export function useProfileCharacter() {
  const context = useContext(ProfileCharacterContext);
  if (!context) {
    throw new Error("useProfileCharacter must be used within ProfileCharacterProvider");
  }
  return context;
}

export function useOptionalProfileCharacter() {
  return useContext(ProfileCharacterContext);
}

export function useSetIslandBtiResultCode() {
  const context = useContext(ProfileCharacterContext);
  return useCallback(
    (code: IslandBtiResultCode | null) => {
      context?.setIslandBtiResultCode(code);
    },
    [context],
  );
}
