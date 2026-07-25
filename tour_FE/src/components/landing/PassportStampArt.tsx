import type { PassportBadge } from "./passport-book-data";
import { getBadgeInkColor } from "./passport-book-data";

type PassportStampArtProps = {
  badge: PassportBadge;
  acquired: boolean;
};

export type StampVariant =
  | "baengnyeong-cliff"
  | "jawol-mountain"
  | "deokjeok-camp"
  | "yeongjong-cycle"
  | "mui-kayak"
  | "island-bti"
  | "generic";

const LOCKED_INK = "#727882";
const LOCKED_OPACITY = 0.46;

function getStampVariant(island: string): StampVariant {
  switch (island) {
    case "백령도":
      return "baengnyeong-cliff";
    case "자월도":
      return "jawol-mountain";
    case "덕적도":
      return "deokjeok-camp";
    case "영종도":
      return "yeongjong-cycle";
    case "무의도":
      return "mui-kayak";
    case "섬BTI":
      return "island-bti";
    default:
      return "generic";
  }
}

function InkFilters({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-bleed`} x="-6%" y="-6%" width="112%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="noise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="1.2"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  );
}

function DistressedRings({ ink, acquired }: { ink: string; acquired: boolean }) {
  const base = acquired ? 1 : LOCKED_OPACITY;
  return (
    <>
      <ellipse
        cx="60"
        cy="58"
        rx="50"
        ry="48"
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeDasharray="16 5 4 6 9 4"
        opacity={base * 0.92}
      />
      <ellipse
        cx="60"
        cy="58"
        rx="50"
        ry="48"
        fill="none"
        stroke={ink}
        strokeWidth="2.6"
        strokeDasharray="7 9 5 11"
        strokeDashoffset="8"
        opacity={base * 0.5}
      />
      <ellipse
        cx="60"
        cy="58"
        rx="41"
        ry="39"
        fill="none"
        stroke={ink}
        strokeWidth="1.8"
        strokeDasharray="10 4 3 5"
        opacity={base * 0.78}
      />
    </>
  );
}

/** 관광 기념 도장 실루엣 — 섬별 2~3개 큰 형태 */
function StampLandscape({ variant, ink }: { variant: StampVariant; ink: string }) {
  switch (variant) {
    case "baengnyeong-cliff":
      return (
        <g fill={ink} stroke={ink}>
          <path d="M18 70 L18 34 L46 24 L46 70 Z" opacity="0.93" stroke="none" />
          <path
            d="M14 74 C26 68 38 76 54 70 C68 64 82 72 98 66"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.86"
          />
          <path
            d="M72 30 L78 34 L84 30"
            fill="none"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.72"
          />
        </g>
      );
    case "jawol-mountain":
      return (
        <g fill={ink} stroke={ink}>
          <path d="M24 70 L54 26 L84 70 Z" opacity="0.92" stroke="none" />
          <path d="M66 70 L72 44 L78 70 Z" opacity="0.88" stroke="none" />
          <rect x="70" y="56" width="5" height="14" opacity="0.82" stroke="none" />
        </g>
      );
    case "deokjeok-camp":
      return (
        <g fill={ink} stroke={ink}>
          <path d="M28 70 L56 32 L84 70 Z" opacity="0.9" stroke="none" />
          <circle cx="78" cy="36" r="9" fill="none" strokeWidth="3" opacity="0.75" />
          <rect x="53" y="46" width="6" height="24" opacity="0.84" stroke="none" />
        </g>
      );
    case "yeongjong-cycle":
      return (
        <g fill={ink} stroke={ink}>
          <circle cx="34" cy="58" r="12" fill="none" strokeWidth="4" opacity="0.88" />
          <circle cx="70" cy="58" r="12" fill="none" strokeWidth="4" opacity="0.88" />
          <path
            d="M46 58 H58 L66 38 H90"
            fill="none"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.86"
          />
          <path
            d="M12 74 C28 68 44 74 60 70 C76 66 92 72 108 66"
            fill="none"
            strokeWidth="3.4"
            strokeLinecap="round"
            opacity="0.62"
          />
        </g>
      );
    case "mui-kayak":
      return (
        <g fill={ink} stroke={ink}>
          <ellipse cx="56" cy="54" rx="24" ry="7" opacity="0.88" stroke="none" />
          <path
            d="M12 74 C24 66 38 74 54 68 C70 62 84 70 100 64"
            fill="none"
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M18 78 C32 72 46 78 60 74"
            fill="none"
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      );
    case "island-bti":
      return (
        <g fill={ink} stroke={ink}>
          <circle cx="56" cy="50" r="18" fill="none" strokeWidth="3.2" opacity="0.72" />
          <path d="M56 34 L60 48 L52 48 Z" opacity="0.92" stroke="none" />
          <path d="M56 48 V62" strokeWidth="3.6" strokeLinecap="round" opacity="0.88" />
          <path d="M44 50 H68" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
        </g>
      );
    default:
      return (
        <g fill={ink} stroke={ink}>
          <path d="M26 70 L54 32 L82 70 Z" opacity="0.88" stroke="none" />
          <path
            d="M14 76 C30 70 46 76 62 72 C78 68 94 74 106 70"
            fill="none"
            strokeWidth="3.6"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>
      );
  }
}

function InkLandscape({ variant, ink, filterId }: { variant: StampVariant; ink: string; filterId: string }) {
  return (
    <g filter={`url(#${filterId}-bleed)`}>
      <g opacity="0.28" transform="translate(0.6, 0.8)">
        <StampLandscape variant={variant} ink={ink} />
      </g>
      <StampLandscape variant={variant} ink={ink} />
    </g>
  );
}

function LockedSlot({ island, ink }: { island: string; ink: string }) {
  return (
    <g fill={ink} stroke={ink}>
      <text x="60" y="26" textAnchor="middle" fill={ink} fontSize="10" fontWeight="800" opacity="0.76">
        {island}
      </text>
      <circle cx="60" cy="48" r="5" fill={ink} stroke="none" opacity="0.58" />
      <path d="M60 53 V64" fill="none" strokeWidth="2.8" strokeLinecap="round" opacity="0.58" />
      <path
        d="M51 57 C51 60.5 55 63 60 63 C65 63 69 60.5 69 57"
        fill="none"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.58"
      />
      <text x="60" y="92" textAnchor="middle" fill={ink} fontSize="9" fontWeight="700" opacity="0.7">
        미획득
      </text>
    </g>
  );
}

/** 관광 기념 도장 — 상단 섬명 · 중앙 풍경 · 하단 활동명 */
export function PassportStampArt({ badge, acquired }: PassportStampArtProps) {
  const ink = acquired ? getBadgeInkColor(badge) : LOCKED_INK;
  const variant = getStampVariant(badge.island);
  const filterId = `stamp-${badge.id}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className="passport-stamp-art"
      aria-hidden="true"
      role="presentation"
    >
      <InkFilters id={filterId} />

      <g>
        <DistressedRings ink={ink} acquired={acquired} />

        {acquired ? (
          <>
            <text x="60" y="24" textAnchor="middle" fill={ink} fontSize="10" fontWeight="800" opacity="0.88">
              {badge.island}
            </text>
            <g transform="translate(0, 2)">
              <InkLandscape variant={variant} ink={ink} filterId={filterId} />
            </g>
            <text x="60" y="96" textAnchor="middle" fill={ink} fontSize="9" fontWeight="800" opacity="0.82">
              {badge.activity}
            </text>
          </>
        ) : (
          <LockedSlot island={badge.island} ink={ink} />
        )}
      </g>
    </svg>
  );
}
