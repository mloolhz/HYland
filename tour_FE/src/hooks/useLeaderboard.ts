import { useEffect, useMemo, useState } from "react";
import {
  fetchCategoryLeaderboard,
  fetchLeaderboard,
  type CategoryRankRow,
  type LeaderboardRow,
} from "@/api/me";
import { MISSION_CATEGORIES, type MissionCategory } from "@/mocks/missions";
import { useSession } from "@/store/session";

/**
 * 리더보드 — 획득 배지 수 기준.
 *
 * 별도 점수를 매기지 않는다. 미션을 완료해야 배지가 나오므로 미션 화면의
 * "배지 n개" 와 순위 근거가 같고, 어떻게 나온 등수인지 설명할 것이 없다.
 */
export function useLeaderboardView(category: MissionCategory) {
  const { user } = useSession();
  const [byCategory, setByCategory] = useState<Record<string, CategoryRankRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCategoryLeaderboard()
      .then((cats) => {
        if (alive) setByCategory(cats);
      })
      .catch((err: unknown) => console.error("[leaderboard] 조회 실패:", err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /** 선택한 카테고리의 순위표 */
  const rows = useMemo(() => byCategory[category] ?? [], [byCategory, category]);

  const myRank = useMemo(
    () => (user ? (rows.find((r) => r.userId === user.id) ?? null) : null),
    [rows, user],
  );

  /**
   * 카테고리별 내 등수. 탭과 같은 순서로 항상 전부 내려준다 —
   * 배지가 없는 부문은 rank 0 으로 두고 화면에서 "–" 로 그린다.
   */
  const byCategoryAll = useMemo(
    () =>
      MISSION_CATEGORIES.map((cat) => {
        const hit = user ? byCategory[cat]?.find((r) => r.userId === user.id) : undefined;
        return { category: cat, rank: hit?.rank ?? 0, badgeCount: hit?.badgeCount ?? 0 };
      }),
    [byCategory, user],
  );

  return { rows, myRank, byCategoryAll, loading };
}

/** 전체 순위(배지 수 기준)에서의 내 자리 */
export function useOverallRank() {
  const { user } = useSession();
  const [ranking, setRanking] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchLeaderboard()
      .then((res) => {
        if (alive) setRanking(res.ranking);
      })
      .catch((err: unknown) => console.error("[leaderboard] 전체 순위 조회 실패:", err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const mine = useMemo(
    () => (user ? (ranking.find((r) => r.userId === user.id) ?? null) : null),
    [ranking, user],
  );

  return { ranking, mine, loading };
}
