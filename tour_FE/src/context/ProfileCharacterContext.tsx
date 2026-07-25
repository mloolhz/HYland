import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PROFILE_CHARACTER_ID } from "@/data/profile-characters";
import type { CurrentIslandBtiResult, IslandBtiResultCode } from "@/types/island-bti";

type ProfileCharacterContextValue = {
  selectedCharacterId: string;
  setSelectedCharacterId: (id: string) => void;
  currentIslandBtiResult: CurrentIslandBtiResult | null;
  setCurrentIslandBtiResult: (result: CurrentIslandBtiResult | null) => void;
  /** @deprecated currentIslandBtiResult.code 파생값 — 기존 컴포넌트 호환용 */
  islandBtiResultCode: IslandBtiResultCode | null;
  isProfileSelectModalOpen: boolean;
  setProfileSelectModalOpen: (open: boolean) => void;
};

const ProfileCharacterContext = createContext<ProfileCharacterContextValue | null>(null);

export function ProfileCharacterProvider({ children }: { children: ReactNode }) {
  const [selectedCharacterId, setSelectedCharacterId] = useState(DEFAULT_PROFILE_CHARACTER_ID);
  const [currentIslandBtiResult, setCurrentIslandBtiResult] =
    useState<CurrentIslandBtiResult | null>(null);
  const [isProfileSelectModalOpen, setProfileSelectModalOpen] = useState(false);

  const islandBtiResultCode = currentIslandBtiResult?.code ?? null;

  const value = useMemo(
    () => ({
      selectedCharacterId,
      setSelectedCharacterId,
      currentIslandBtiResult,
      setCurrentIslandBtiResult,
      islandBtiResultCode,
      isProfileSelectModalOpen,
      setProfileSelectModalOpen,
    }),
    [selectedCharacterId, currentIslandBtiResult, islandBtiResultCode, isProfileSelectModalOpen],
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

export function useSetCurrentIslandBtiResult() {
  const context = useContext(ProfileCharacterContext);
  return useCallback(
    (result: CurrentIslandBtiResult | null) => {
      context?.setCurrentIslandBtiResult(result);
    },
    [context],
  );
}
