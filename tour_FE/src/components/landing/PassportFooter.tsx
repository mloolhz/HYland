import type { UserProfile } from "@/lib/user-profile";
import { formatIssuedDate, formatPassportNo } from "./passport-book-data";

type PassportFooterProps = {
  profile: UserProfile;
};

export function PassportFooter({ profile }: PassportFooterProps) {
  return (
    <footer className="passport-page-footer">
      <span className="passport-page-footer__no">No. {formatPassportNo(profile)}</span>
      <span className="passport-page-footer__issued">발급 {formatIssuedDate(profile.joinedAt)}</span>
    </footer>
  );
}
