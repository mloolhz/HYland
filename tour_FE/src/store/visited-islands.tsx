/**
 * 내가 방문한 섬
 *
 * 예전에는 lib/island-data 의 ISLANDS[].visited 라는 고정값을 봤다. 지금은
 * 인증이 승인될 때 서버가 남기는 user_island_visits 를 본다.
 * 지도·상세·권역 목록이 같이 쓰므로 컨텍스트로 한 번만 조회한다.
 * 비로그인이면 빈 집합이라 전부 "미방문"으로 보인다.
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
import { fetchVisits } from "@/api/me";
import { useSession } from "@/store/session";

type VisitedStore = {
  ids: Set<string>;
  isVisited: (islandId: string | null | undefined) => boolean;
  refresh: () => Promise<void>;
};

const VisitedContext = createContext<VisitedStore | null>(null);

export function VisitedIslandsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useSession();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setIds(new Set());
      return;
    }
    try {
      const res = await fetchVisits();
      setIds(new Set(res.islands.map((i) => i.islandId)));
    } catch (err) {
      console.error("[islands] 방문 목록 조회 실패:", err);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<VisitedStore>(
    () => ({
      ids,
      isVisited: (islandId) => Boolean(islandId && ids.has(islandId)),
      refresh,
    }),
    [ids, refresh],
  );

  return <VisitedContext.Provider value={value}>{children}</VisitedContext.Provider>;
}

export function useVisitedIslands(): VisitedStore {
  const ctx = useContext(VisitedContext);
  // 컨텍스트 밖(랜딩 등)에서도 안전하게 쓰도록 빈 집합을 준다
  return ctx ?? { ids: new Set(), isVisited: () => false, refresh: async () => {} };
}
