import type { UserProfile } from "@/lib/user-profile";
import { PassportAvatarPicker } from "./PassportAvatarPicker";

type PassportProfileCardProps = {
  profile: UserProfile;
};

export function PassportProfileCard({ profile }: PassportProfileCardProps) {
  return (
    <div className="passport-profile-card">
      <div className="passport-profile-card__photo">
        <PassportAvatarPicker />
      </div>

      <div className="passport-profile-card__fields">
        <div className="passport-profile-card__field">
          <span className="passport-profile-card__label">Name</span>
          <span className="passport-profile-card__value passport-profile-card__value--name">
            {profile.nickname}
          </span>
        </div>
        <div className="passport-profile-card__field">
          <span className="passport-profile-card__label">Nationality</span>
          <span className="passport-profile-card__value">대한민국</span>
        </div>
        <div className="passport-profile-card__field">
          <span className="passport-profile-card__label">Rank</span>
          <span className="passport-profile-card__rank">
            Lv.{profile.level} · {profile.levelTitle}
          </span>
        </div>
      </div>
    </div>
  );
}
