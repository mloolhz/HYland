type PassportIslandEmblemProps = {
  className?: string;
};

/** 여권 표지 중앙 엠블럼 — 바다 위에 떠 있는 두 개의 섬 */
export function PassportIslandEmblem({ className }: PassportIslandEmblemProps) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="31" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
      <circle cx="40" cy="40" r="25" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.4 3.6" opacity="0.35" />

      <circle cx="53" cy="27.5" r="5" fill="currentColor" opacity="0.6" />

      <path d="M15 52 H65" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

      <path
        d="M45 52 C46.8 47.6 49.8 44.6 53 44.6 C56.2 44.6 59.2 47.6 61 52 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d="M18 52 C20 45 24.5 39 30.5 37.6 C36 36.3 40 39.8 43 43.6 C45.2 46.4 46.8 49.2 48 52 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />

      <path
        d="M22 57 C26 54.8 30 54.8 34 57 C38 59.2 42 59.2 46 57 C50 54.8 54 54.8 58 57"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M29 62 C31.6 60.5 34.2 60.5 36.8 62 C39.4 63.5 42 63.5 44.6 62 C46.4 61 48.2 60.9 50 61.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
