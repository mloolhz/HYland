import type { UserProfile } from "@/lib/user-profile";
import { PassportBtiCard } from "./PassportBtiCard";
import { PassportFooter } from "./PassportFooter";
import { PassportProfileCard } from "./PassportProfileCard";
import { PassportStats } from "./PassportStats";

type PassportProfilePageProps = {
  profile: UserProfile;
  titleId?: string;
};

export function PassportProfilePage({ profile, titleId }: PassportProfilePageProps) {
  return (
    <div className="passport-page passport-page--profile passport-page--left">
      <div className="passport-page__paper-texture" aria-hidden="true" />
      <div className="passport-page__paper-edge passport-page__paper-edge--left" aria-hidden="true" />

      <div className="passport-left-layout">
        <header className="passport-left-layout__zone passport-left-layout__zone--header">
          <p className="passport-page__eyebrow">ISLAND LEISURE PASSPORT</p>
          <h2 id={titleId} className="passport-page__title">
            i-바다패스
          </h2>
          <div className="passport-page__header-waves" aria-hidden="true">
            <svg viewBox="0 0 80 12" fill="none">
              <path
                d="M0 8 C8 4 12 4 20 8 C28 12 32 12 40 8 C48 4 52 4 60 8 C68 12 72 12 80 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M0 11 C8 7 12 7 20 11 C28 15 32 15 40 11 C48 7 52 7 60 11 C68 15 72 15 80 11"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity=".55"
              />
            </svg>
          </div>
        </header>

        <div className="passport-left-layout__zone passport-left-layout__zone--profile">
          <PassportProfileCard profile={profile} />
        </div>

        <div className="passport-left-layout__zone passport-left-layout__zone--stats">
          <PassportStats profile={profile} />
        </div>

        <div className="passport-left-layout__zone passport-left-layout__zone--bti">
          <PassportBtiCard allowDemoPreview />
        </div>

        <footer className="passport-left-layout__zone passport-left-layout__zone--footer">
          <PassportFooter profile={profile} />
        </footer>
      </div>
    </div>
  );
}
