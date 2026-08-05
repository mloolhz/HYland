import type { IslandStampScene } from "@/data/island-stamp-data";

/** 참고 스탬프 — 큰 라인 일러스트 (viewBox 120×80) */

type Props = { scene: IslandStampScene };

export function IslandStampIllustration({ scene }: Props) {
  return (
    <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="ivstamp__svg-art">
      {scene === "cliff" && <CliffArt />}
      {scene === "mountain" && <MountainArt />}
      {scene === "camp" && <CampArt />}
      {scene === "cycle" && <CycleArt />}
      {scene === "marine" && <MarineArt />}
      {scene === "mud" && <MudArt />}
      {scene === "lighthouse" && <LighthouseArt />}
      {scene === "village" && <VillageArt />}
      {scene === "islands" && <IslandsArt />}
      {scene === "beach" && <BeachArt />}
      {scene === "fish" && <FishArt />}
      {scene === "sunset" && <SunsetArt />}
      {scene === "anchor" && <AnchorArt />}
    </svg>
  );
}

function CliffArt() {
  return (
    <>
      <path d="M4 62 L18 28 L28 38 L38 22 L48 34 L58 18 L68 30 L78 24 L88 36 L96 62 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 62 L12 48 M22 62 L22 42 M34 62 L34 38 M48 62 L48 44 M62 62 L62 36" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M52 58 L58 52 L64 58 L70 50 L76 58" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M0 66 C15 62 30 68 45 64 C60 60 75 66 90 63 C100 61 110 64 120 62" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
    </>
  );
}

function MountainArt() {
  return (
    <>
      <path d="M8 62 L8 48 C12 44 16 46 20 42" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path d="M92 62 L92 46 C96 42 100 44 104 40" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path d="M44 62 L60 18 L76 62 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M54 62 L60 38 L66 62" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M18 62 V50 M22 62 V46 M24 62 V52 M98 62 V48 M102 62 V44" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="72" cy="24" rx="10" ry="4" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function CampArt() {
  return (
    <>
      <path d="M72 22 C74 22 76 24 76 26 C76 28 72 30 72 30 C72 30 68 28 68 26 C68 24 70 22 72 22 Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="78" cy="18" r="1.5" fill="currentColor" />
      <circle cx="84" cy="22" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="86" cy="16" r="0.8" fill="currentColor" opacity="0.5" />
      <path d="M28 62 L60 28 L92 62 H28 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M60 28 V62" stroke="currentColor" strokeWidth="1.6" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function CycleArt() {
  return (
    <>
      <path d="M8 48 C20 40 32 42 44 38 C56 34 68 38 80 34 C92 30 104 34 112 32" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d="M12 52 C18 48 26 48 32 50" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <circle cx="36" cy="56" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="82" cy="56" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M46 56 H58 L64 42 H76 L82 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="64" cy="42" r="2.5" fill="currentColor" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function MarineArt() {
  return (
    <>
      <path d="M0 58 C12 52 24 60 36 54 C48 48 60 56 72 52 C84 48 96 54 108 50 C114 48 118 52 120 50" stroke="currentColor" strokeWidth="1.6" />
      <path d="M48 56 L54 38 L60 44 L66 34 L72 56 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="60" cy="32" r="4" fill="currentColor" />
      <path d="M54 56 H66" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 64 C20 60 32 66 44 62 C56 58 68 64 80 60 C92 56 104 62 116 58" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function MudArt() {
  return (
    <>
      <path d="M0 58 C16 52 32 56 48 52 C64 48 80 54 96 50 C108 47 114 52 120 50" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="60" cy="56" rx="22" ry="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M40 56 V50 M48 56 V46 M56 56 V48 M64 56 V45 M72 56 V49 M80 56 V47" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function LighthouseArt() {
  return (
    <>
      <path d="M52 62 V34 L60 26 L68 34 V62" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 42 H72 M48 48 H72 M48 54 H72" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M56 26 L60 18 L64 26" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function VillageArt() {
  return (
    <>
      <path d="M24 62 V44 H38 V62 M44 62 V36 H58 V62 M64 62 V48 H78 V62 M84 62 V40 H98 V62" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function IslandsArt() {
  return (
    <>
      <path d="M16 58 C28 50 40 54 52 48 C64 42 76 48 88 44 C100 40 108 46 116 42" stroke="currentColor" strokeWidth="1.6" />
      <path d="M32 52 C40 46 48 48 56 44" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="36" cy="48" rx="6" ry="3" fill="currentColor" opacity="0.25" />
      <ellipse cx="80" cy="44" rx="5" ry="2.5" fill="currentColor" opacity="0.25" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function BeachArt() {
  return (
    <>
      <path d="M0 58 C14 52 28 56 42 52 C56 48 70 54 84 50 C98 46 110 52 120 48" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 58 C32 54 36 54 40 58" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="92" cy="38" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function FishArt() {
  return (
    <>
      <path d="M32 44 C44 36 60 36 72 44 C60 52 44 52 32 44 Z" stroke="currentColor" strokeWidth="2" />
      <path d="M72 44 L84 36 L84 52 L72 44 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="48" cy="42" r="2" fill="currentColor" />
      <path d="M0 58 C16 54 32 58 48 54 C64 50 80 56 96 52 C108 49 114 54 120 52" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function SunsetArt() {
  return (
    <>
      <path d="M36 58 H84" stroke="currentColor" strokeWidth="1.6" />
      <path d="M60 58 C60 46 68 38 76 38 C84 38 92 46 92 58" stroke="currentColor" strokeWidth="2" />
      <path d="M48 42 L52 46 M88 36 L92 40 M96 46 L100 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

function AnchorArt() {
  return (
    <>
      <circle cx="60" cy="28" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M60 34 V58 M44 48 C44 54 50 60 60 60 C70 60 76 54 76 48" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M48 58 L60 68 L72 58" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M0 62 H120" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    </>
  );
}
