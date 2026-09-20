/** 모바일 전용 화면에서 쓰는 선 아이콘 모음 (24px 그리드, currentColor) */

type IconProps = { size?: number };

function svgProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
    focusable: "false" as const,
  };
}

const STROKE = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HomeIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" {...STROKE} />
    </svg>
  );
}

export function IslandIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M3 18.5c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2" {...STROKE} />
      <path d="M5 16c1.7-3.8 4.2-5.8 7-5.8S17.3 12.2 19 16" {...STROKE} />
      <path d="M12 10V5m0 0c1.6 0 2.6.9 2.6 2M12 5c-1.6 0-2.6.9-2.6 2" {...STROKE} />
    </svg>
  );
}

export function LeisureIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 3.5 5.5 14H12z" {...STROKE} />
      <path d="M14 8.5 18.5 14H14z" {...STROKE} />
      <path d="M3 17.6c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4" {...STROKE} />
    </svg>
  );
}

export function CommunityIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M20 13.5a2 2 0 0 1-2 2H9l-4 3.2V6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" {...STROKE} />
      <path d="M8.8 10h6.4" {...STROKE} />
    </svg>
  );
}

export function UserIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <circle cx="12" cy="8.2" r="3.4" {...STROKE} />
      <path d="M5 19.5c0-3.3 3.1-5.6 7-5.6s7 2.3 7 5.6" {...STROKE} />
    </svg>
  );
}

export function BellIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 3.2.7 4.6 1.5 5.6H5c.8-1 1.5-2.4 1.5-5.6z" {...STROKE} />
      <path d="M10 18.4a2.1 2.1 0 0 0 4 0" {...STROKE} />
    </svg>
  );
}

export function ChevronRightIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" {...STROKE} />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M14.5 5.5 8 12l6.5 6.5" {...STROKE} />
    </svg>
  );
}

export function CloseIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" {...STROKE} />
    </svg>
  );
}

export function SafetyIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 3.6 19 6v5.6c0 4.2-2.8 7.3-7 8.8-4.2-1.5-7-4.6-7-8.8V6z" {...STROKE} />
      <path d="m9.2 11.9 2 2 3.6-3.8" {...STROKE} />
    </svg>
  );
}

export function SparkIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M12 4.2 13.6 9 18.4 10.6 13.6 12.2 12 17 10.4 12.2 5.6 10.6 10.4 9z" {...STROKE} />
      <path d="M18 16.5 18.7 18.4 20.6 19.1 18.7 19.8 18 21.7 17.3 19.8 15.4 19.1 17.3 18.4z" {...STROKE} />
    </svg>
  );
}

export function TrophyIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M7.5 4.5h9v4.2a4.5 4.5 0 0 1-9 0z" {...STROKE} />
      <path d="M7.5 6H5.2a2.4 2.4 0 0 0 2.3 3.4M16.5 6h2.3a2.4 2.4 0 0 1-2.3 3.4" {...STROKE} />
      <path d="M12 13.2v3.1M9 19.5h6M10 16.3h4v3.2h-4z" {...STROKE} />
    </svg>
  );
}

export function MenuIcon({ size = 24 }: IconProps) {
  return (
    <svg {...svgProps(size)}>
      <path d="M4.5 7h15M4.5 12h15M4.5 17h15" {...STROKE} strokeWidth={2} />
    </svg>
  );
}
