import type { UserProfile } from "@/lib/user-profile";

type PassportStatsProps = {
  profile: UserProfile;
};

const STAT_ITEMS = [
  {
    key: "islands" as const,
    label: "방문한 섬",
    tone: "island",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2C5.5 4 4 6 4 8.5C4 11.5 5.8 13 8 13C10.2 13 12 11.5 12 8.5C12 6 10.5 4 8 2Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 6V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "missions" as const,
    label: "완료 미션",
    tone: "mission",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 3H11L13 5V13H3V3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6 8L7.5 9.5L10 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "badges" as const,
    label: "획득 배지",
    tone: "badge",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2L9.6 5.8H13.6L10.4 8.2L11.6 12L8 9.8L4.4 12L5.6 8.2L2.4 5.8H6.4L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function PassportStats({ profile }: PassportStatsProps) {
  const values = {
    islands: profile.visitedIslandCount,
    missions: profile.completedMissions,
    badges: profile.earnedBadgeCount,
  };

  return (
    <ul className="passport-stats" aria-label="여행 기록">
      {STAT_ITEMS.map((item) => (
        <li key={item.key} className={`passport-stats__card passport-stats__card--${item.tone}`}>
          <span className="passport-stats__icon">{item.icon}</span>
          <span className="passport-stats__num">{values[item.key]}</span>
          <span className="passport-stats__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
