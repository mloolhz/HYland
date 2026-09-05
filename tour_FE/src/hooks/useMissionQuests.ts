import { useEffect, useMemo, useState } from "react";
import { fetchMyMissionProgress } from "@/api/me";
import { MISSION_QUESTS, type MissionQuest } from "@/mocks/missions";
import { useSession } from "@/store/session";

/**
 * 미션 목록 + 로그인한 사용자의 실제 진행도.
 *
 * 미션 정의(제목·목표치·보상)는 아직 프론트 mock 이 단일 출처다. 진행도만
 * GET /missions/my/progress 로 덮어쓴다. 비로그인이거나 조회에 실패하면
 * mock 의 진행도를 그대로 보여준다.
 */
export function useMissionQuests(): { quests: MissionQuest[]; loading: boolean } {
  const { isLoggedIn } = useSession();
  const [progress, setProgress] = useState<Map<number, number> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setProgress(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchMyMissionProgress()
      .then((res) => {
        if (!alive) return;
        setProgress(new Map(res.items.map((i) => [i.questId, i.current])));
      })
      .catch((err: unknown) => {
        if (!alive) return;
        console.error("[missions] 진행도 조회 실패:", err);
        setProgress(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const quests = useMemo(() => {
    // 로그인 전에는 mock 진행도를 보여주지 않는다 (남의 기록처럼 보인다)
    if (!isLoggedIn) return MISSION_QUESTS.map((q) => ({ ...q, current: 0 }));
    if (!progress) return MISSION_QUESTS;
    // 서버에 기록이 없는 미션은 아직 시작 전이므로 0 으로 본다
    return MISSION_QUESTS.map((q) => ({ ...q, current: progress.get(q.id) ?? 0 }));
  }, [progress, isLoggedIn]);

  return { quests, loading };
}
