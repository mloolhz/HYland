import type { ReactNode } from "react";

function ZiplineBadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 5.5 22 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 8.8v3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="12.8" y="12.4" width="3.4" height="2.2" rx="0.6" fill="currentColor" />
      <circle cx="14.5" cy="16.8" r="2" fill="currentColor" />
      <path
        d="M12.4 18.6 14.5 21.2 16.6 18.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 이모지 대신 SVG로 표시하는 레저 종목 배지 아이콘 */
export const SPORT_BADGE_ICONS: Record<string, ReactNode> = {
  zip: <ZiplineBadgeIcon />,
};
