import type { UserProfile } from "@/lib/user-profile";

import { PassportAvatarPicker } from "@/components/landing/PassportAvatarPicker";
import { PassportBtiCard } from "@/components/landing/PassportBtiCard";
import { formatIssuedDate, formatPassportNo } from "@/components/landing/passport-book-data";

type MyPagePassportProfilePageProps = {
  profile: UserProfile;
  titleId?: string;
};

export function MyPagePassportProfilePage({ profile, titleId }: MyPagePassportProfilePageProps) {
  return (
    <div className="passport-page passport-page--left passport-page--mypage">
      <div className="passport-page__scroll">
        <div className="passport-page__head">
          <div>
            <p className="passport-page__kicker">ISLAND PASSPORT</p>
            <h2 id={titleId} className="passport-page__title">
              섬 여권
            </h2>
          </div>
          <svg className="passport-page__anchor" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path d="M5 14H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <div className="passport-page__profile-row">
          <PassportAvatarPicker />
          <div className="passport-page__profile-meta">
            <p className="passport-page__nickname">{profile.nickname}님</p>
            <div className="passport-page__badges">
              <span className="passport-page__level">Lv.{profile.level}</span>
              <span className="passport-page__rank">{profile.levelTitle}</span>
            </div>
          </div>
        </div>

        <ul className="passport-page__stat-list">
          <li>
            <span className="passport-page__stat-icon passport-page__stat-icon--island" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 18L8 10L12 14L16 8L20 18H4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="passport-page__stat-label">방문한 섬</span>
            <span className="passport-page__stat-value">{profile.visitedIslandCount}</span>
          </li>
          <li>
            <span className="passport-page__stat-icon passport-page__stat-icon--mission" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 5H19V19H5V5Z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 9H15M9 13H15M9 17H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="passport-page__stat-label">완료한 미션</span>
            <span className="passport-page__stat-value">{profile.completedMissions}</span>
          </li>
          <li>
            <span className="passport-page__stat-icon passport-page__stat-icon--badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8V12L14.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="passport-page__stat-label">획득한 배지</span>
            <span className="passport-page__stat-value">{profile.earnedBadgeCount}</span>
          </li>
        </ul>

        <div className="passport-page__bti">
          <PassportBtiCard allowDemoPreview />
        </div>
      </div>

      <div className="passport-page__meta">
        <div>
          <p>PASSPORT NO. {formatPassportNo(profile)}</p>
          <p>ISSUED DATE {formatIssuedDate(profile.joinedAt)}</p>
          <p>ISSUED BY INCHEON LEISURE NURI</p>
        </div>
        <div className="passport-page__seal" aria-hidden="true">
          <span>ILN</span>
        </div>
      </div>
    </div>
  );
}
