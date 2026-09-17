import { RollingNumber } from "@/components/island/RollingNumber";
import { useBadgeStats } from "@/hooks/useBadgeStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { MyPageHeader } from "@/components/mypage/MyPageHeader";
import { MyPageLeaderboard } from "@/components/mypage/MyPageLeaderboard";
import { MyPagePassportBook } from "@/components/mypage/MyPagePassportBook";
import { MyPageSpiritGrowthSection } from "@/components/mypage/MyPageSpiritGrowthSection";
import { ISLAND_BTI } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { getLevelPercent, isMaxLevel } from "@/lib/user-profile";
import { ISLANDS } from "@/lib/island-data";
import { useVisitedIslands } from "@/store/visited-islands";

export function MyPage() {
  const profile = useUserProfile();
  // 방문 섬은 서버 기록(user_island_visits)에서 센다
  const { ids: visitedIds } = useVisitedIslands();
  const islandStats = { visited: visitedIds.size, total: ISLANDS.length };
  const badgeStats = useBadgeStats();
  const btiColors = ISLAND_BTI[profile.bti];
  const levelPercent = getLevelPercent(profile);
  const atMaxLevel = isMaxLevel(profile);

  return (
    <main className="mp-page">
      <MyPageHeader showSettingsButton />

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
                  <span className="mp-stat-value" aria-label={`획득 배지 ${badgeStats.earned}개`}>
                    <RollingNumber value={badgeStats.earned} delay={80} />
                  </span>
                  <span>획득 배지</span>
                </div>
                <div className="mp-stat-chip">
                  <span className="mp-stat-value" aria-label={`미획득 배지 ${badgeStats.unearned}개`}>
                    <RollingNumber value={badgeStats.unearned} delay={160} />
                  </span>
                  <span>미획득 배지</span>
                </div>
              </div>
            </div>

            {/* 레벨은 방문한 섬 수로 오른다 (서버 level.ts) */}
            <div className="mp-profile-exp" aria-label="다음 레벨까지">
              <div className="mp-exp-head">
                <span>{atMaxLevel ? "최고 레벨" : "다음 레벨까지"}</span>
                <b className="mp-exp-value">
                  {atMaxLevel
                    ? `방문 섬 ${profile.expCurrent}곳`
                    : `섬 ${profile.expMax - profile.expCurrent}곳`}
                </b>
              </div>
              <div
                className="mp-exp-track"
                role="progressbar"
                aria-valuenow={levelPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="다음 레벨까지 진행률"
              >
                <AnimatedWidthBar width={levelPercent} />
              </div>
            </div>

            <MyPageSpiritGrowthSection />
          </section>

          <MyPageLeaderboard />
        </div>

        <section className="mp-section mp-mission-section" aria-labelledby="mp-mission-title">
          <div className="mp-section-head">
            <div>
              <p className="mp-section-label">미션 &amp; 인증</p>
              <h2 id="mp-mission-title" className="mp-section-title">
                획득 배지
              </h2>
            </div>
          </div>

          <MyPagePassportBook profile={profile} />
        </section>
      </div>
    </main>
  );
}
