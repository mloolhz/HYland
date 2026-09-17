import { useNavigate, useLocation } from "react-router-dom";
import { MissionHubHeader } from "@/components/mission/MissionHubHeader";
import { MissionsView } from "@/pages/Missions";
import { LeaderboardView } from "@/pages/Leaderboard";

type HubView = "mission" | "leaderboard";

const TABS: { key: HubView; label: string; path: string }[] = [
  { key: "mission", label: "섬 탐험 미션", path: "/missions" },
  { key: "leaderboard", label: "리더보드", path: "/leaderboard" },
];

/** 미션 + 리더보드 통합 페이지 — 상단 토글로 전환 */
export function MissionHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const view: HubView = location.pathname.startsWith("/leaderboard") ? "leaderboard" : "mission";

  return (
    <main className="ms-page">
      <MissionHubHeader />

      <div className="container ms-hub-toolbar">
        <div className="hub-toggle" role="tablist" aria-label="미션·리더보드 전환">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={view === tab.key}
              className={view === tab.key ? "on" : ""}
              onClick={() => {
                if (view !== tab.key) navigate(tab.path);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === "mission" ? <MissionsView /> : <LeaderboardView />}
    </main>
  );
}
