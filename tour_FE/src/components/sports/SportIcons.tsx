import type { ReactNode } from "react";
import type { CategoryKey } from "@/data/sports";

type IconProps = { size?: number; className?: string };

function Svg({ size = 22, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CategoryIcon({ category, size = 28 }: { category: CategoryKey; size?: number }) {
  switch (category) {
    case "water":
      return (
        <Svg size={size}>
          <path d="M3 17c2-2 4-3 6-1s4 1 6-1 4-1 6 1" />
          <path d="M4 12h11l3-4H9l-2 4z" />
          <path d="M12 8V5" />
          <path d="M12 5l3 2M12 5l-2 3" />
        </Svg>
      );
    case "land":
      return (
        <Svg size={size}>
          <path d="M4 20l5-8 3 4 4-7 4 11" />
          <path d="M12 10V5" />
          <circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none" />
        </Svg>
      );
    case "exp":
      return (
        <Svg size={size}>
          <path d="M8 21l2-8 3 2 2-7" />
          <path d="M5 21h14" />
          <path d="M14 8l3-5 2 1-3 5" />
        </Svg>
      );
    case "heal":
      return (
        <Svg size={size}>
          <path d="M12 21c0-6 4-9 4-13a4 4 0 10-8 0c0 4 4 7 4 13z" />
          <path d="M9 10c1.5 1 3 1 6 0" />
        </Svg>
      );
  }
}

const SPORT_ICON_MAP: Record<string, (p: IconProps) => ReactNode> = {
  kayak: (p) => (
    <Svg {...p}>
      <path d="M3 14c4-3 14-3 18 0" />
      <path d="M5 14l2-3h10l2 3" />
      <path d="M12 11V6" />
    </Svg>
  ),
  wave: (p) => (
    <Svg {...p}>
      <path d="M2 14c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0" />
      <path d="M2 18c2.5-3 4.5-3 7 0s4.5 3 7 0 4.5-3 6 0" />
    </Svg>
  ),
  ship: (p) => (
    <Svg {...p}>
      <path d="M3 16l9-3 9 3-2 4H5l-2-4z" />
      <path d="M12 13V5l6 3" />
      <path d="M4 20h16" />
    </Svg>
  ),
  propeller: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M7 7l2.5 2.5M14.5 14.5L17 17M17 7l-2.5 2.5M9.5 14.5L7 17" />
    </Svg>
  ),
  mountain: (p) => (
    <Svg {...p}>
      <path d="M3 20l6.5-11 3.5 5 2.5-4L21 20z" />
      <path d="M11 14l2-2 2 2" />
    </Svg>
  ),
  bike: (p) => (
    <Svg {...p}>
      <circle cx="6.5" cy="16.5" r="3" />
      <circle cx="17.5" cy="16.5" r="3" />
      <path d="M6.5 16.5l4-8h4l3 8" />
      <path d="M10.5 8.5h4" />
    </Svg>
  ),
  tent: (p) => (
    <Svg {...p}>
      <path d="M3 20l9-14 9 14z" />
      <path d="M12 6v14" />
    </Svg>
  ),
  shovel: (p) => (
    <Svg {...p}>
      <path d="M12 3v10" />
      <path d="M9 3h6" />
      <path d="M9 13c0 4 1.5 8 3 8s3-4 3-8z" />
    </Svg>
  ),
  fish: (p) => (
    <Svg {...p}>
      <path d="M3 12c4-5 10-5 14 0-4 5-10 5-14 0z" />
      <path d="M17 12l4-3v6z" />
      <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  moon: (p) => (
    <Svg {...p}>
      <path d="M19 14.5A7.5 7.5 0 118.5 5 6 6 0 0019 14.5z" />
    </Svg>
  ),
  zipline: (p) => (
    <Svg {...p}>
      <path d="M3 6h18" />
      <path d="M6 6l5 10h3" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M17 6v4" />
    </Svg>
  ),
  wheel: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </Svg>
  ),
  sled: (p) => (
    <Svg {...p}>
      <path d="M4 16h14l2 3" />
      <path d="M6 16V9h8l2 4" />
      <path d="M4 19h13" />
    </Svg>
  ),
  trees: (p) => (
    <Svg {...p}>
      <path d="M8 20v-4" />
      <path d="M8 16l-4-6h8z" />
      <path d="M16 20v-3" />
      <path d="M16 17l-3.5-5.5h7z" />
    </Svg>
  ),
  sunset: (p) => (
    <Svg {...p}>
      <path d="M4 18h16" />
      <path d="M12 14a5 5 0 015-5" />
      <path d="M12 4v2M5 11H3M21 11h-2M6.5 6.5L5 5M17.5 6.5L19 5" />
    </Svg>
  ),
  eye: (p) => (
    <Svg {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  walk: (p) => (
    <Svg {...p}>
      <circle cx="13" cy="5" r="2" />
      <path d="M10 21l2-6 3 2 2 4" />
      <path d="M8 12l3-3 3 2 3-1" />
    </Svg>
  ),
  stars: (p) => (
    <Svg {...p}>
      <path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" />
      <path d="M18 13l.7 2.1L21 16l-2.3.7L18 19l-.7-2.3L15 16l2.3-.9z" />
    </Svg>
  ),
  home: (p) => (
    <Svg {...p}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  ),
  droplet: (p) => (
    <Svg {...p}>
      <path d="M12 3c3 4.5 6 8 6 11a6 6 0 11-12 0c0-3 3-6.5 6-11z" />
    </Svg>
  ),
};

export function SportIcon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const render = SPORT_ICON_MAP[name] ?? SPORT_ICON_MAP.wave;
  return <>{render({ size, className })}</>;
}
