import { RollingNumber } from "@/components/island/RollingNumber";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { CountUpNumber } from "@/components/mypage/CountUpNumber";
import { MyPageHeader } from "@/components/mypage/MyPageHeader";
import { MyPageLeaderboard } from "@/components/mypage/MyPageLeaderboard";
import { MyPagePassportBook } from "@/components/mypage/MyPagePassportBook";
import { MyPageSpiritGrowthSection } from "@/components/mypage/MyPageSpiritGrowthSection";
import { ISLAND_BTI } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import {
  getCurrentUserProfile,
  getIslandVisitStats,
  getPassportExpPercent,
} from "@/lib/user-profile";
import { formatNumber } from "@/lib/landing-data";

export function MyPage() {
  const profile = getCurrentUserProfile();
  const islandStats = getIslandVisitStats();
  const btiColors = ISLAND_BTI[profile.bti];
  const expPercent = getPassportExpPercent(profile);

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
                <b className="mp-exp-value">
                  <CountUpNumber value={profile.expCurrent} delay={200} format={formatNumber} />
                  {" / "}
                  {formatNumber(profile.expMax)}
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
                <AnimatedWidthBar width={expPercent} />
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
