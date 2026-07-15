export function LogoIcon({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#EAF3FF" />
      <rect x="16.5" y="10" width="7" height="16" rx="1.4" fill="#E14B4B" />
      <rect x="16.5" y="14" width="7" height="3.2" fill="#fff" />
      <rect x="16.5" y="20.4" width="7" height="3.2" fill="#fff" />
      <rect x="14.5" y="26" width="11" height="3" rx="1.2" fill="#2D2E6B" />
      <polygon points="20,4.5 24,10 16,10" fill="#2D2E6B" />
      <path
        d="M8 32 q4 -3 8 0 t8 0 t8 0"
        stroke="#0F5FCC"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
