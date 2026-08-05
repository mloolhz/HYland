import { getShapePaths, type StampShape } from "@/lib/passport/stamp-shapes";

export type StampVariant =
  | "baengnyeong-cliff"
  | "jawol-mountain"
  | "deokjeok-camp"
  | "yeongjong-cycle"
  | "mui-kayak"
  | "island-bti"
  | "eco-wetland"
  | "leisure-kayak"
  | "lighthouse"
  | "footprints"
  | "surf-wave"
  | "crab-mudflat"
  | "sunset"
  | "review-pen"
  | "chat-heart"
  | "shell"
  | "anchor"
  | "generic";

const LOCKED_INK = "#C5CAD1";
const FONT = "Pretendard Variable, Pretendard, Apple SD Gothic Neo, sans-serif";

export type PassportInkStampArtProps = {
  stampId: number | string;
  place: string;
  activity: string;
  variant: StampVariant;
  shape: StampShape;
  ink: string;
  acquired: boolean;
  doing?: boolean;
  hidden?: boolean;
};

function InkFilter({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-ink`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0.75" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  );
}

function StampFrame({ ink, shape, hidden }: { ink: string; shape: StampShape; hidden?: boolean }) {
  const { outer, inner, innerDash } = getShapePaths(shape);
  const sw = hidden ? 1.8 : 2.2;

  return (
    <g fill="none" stroke={ink} strokeLinecap="round" strokeLinejoin="round">
      <path d={outer} strokeWidth={sw} strokeDasharray={hidden ? "4 3" : undefined} opacity={hidden ? 0.45 : 1} />
      {inner && !hidden ? (
        <path d={inner} strokeWidth={1.2} strokeDasharray={innerDash ?? "3 2"} opacity={0.8} />
      ) : null}
    </g>
  );
}

function StampLabels({
  place,
  activity,
  ink,
  shape,
  arcId,
  hidden,
}: {
  place: string;
  activity: string;
  ink: string;
  shape: StampShape;
  arcId: string;
  hidden?: boolean;
}) {
  const { textArc } = getShapePaths(shape);
  const title = hidden ? "숨겨진 도장" : place.length > 7 ? `${place.slice(0, 7)}…` : place;
  const sub = hidden ? "???" : activity.length > 9 ? `${activity.slice(0, 9)}…` : activity;
  const opacity = hidden ? 0.4 : 1;

  return (
    <g fill={ink} opacity={opacity}>
      {textArc ? (
        <>
          <path id={arcId} d={textArc} fill="none" />
          <text fontSize="7.5" fontWeight="800" fontFamily={FONT}>
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              {title}
            </textPath>
          </text>
        </>
      ) : (
        <text x="50" y="22" textAnchor="middle" fontSize="7.5" fontWeight="800" fontFamily={FONT}>
          {title}
        </text>
      )}
      <path
        d="M22 76 Q30 72, 38 76 T54 76 T70 76 T78 76"
        fill="none"
        stroke={ink}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={0.75}
      />
      <text x="50" y="86" textAnchor="middle" fontSize="5.8" fontWeight="600" fontFamily={FONT} opacity={0.9}>
        {sub}
      </text>
    </g>
  );
}

/* ── 일러스트 (단색 실루엣) ── */
function CliffArt({ ink }: { ink: string }) {
  return (
    <g fill={ink} stroke="none">
      <circle cx="72" cy="38" r="4.5" opacity={0.85} />
      <path d="M28 68 C32 54, 36 44, 42 42 C48 40, 52 48, 56 68 Z" opacity={0.9} />
      <path d="M38 68 L38 48 C40 44, 44 42, 48 46 L48 68 Z" opacity={0.75} />
      <path d="M20 70 C36 66, 64 66, 80 70" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

function MountainArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <path d="M16 68 L30 42 L44 56 L56 36 L84 68 Z" opacity={0.88} />
      <path d="M24 68 L20 56 L16 68 Z" />
      <path d="M16 56 L22 46 L28 56 Z" opacity={0.9} />
      <path d="M66 68 L70 52 L74 68 Z" />
      <path d="M66 52 L72 42 L78 52 Z" opacity={0.9} />
    </g>
  );
}

function CampArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <path d="M66 36 C68 34, 72 36, 70 40 C68 40, 66 38, 66 36 Z" opacity={0.8} />
      <path d="M32 68 L50 44 L68 68 Z" opacity={0.92} />
      <path d="M66 68 L68 54 L70 68 Z" opacity={0.85} />
      <path d="M64 54 L68 46 L72 54 Z" opacity={0.8} />
    </g>
  );
}

function CycleArt({ ink }: { ink: string }) {
  return (
    <g fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round">
      <circle cx="34" cy="58" r="8" />
      <circle cx="66" cy="58" r="8" />
      <circle cx="34" cy="58" r="1.8" fill={ink} stroke="none" />
      <circle cx="66" cy="58" r="1.8" fill={ink} stroke="none" />
      <path d="M42 58 C46 58, 50 54, 54 50 C56 48, 60 46, 62 46" />
      <ellipse cx="58" cy="44" rx="4.5" ry="3" fill={ink} stroke="none" />
    </g>
  );
}

function JetSkiArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <ellipse cx="50" cy="58" rx="18" ry="4" opacity={0.9} />
      <circle cx="48" cy="48" r="4.5" opacity={0.88} />
      <path d="M54 54 L66 50 L70 56 L58 60 Z" opacity={0.85} />
    </g>
  );
}

function AnchorArt({ ink }: { ink: string }) {
  return (
    <g fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round">
      <path d="M50 42 L50 62" />
      <path d="M44 48 C44 45, 47 42, 50 42 C53 42, 56 45, 56 48" />
      <path d="M40 62 C44 66, 56 66, 60 62" />
    </g>
  );
}

function WetlandArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <ellipse cx="34" cy="60" rx="7" ry="3" opacity={0.85} />
      <ellipse cx="62" cy="58" rx="6" ry="2.8" opacity={0.78} />
      <path d="M30 60 C30 52, 31 44, 32 38" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M64 58 C64 50, 65 42, 66 36" fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function LighthouseArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <rect x="44" y="46" width="12" height="24" rx="1" opacity={0.9} />
      <path d="M40 46 L50 36 L60 46 Z" opacity={0.92} />
      <path d="M58 38 L70 44 L58 48 Z" opacity={0.5} />
    </g>
  );
}

function FootprintsArt({ ink }: { ink: string }) {
  return (
    <g fill={ink} opacity={0.85}>
      <ellipse cx="36" cy="54" rx="4" ry="5.5" transform="rotate(-12 36 54)" />
      <ellipse cx="46" cy="48" rx="3.5" ry="5" transform="rotate(-8 46 48)" />
      <ellipse cx="56" cy="54" rx="4" ry="5.5" transform="rotate(10 56 54)" />
      <ellipse cx="66" cy="48" rx="3.5" ry="5" transform="rotate(6 66 48)" />
    </g>
  );
}

function SurfArt({ ink }: { ink: string }) {
  return (
    <g fill="none" stroke={ink} strokeLinecap="round">
      <path d="M32 52 C40 44, 48 48, 50 56 C52 64, 60 60, 66 52" strokeWidth="2.2" />
      <circle cx="48" cy="46" r="3.5" fill={ink} stroke="none" />
    </g>
  );
}

function CrabArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <ellipse cx="50" cy="56" rx="12" ry="8" opacity={0.9} />
      <path d="M38 54 L30 50 M38 58 L28 58 M62 54 L70 50 M62 58 L72 58" fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function SunsetArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <path d="M20 62 C34 50, 66 50, 80 62" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="8" opacity={0.88} />
    </g>
  );
}

function PenArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <path d="M40 62 L54 42 L58 44 L44 64 Z" opacity={0.9} />
      <path d="M54 42 L58 40 L58 44 Z" opacity={0.7} />
    </g>
  );
}

function HeartArt({ ink }: { ink: string }) {
  return (
    <path
      d="M50 62 C42 54, 34 48, 34 42 C34 38, 38 36, 42 38 C46 40, 50 44, 50 44 C50 44, 54 40, 58 38 C62 36, 66 38, 66 42 C66 48, 58 54, 50 62 Z"
      fill={ink}
      opacity={0.88}
    />
  );
}

function ShellArt({ ink }: { ink: string }) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.8" strokeLinecap="round">
      <path d="M50 38 C38 44, 34 54, 50 62 C66 54, 62 44, 50 38 Z" fill={ink} fillOpacity={0.15} />
      <path d="M42 48 C46 52, 54 52, 58 48" />
      <path d="M44 54 C48 56, 52 56, 56 54" opacity={0.7} />
    </g>
  );
}

function GenericArt({ ink }: { ink: string }) {
  return (
    <g fill={ink}>
      <path d="M20 68 L34 44 L48 58 L60 40 L80 68 Z" opacity={0.88} />
      <circle cx="68" cy="42" r="4" opacity={0.8} />
    </g>
  );
}

function StampIcon({ variant, ink }: { variant: StampVariant; ink: string }) {
  switch (variant) {
    case "baengnyeong-cliff": return <CliffArt ink={ink} />;
    case "jawol-mountain": return <MountainArt ink={ink} />;
    case "deokjeok-camp": return <CampArt ink={ink} />;
    case "yeongjong-cycle": return <CycleArt ink={ink} />;
    case "mui-kayak": return <JetSkiArt ink={ink} />;
    case "island-bti":
    case "anchor": return <AnchorArt ink={ink} />;
    case "eco-wetland": return <WetlandArt ink={ink} />;
    case "leisure-kayak": return <SurfArt ink={ink} />;
    case "lighthouse": return <LighthouseArt ink={ink} />;
    case "footprints": return <FootprintsArt ink={ink} />;
    case "surf-wave": return <SurfArt ink={ink} />;
    case "crab-mudflat": return <CrabArt ink={ink} />;
    case "sunset": return <SunsetArt ink={ink} />;
    case "review-pen": return <PenArt ink={ink} />;
    case "chat-heart": return <HeartArt ink={ink} />;
    case "shell": return <ShellArt ink={ink} />;
    default: return <GenericArt ink={ink} />;
  }
}

/** 목업 스타일 잉크 도장 — 다양한 틀 · 곡선 텍스트 · 소인 */
export function PassportInkStampArt({
  stampId,
  place,
  activity,
  variant,
  shape,
  ink,
  acquired,
  doing = false,
  hidden = false,
}: PassportInkStampArtProps) {
  const displayInk = hidden ? LOCKED_INK : acquired || doing ? ink : LOCKED_INK;
  const filterId = `ps-${stampId}`;
  const arcId = `${filterId}-arc`;
  const strength = hidden ? 0.42 : acquired ? 0.9 : doing ? 0.72 : 0.48;
  const iconVariant = hidden ? "anchor" : acquired || doing ? variant : "anchor";

  return (
    <svg viewBox="0 0 100 100" className="passport-ink-stamp-art" aria-hidden="true">
      <InkFilter id={filterId} />
      <g filter={`url(#${filterId}-ink)`} opacity={strength}>
        <StampFrame ink={displayInk} shape={hidden ? "circle" : shape} hidden={hidden} />
        <StampLabels
          place={place}
          activity={activity}
          ink={displayInk}
          shape={hidden ? "circle" : shape}
          arcId={arcId}
          hidden={hidden}
        />
        <g transform="translate(0, 4)">
          <StampIcon variant={iconVariant} ink={displayInk} />
        </g>
      </g>
    </svg>
  );
}
