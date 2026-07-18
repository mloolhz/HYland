import { useEffect, useState } from "react";
import { RollingNumber } from "@/components/island/RollingNumber";
import { MyPageHeader } from "@/components/mypage/MyPageHeader";
import { MyPageIslandRecord } from "@/components/mypage/MyPageIslandRecord";
import { ISLAND_BTI } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import {
  getCurrentUserProfile,
  getIslandVisitStats,
  getLeaderboardRank,
  getPassportExpPercent,
  getUnvisitedIslands,
  getVisitedIslands,
} from "@/lib/user-profile";
import { formatNumber } from "@/lib/landing-data";
import { MISSION_BADGES, MISSION_PROGRESS } from "@/mocks/missions";
import type { LeaderboardPeriod } from "@/lib/landing-data";

const RANK_PERIODS: LeaderboardPeriod[] = ["week", "month", "all"];

function MissionProgressBar({ width, gold }: { width: number; gold?: boolean }) {
  return (
    <div className="track">
      <div className={`fill${gold ? " gold" : ""}`} style={{ width: `${width}%` }} />
    </div>
  );
}

const DASHBOARD_TABS = [
  { id: "islands", label: "섬 탐험 기록" },
  { id: "mission", label: "미션 & 인증" },
  { id: "rank", label: "리더보드" },
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number]["id"];

const TAB_TRANSITION_MS = 320;

function tabPanelClass(
  tabId: DashboardTab,
  activeTab: DashboardTab,
  leavingTab: DashboardTab | null,
  extra = "",
) {
  const isActive = activeTab === tabId;
  const isLeaving = leavingTab === tabId;
  return [
    "mp-section",
    "mp-tab-panel",
    extra,
    isActive ? "is-active" : "",
    isLeaving ? "is-leaving" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function MyPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("islands");
  const [leavingTab, setLeavingTab] = useState<DashboardTab | null>(null);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");

  const handleTabChange = (nextTab: DashboardTab) => {
    if (nextTab === activeTab || leavingTab !== null) return;

    const currentIndex = DASHBOARD_TABS.findIndex((tab) => tab.id === activeTab);
    const nextIndex = DASHBOARD_TABS.findIndex((tab) => tab.id === nextTab);
    setSlideDirection(nextIndex > currentIndex ? "forward" : "backward");
    setLeavingTab(activeTab);
    setActiveTab(nextTab);
  };

  useEffect(() => {
    if (!leavingTab) return;
    const timer = window.setTimeout(() => setLeavingTab(null), TAB_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [leavingTab, activeTab]);
  const profile = getCurrentUserProfile();
  const islandStats = getIslandVisitStats();
  const visitedIslands = getVisitedIslands();
  const unvisitedIslands = getUnvisitedIslands();
  const btiColors = ISLAND_BTI[profile.bti];
  const expPercent = getPassportExpPercent(profile);
  const monthRank = getLeaderboardRank("month");

  return (
    <main className="mp-page">
      <MyPageHeader />

      <div className={CONTAINER}>
        <div className="mp-profile-row">
          <section className="mp-section mp-profile-card" aria-label="프로필">
            <div className="mp-profile-top">
              <div className="mp-profile-summary">
                <span className="mp-avatar" aria-hidden="true">
                  {profile.nickname[0]}
                </span>
                <div className="mp-profile-copy">
                  <p className="mp-profile-name">{profile.nickname}</p>
                  <p className="mp-profile-meta">
                    <span className="mp-level-badge">Lv.{profile.level}</span>
                    <span>{profile.levelTitle}</span>
                    <span className="mp-bti" style={{ color: btiColors.text }}>
                      {profile.bti}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mp-profile-stats" aria-label="탐험 요약">
                <div className="mp-stat-chip mp-stat-chip--accent">
                  <span className="mp-stat-value" aria-label={`방문 섬 ${islandStats.visited}개`}>
                    <RollingNumber value={islandStats.visited} delay={0} />
                  </span>
                  <span>방문 섬</span>
                </div>
                <div className="mp-stat-chip">
                  <span className="mp-stat-value" aria-label={`완료 미션 ${profile.completedMissions}개`}>
                    <RollingNumber value={profile.completedMissions} delay={80} />
                  </span>
                  <span>완료 미션</span>
                </div>
                <div className="mp-stat-chip">
                  <span className="mp-stat-value" aria-label={`획득 배지 ${profile.earnedBadgeCount}개`}>
                    <RollingNumber value={profile.earnedBadgeCount} delay={160} />
                  </span>
                  <span>획득 배지</span>
                </div>
              </div>
            </div>

            <div className="mp-profile-exp" aria-label="경험치">
              <div className="mp-exp-head">
                <span>EXP</span>
                <b>
                  {formatNumber(profile.expCurrent)} / {formatNumber(profile.expMax)}
                </b>
              </div>
              <div
                className="mp-exp-track"
                role="progressbar"
                aria-valuenow={expPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="경험치 진행률"
              >
                <span className="mp-exp-fill" style={{ width: `${expPercent}%` }} />
              </div>
            </div>
          </section>
        </div>

        <div className="mp-dashboard">
          <div className="mp-tab-bar" role="tablist" aria-label="마이페이지 메뉴">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`mp-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`mp-panel-${tab.id}`}
                className={`mp-tab-btn${activeTab === tab.id ? " is-active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className={`mp-tab-panels${leavingTab ? ` is-sliding is-sliding-${slideDirection}` : ""}`}
          >
            <section
              className={tabPanelClass("islands", activeTab, leavingTab)}
              role="tabpanel"
              id="mp-panel-islands"
              aria-labelledby="mp-tab-islands"
              aria-hidden={activeTab !== "islands" && leavingTab !== "islands"}
            >
              <MyPageIslandRecord
                islandStats={islandStats}
                visitedIslands={visitedIslands}
                unvisitedIslands={unvisitedIslands}
              />
            </section>

            <section
              className={tabPanelClass("mission", activeTab, leavingTab, "mp-mission-section")}
              role="tabpanel"
              id="mp-panel-mission"
              aria-labelledby="mp-tab-mission"
              aria-hidden={activeTab !== "mission" && leavingTab !== "mission"}
            >
              <div className="mp-section-head">
                <div>
                  <p className="mp-section-label">미션 &amp; 인증</p>
                  <h2 id="mp-mission-title" className="mp-section-title">
                    획득 배지 · 진행 현황
                  </h2>
                </div>
              </div>

              <div className="mp-mission-grid">
                <div className="badge-card mp-badge-card">
                  <div className="badge-grid">
                    {MISSION_BADGES.map((badge) => (
                      <div className={`badge ${badge.state}`} key={badge.title}>
                        <span className="b-ic">
                          <i>{badge.icon}</i>
                          {badge.lock && <span className="lock">{badge.lock}</span>}
                        </span>
                        <b>{badge.title}</b>
                        <span>{badge.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="prog-card mp-prog-card">
                  <h3>📊 나의 진행 현황</h3>
                  {MISSION_PROGRESS.map((row) => (
                    <div className="bar-row" key={row.label}>
                      <div className="bl">
                        <span>{row.label}</span>
                        <b>{row.value}</b>
                      </div>
                      <MissionProgressBar width={row.width} gold={row.gold} />
                    </div>
                  ))}
                  <p className="prog-note">
                    💡 이번 주 남은 미션: <b>새로운 섬 1곳 방문하기</b>
                  </p>
                </div>
              </div>
            </section>

            <section
              className={tabPanelClass("rank", activeTab, leavingTab, "mp-rank-card")}
              role="tabpanel"
              id="mp-panel-rank"
              aria-labelledby="mp-tab-rank"
              aria-label="내 순위"
              aria-hidden={activeTab !== "rank" && leavingTab !== "rank"}
            >
              <div className="mp-section-head mp-rank-head">
                <div className="mp-rank-main">
                  <p className="mp-section-label">리더보드</p>
                  <h2 className="mp-rank-value">
                    {monthRank.periodLabel} <strong>{monthRank.rank}위</strong>
                  </h2>
                  <p className="mp-rank-points">{formatNumber(monthRank.points)} XP</p>
                </div>
                <a href="/#leaderboard" className="mp-section-link">
                  전체 리더보드 보기 →
                </a>
              </div>
              <div className="mp-rank-periods">
                {RANK_PERIODS.map((period) => {
                  const { rank, points, periodLabel } = getLeaderboardRank(period);
                  return (
                    <div key={period} className={`mp-rank-pill${period === "month" ? " is-active" : ""}`}>
                      <span>{periodLabel}</span>
                      <b>{rank}위</b>
                      <small>{formatNumber(points)} XP</small>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
