import type { ReactElement, ReactNode } from "react";
import type { IslandBtiResultCode } from "@/types/island-bti";

export type IslandBtiCharacterArtProps = {
  code: IslandBtiResultCode;
  className?: string;
};

type SpiritProps = {
  accent: string;
  body: string;
  belly: string;
  blush: string;
  dark: string;
};

/** 공통 섬 정령 베이스 — 둥근 몸 · 날개 · 볼터치 · 꼬리 */
function SpiritBase({
  body,
  accent,
  belly,
  blush,
  dark,
  children,
  eyesClosed = false,
}: SpiritProps & { children?: ReactNode; eyesClosed?: boolean }) {
  return (
    <g>
      <ellipse cx="40" cy="70" rx="20" ry="4.5" fill={dark} opacity="0.12" />
      {/* 날개 */}
      <ellipse cx="18" cy="46" rx="7" ry="10" fill={body} opacity="0.85" transform="rotate(-18 18 46)" />
      <ellipse cx="62" cy="46" rx="7" ry="10" fill={body} opacity="0.85" transform="rotate(18 62 46)" />
      {/* 몸 */}
      <ellipse cx="40" cy="48" rx="22" ry="24" fill={body} />
      <ellipse cx="40" cy="50" rx="14" ry="16" fill={belly} />
      {/* 귀/뿔 */}
      <ellipse cx="28" cy="28" rx="4" ry="5" fill={body} />
      <ellipse cx="52" cy="28" rx="4" ry="5" fill={body} />
      {/* 얼굴 */}
      <circle cx="34" cy="44" r="2.3" fill={dark} opacity={eyesClosed ? 0 : 1} />
      <circle cx="46" cy="44" r="2.3" fill={dark} opacity={eyesClosed ? 0 : 1} />
      {eyesClosed ? (
        <path d="M32 44 C34 46 36 46 38 44 M42 44 C44 46 46 46 48 44" stroke={dark} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M36 50 C38 52 42 52 44 50" stroke={dark} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      )}
      <circle cx="30" cy="48" r="2.2" fill={blush} opacity="0.45" />
      <circle cx="50" cy="48" r="2.2" fill={blush} opacity="0.45" />
      {/* 꼬리 */}
      <circle cx="40" cy="66" r="4" fill={accent} opacity="0.55" />
      {children}
    </g>
  );
}

function CharacterAWCP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <circle cx="40" cy="22" r="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="38" cy="21" r="1" fill="#F59E0B" opacity="0.5" />
      <rect x="52" y="42" width="10" height="7" rx="1.5" fill="#1F2937" />
      <circle cx="57" cy="45" r="3" fill="none" stroke="#6B7280" strokeWidth="1.2" />
    </SpiritBase>
  );
}

function CharacterAWCF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <path d="M30 24 H50 C52 20 48 16 40 16 C32 16 28 20 30 24 Z" fill="#fff" stroke={p.accent} strokeWidth="1" />
      <circle cx="40" cy="20" r="2" fill={p.accent} opacity="0.6" />
      <path d="M54 38 L62 42 L54 46 Z" fill={p.accent} opacity="0.35" />
      <circle cx="58" cy="48" r="5" fill="none" stroke="#FBBF24" strokeWidth="1.8" />
      <path d="M58 45 L58 51 M55 48 L61 48" stroke="#FBBF24" strokeWidth="1" />
    </SpiritBase>
  );
}

function CharacterAWIP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <rect x="30" y="18" width="20" height="7" rx="2" fill="#1E3A5F" />
      <rect x="32" y="16" width="16" height="3" rx="1" fill="#1E3A5F" />
      <rect x="14" y="58" width="14" height="5" rx="2" fill="#8B6914" opacity="0.7" />
      <rect x="52" y="40" width="12" height="3" rx="1" fill="#B8860B" transform="rotate(25 58 41)" />
      <circle cx="60" cy="36" r="4" fill="none" stroke="#B8860B" strokeWidth="2" />
    </SpiritBase>
  );
}

function CharacterAWIF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <circle cx="40" cy="22" r="4.5" fill="#FBBF24" />
      <rect x="28" y="40" width="24" height="3" rx="1.5" fill="#374151" opacity="0.7" />
      <rect x="30" y="52" width="14" height="10" rx="1" fill="#fff" stroke="#D1D5DB" strokeWidth="1" />
      <path d="M32 55 H42 M32 58 H40" stroke="#9CA3AF" strokeWidth="0.8" />
    </SpiritBase>
  );
}

function CharacterALCP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <circle cx="48" cy="24" r="4" fill="#F472B6" />
      <circle cx="46" cy="23" r="1.5" fill="#FBCFE8" />
      <ellipse cx="56" cy="50" rx="9" ry="11" fill="#D97706" opacity="0.85" />
      <circle cx="56" cy="42" r="5" fill="none" stroke="#92400E" strokeWidth="1.5" />
      <rect x="52" y="48" width="3" height="10" rx="1" fill="#78350F" />
    </SpiritBase>
  );
}

function CharacterALCF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <ellipse cx="40" cy="20" rx="14" ry="5" fill="#A16207" opacity="0.85" />
      <path d="M28 20 C32 16 36 18 40 16 C44 18 48 16 52 20" fill="#65A30D" opacity="0.7" />
      <circle cx="58" cy="46" r="5" fill="none" stroke="#FBBF24" strokeWidth="1.8" />
      <circle cx="58" cy="46" r="1.5" fill="#FBBF24" />
      <rect x="54" y="38" width="8" height="10" rx="2" fill="#92400E" opacity="0.65" />
    </SpiritBase>
  );
}

function CharacterALIP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <ellipse cx="40" cy="19" rx="12" ry="4.5" fill="#A16207" opacity="0.85" />
      <ellipse cx="14" cy="62" rx="8" ry="3" fill="#78716C" opacity="0.45" />
      <circle cx="56" cy="42" r="6" fill="none" stroke="#60A5FA" strokeWidth="2" />
      <line x1="50" y1="46" x2="56" y2="42" stroke="#78350F" strokeWidth="1.5" />
      <rect x="52" y="50" width="10" height="12" rx="1" fill="#86EFAC" stroke="#4ADE80" strokeWidth="0.8" />
    </SpiritBase>
  );
}

function CharacterALIF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <rect x="12" y="58" width="14" height="6" rx="2" fill="#92400E" opacity="0.55" />
      <rect x="30" y="52" width="14" height="11" rx="1" fill="#BBF7D0" stroke="#4ADE80" strokeWidth="0.8" />
      <path d="M33 55 H41 M33 58 H39" stroke="#16A34A" strokeWidth="0.7" />
    </SpiritBase>
  );
}

function CharacterBWCP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <ellipse cx="40" cy="18" rx="12" ry="5" fill="#fff" />
      <circle cx="34" cy="17" r="2" fill="#F472B6" />
      <circle cx="46" cy="17" r="2" fill="#F472B6" />
      <line x1="54" y1="38" x2="54" y2="52" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="58" cy="52" rx="5" ry="3" fill="#FBCFE8" stroke="#F472B6" strokeWidth="0.8" />
    </SpiritBase>
  );
}

/** BWCF — 물멍 놀이메이트 (서핑/물놀이) */
function CharacterBWCF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <rect x="28" y="20" width="24" height="6" rx="3" fill="#D97706" opacity="0.75" />
      <circle cx="32" cy="22" r="3" fill="#fff" opacity="0.5" stroke="#D97706" strokeWidth="0.8" />
      <circle cx="48" cy="22" r="3" fill="#fff" opacity="0.5" stroke="#D97706" strokeWidth="0.8" />
      <path d="M16 62 C28 58 52 58 64 62" stroke={p.accent} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
      <ellipse cx="40" cy="60" rx="16" ry="4" fill="#D4A574" opacity="0.85" />
      <path d="M24 60 C32 56 48 56 56 60" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </SpiritBase>
  );
}

function CharacterBWIP(p: SpiritProps) {
  return (
    <SpiritBase {...p} eyesClosed>
      <rect x="52" y="34" width="10" height="12" rx="3" fill="#92400E" opacity="0.65" />
      <rect x="50" y="42" width="10" height="7" rx="1.5" fill="#1F2937" />
      <circle cx="55" cy="45" r="2.5" fill="none" stroke="#6B7280" strokeWidth="1" />
    </SpiritBase>
  );
}

function CharacterBWIF(p: SpiritProps) {
  return (
    <SpiritBase {...p} eyesClosed>
      <ellipse cx="40" cy="62" rx="18" ry="5" fill="#fff" opacity="0.75" />
      <rect x="32" y="48" width="10" height="12" rx="2" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="35" cy="52" r="1.2" fill="#FBBF24" />
      <circle cx="38" cy="55" r="1" fill="#FBBF24" opacity="0.8" />
      <circle cx="36" cy="58" r="0.8" fill="#FBBF24" opacity="0.6" />
    </SpiritBase>
  );
}

function CharacterBLCP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <rect x="26" y="22" width="16" height="5" rx="2.5" fill="#1F2937" opacity="0.75" />
      <path d="M54 38 L62 40 L60 52 L52 50 Z" fill="#EF4444" />
      <rect x="58" y="40" width="4" height="10" rx="1" fill="#fff" />
    </SpiritBase>
  );
}

function CharacterBLCF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <rect x="28" y="20" width="24" height="4" rx="2" fill="#EF4444" opacity="0.8" />
      <rect x="48" y="44" width="14" height="10" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
      <path d="M50 46 H60 M50 49 H58 M51 52 H59" stroke="#D97706" strokeWidth="0.6" opacity="0.7" />
    </SpiritBase>
  );
}

function CharacterBLIP(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <ellipse cx="40" cy="19" rx="10" ry="4" fill="#fff" />
      <circle cx="58" cy="48" r="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.8" />
      <rect x="62" y="38" width="3" height="18" rx="1" fill="#92400E" opacity="0.6" />
      <rect x="56" y="36" width="10" height="8" rx="1" fill="#fff" stroke="#D1D5DB" strokeWidth="0.6" />
      <circle cx="58" cy="40" r="2" fill="#F97316" opacity="0.7" />
    </SpiritBase>
  );
}

function CharacterBLIF(p: SpiritProps) {
  return (
    <SpiritBase {...p}>
      <circle cx="44" cy="22" r="4.5" fill="#FBBF24" />
      <path d="M28 62 L36 58 L44 60 L52 56 L56 62 Z" fill="#FCD34D" stroke="#D97706" strokeWidth="0.8" />
      <rect x="52" y="57" width="2" height="5" fill="#EF4444" />
      <circle cx="58" cy="50" r="4" fill="#F9A8D4" opacity="0.55" />
    </SpiritBase>
  );
}

const CHARACTER_RENDERERS: Record<IslandBtiResultCode, (props: SpiritProps) => ReactElement> = {
  AWCP: CharacterAWCP,
  AWCF: CharacterAWCF,
  AWIP: CharacterAWIP,
  AWIF: CharacterAWIF,
  ALCP: CharacterALCP,
  ALCF: CharacterALCF,
  ALIP: CharacterALIP,
  ALIF: CharacterALIF,
  BWCP: CharacterBWCP,
  BWCF: CharacterBWCF,
  BWIP: CharacterBWIP,
  BWIF: CharacterBWIF,
  BLCP: CharacterBLCP,
  BLCF: CharacterBLCF,
  BLIP: CharacterBLIP,
  BLIF: CharacterBLIF,
};

/** 섬BTI 유형별 섬 정령 — 일러스트만 (유형명·설명은 results.ts) */
export function IslandBtiCharacterArt({ code, className }: IslandBtiCharacterArtProps) {
  const Render = CHARACTER_RENDERERS[code];
  const accent = "var(--ibti-character-accent, #2A5C93)";
  const body = "var(--ibti-character-body, #5BA4B8)";
  const belly = "var(--ibti-character-belly, #FFF8F0)";
  const blush = "var(--ibti-character-blush, #FCA5A5)";
  const dark = "var(--ibti-character-dark, #374151)";

  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <rect width="80" height="80" rx="16" fill="color-mix(in srgb, var(--ibti-character-accent, #2A5C93) 10%, #fff)" />
      <Render accent={accent} body={body} belly={belly} blush={blush} dark={dark} />
    </svg>
  );
}
