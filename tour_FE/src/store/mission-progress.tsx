/**
 * 미션 진행도 — 앱 전체가 같은 값을 보게 하는 단일 출처
 *
 * 미션 정의(제목·목표치·보상)는 아직 mocks/missions 가 들고 있지만, 진행도는
 * DB 가 정답이다. 그런데 여권 배지·랜딩 미션·리더보드가 각자 MISSION_QUESTS 의
 * 정적 current 값을 읽고 있어서 화면마다 숫자가 달랐다 (미션 탭만 DB 를 봤다).
 *
 * 여기서 한 번만 불러 컨텍스트로 내려주고, 그 값을 얹은 퀘스트 목록을 만든다.
 * 비로그인이면 진행도 0 — 남의 기록처럼 보이면 안 된다.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMyMissionProgress } from "@/api/me";
import { MISSION_QUESTS, type MissionQuest } from "@/mocks/missions";
import { useSession } from "@/store/session";

type MissionProgressStore = {
  /** 정의 + 실제 진행도가 얹힌 미션 목록 */
  quests: MissionQuest[];
  /** questId → 완료 시각 (없으면 미완료) */
  completedAt: Map<number, string>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const MissionProgressContext = createContext<MissionProgressStore | null>(null);

/** 로그인 전에는 진행도를 0 으로 둔 정의만 보여준다 */
const EMPTY_QUESTS = MISSION_QUESTS.map((q) => ({ ...q, current: 0 }));

export function MissionProgressProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession();
  const [progress, setProgress] = useState<Map<number, number> | null>(null);
  const [completedAt, setCompletedAt] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setProgress(null);
      setCompletedAt(new Map());
      return;
    }
    setLoading(true);
    try {
      const res = await fetchMyMissionProgress();
      setProgress(new Map(res.items.map((i) => [i.questId, i.current])));
      setCompletedAt(
        new Map(
          res.items
            .filter((i) => i.completedAt)
            .map((i) => [i.questId, i.completedAt as string]),
        ),
      );
    } catch (err) {
      console.error("[missions] 진행도 조회 실패:", err);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const quests = useMemo(() => {
    if (!isLoggedIn || !progress) return EMPTY_QUESTS;
    // 서버에 기록이 없는 미션은 아직 시작 전이다
    return MISSION_QUESTS.map((q) => ({ ...q, current: progress.get(q.id) ?? 0 }));
  }, [isLoggedIn, progress]);

  const value = useMemo<MissionProgressStore>(
    () => ({ quests, completedAt, loading, refresh }),
    [quests, completedAt, loading, refresh],
  );

  return (
    <MissionProgressContext.Provider value={value}>{children}</MissionProgressContext.Provider>
  );
}

export function useMissionProgress(): MissionProgressStore {
  const ctx = useContext(MissionProgressContext);
  // 컨텍스트 밖에서도 안전하게 (진행도 0 인 정의만 준다)
  return (
    ctx ?? {
      quests: EMPTY_QUESTS,
      completedAt: new Map(),
      loading: false,
      refresh: async () => {},
    }
  );
}
