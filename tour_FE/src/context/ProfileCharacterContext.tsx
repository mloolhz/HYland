import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PROFILE_CHARACTER_ID } from "@/data/profile-characters";
import type { IslandBtiScoreMap } from "@/lib/island-bti";
import {
  appendIslandBtiResult,
  createIslandBtiResultId,
  getLatestIslandBtiResult,
  loadIslandBtiHistory,
  removeLatestIslandBtiResult,
  saveIslandBtiHistory,
} from "@/lib/island-bti-storage";
import type {
  CurrentIslandBtiResult,
  IslandBtiResultCode,
  IslandBtiResultRecord,
} from "@/types/island-bti";

type ProfileCharacterContextValue = {
  selectedCharacterId: string;
  setSelectedCharacterId: (id: string) => void;
  latestResult: IslandBtiResultRecord | null;
  history: IslandBtiResultRecord[];
  hasResult: boolean;
  saveResult: (code: IslandBtiResultCode, scores: IslandBtiScoreMap) => IslandBtiResultRecord;
  clearLatestResult: () => void;
  clearHistory: () => void;
  getResultById: (id: string) => IslandBtiResultRecord | undefined;
  /** @deprecated latestResult에서 id를 제외한 형태 — 기존 컴포넌트 호환용 */
  currentIslandBtiResult: CurrentIslandBtiResult | null;
  /** @deprecated saveResult 사용 */
  setCurrentIslandBtiResult: (result: CurrentIslandBtiResult | null) => void;
  /** @deprecated latestResult?.code — 기존 컴포넌트 호환용 */
  islandBtiResultCode: IslandBtiResultCode | null;
  isProfileSelectModalOpen: boolean;
  setProfileSelectModalOpen: (open: boolean) => void;
};

const ProfileCharacterContext = createContext<ProfileCharacterContextValue | null>(null);

function toCurrentResult(record: IslandBtiResultRecord): CurrentIslandBtiResult {
  const { id: _id, ...current } = record;
  return current;
}

export function ProfileCharacterProvider({ children }: { children: ReactNode }) {
  const [selectedCharacterId, setSelectedCharacterId] = useState(DEFAULT_PROFILE_CHARACTER_ID);
  const [history, setHistory] = useState<IslandBtiResultRecord[]>(() => loadIslandBtiHistory());
  const [isProfileSelectModalOpen, setProfileSelectModalOpen] = useState(false);

  const latestResult = useMemo(() => getLatestIslandBtiResult(history), [history]);
  const currentIslandBtiResult = useMemo(
    () => (latestResult ? toCurrentResult(latestResult) : null),
    [latestResult],
  );
  const islandBtiResultCode = latestResult?.code ?? null;
  const hasResult = latestResult !== null;

  const saveResult = useCallback(
    (code: IslandBtiResultCode, scores: IslandBtiScoreMap): IslandBtiResultRecord => {
      const record: IslandBtiResultRecord = {
        id: createIslandBtiResultId(),
        code,
        scores,
        testedAt: new Date().toISOString(),
      };

      setHistory((prev) => {
        const nextHistory = appendIslandBtiResult(prev, record);
        saveIslandBtiHistory(nextHistory);
        return nextHistory;
      });

      return record;
    },
    [],
  );

  const clearLatestResult = useCallback(() => {
    setHistory((prev) => {
      const nextHistory = removeLatestIslandBtiResult(prev);
      saveIslandBtiHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveIslandBtiHistory([]);
  }, []);

  const getResultById = useCallback(
    (id: string) => history.find((record) => record.id === id),
    [history],
  );

  /** @deprecated — saveResult 사용 */
  const setCurrentIslandBtiResult = useCallback((result: CurrentIslandBtiResult | null) => {
    if (!result) {
      setHistory((prev) => {
        const nextHistory = removeLatestIslandBtiResult(prev);
        saveIslandBtiHistory(nextHistory);
        return nextHistory;
      });
      return;
    }

    const record: IslandBtiResultRecord = {
      id: createIslandBtiResultId(),
      ...result,
    };

    setHistory((prev) => {
      const nextHistory = appendIslandBtiResult(prev, record);
      saveIslandBtiHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const value = useMemo(
    () => ({
      selectedCharacterId,
      setSelectedCharacterId,
      latestResult,
      history,
      hasResult,
      saveResult,
      clearLatestResult,
      clearHistory,
      getResultById,
      currentIslandBtiResult,
      setCurrentIslandBtiResult,
      islandBtiResultCode,
      isProfileSelectModalOpen,
      setProfileSelectModalOpen,
    }),
    [
      selectedCharacterId,
      latestResult,
      history,
      hasResult,
      saveResult,
      clearLatestResult,
      clearHistory,
      getResultById,
      currentIslandBtiResult,
      setCurrentIslandBtiResult,
      islandBtiResultCode,
      isProfileSelectModalOpen,
    ],
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

/** 섬BTI 전용 필드만 필요할 때 사용 */
export function useIslandBti() {
  const {
    latestResult,
    history,
    hasResult,
    saveResult,
    clearLatestResult,
    clearHistory,
    getResultById,
    currentIslandBtiResult,
    islandBtiResultCode,
  } = useProfileCharacter();

  return {
    latestResult,
    history,
    hasResult,
    saveResult,
    clearLatestResult,
    clearHistory,
    getResultById,
    currentIslandBtiResult,
    islandBtiResultCode,
  };
}
