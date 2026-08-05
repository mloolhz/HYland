import type { ReactNode } from "react";

/**
 * 섬별 배경 장면 (viewBox 120×100) — 강화도·교동도는 풍경, 나머지는 마스코트.
 * 컬러 플랫 일러스트. 하늘/바다 그라데이션은 IslandScene 래퍼에서.
 */

const C = {
  hillB: "#A9DCB2",
  hillF: "#7CC98E",
  hillL: "#57AC77",
  mtn: "#C6CFDA",
  mtnS: "#A7B4C4",
  snow: "#FFFFFF",
  cliff: "#B9C2CE",
  cliffL: "#98A5B5",
  sandL: "#E1C079",
  ink: "#3C556E",
};

/* ── 공용 요소 ── */
function Sun(cx: number, cy: number, r = 9) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r + 5} fill="#FFEFC2" opacity={0.7} />
      <circle cx={cx} cy={cy} r={r} fill="url(#isun)" />
    </>
  );
}
function Cloud(cx: number, cy: number, s = 1) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <path fill="#FFFFFF" d="M-15 6 q-6 0 -6 -6 q0 -6 6 -6 q1 -7 9 -7 q7 0 8 6 q7 0 7 7 q0 6 -7 6 Z" />
      <path fill="#FFFFFF" opacity={0.85} d="M6 6 q6 0 6 -5 q0 -5 -6 -5 q-4 0 -5 4 q6 0 5 6 Z" />
    </g>
  );
}
function Sea(y: number) {
  return (
    <>
      <path fill="url(#isea)" d={`M0 ${y} q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 L120 104 L0 104 Z`} />
      <path fill="none" stroke="#EAF8FF" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} d={`M8 ${y + 7} h14 M40 ${y + 6} h18 M74 ${y + 8} h12 M96 ${y + 6} h14`} />
    </>
  );
}
function Birds(cx: number, cy: number) {
  return (
    <g fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" opacity={0.5}>
      <path d={`M${cx} ${cy} q4 -4 8 0 q4 -4 8 0`} />
      <path d={`M${cx + 14} ${cy + 5} q3 -3 6 0 q3 -3 6 0`} />
    </g>
  );
}
function Mountain(cx: number, w: number, top: number, base: number, snow = true) {
  return (
    <g>
      <path fill={C.mtn} stroke={C.cliffL} strokeWidth={1} strokeLinejoin="round" d={`M${cx - w} ${base} L${cx} ${top} L${cx + w} ${base} Z`} />
      <path fill={C.mtnS} opacity={0.55} d={`M${cx} ${top} L${cx + w * 0.5} ${(top + base) / 2} L${cx + w} ${base} L${cx} ${base} Z`} />
      {snow && <path fill={C.snow} d={`M${cx} ${top} l6 8 l-3 -1 l-3 2 l-3 -2 l-3 1 Z`} />}
    </g>
  );
}
function HillBack(cx: number, w: number, h: number, base: number) {
  return <path fill={C.hillB} d={`M${cx - w} ${base} Q${cx} ${base - h} ${cx + w} ${base} Z`} />;
}

/* ── 마스코트 ── */
function Crab() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path fill="none" stroke="#C7413B" strokeWidth={2.6} d="M42 62 l-11 4 M44 68 l-11 7 M78 62 l11 4 M76 68 l11 7" />
      <path fill="#E9584E" stroke="#C7413B" strokeWidth={1.6} d="M38 55 q-15 -6 -19 3 q-2 7 5 7 q-1 -5 4 -6 q4 -1 7 2 Z" />
      <path fill="#E9584E" stroke="#C7413B" strokeWidth={1.6} d="M82 55 q15 -6 19 3 q2 7 -5 7 q1 -5 -4 -6 q-4 -1 -7 2 Z" />
      <ellipse cx={60} cy={60} rx={21} ry={14} fill="#E9584E" stroke="#C7413B" strokeWidth={1.6} />
      <path fill="#F49087" opacity={0.7} d="M45 62 q15 7 30 0 q-15 5 -30 0 Z" />
      <path fill="none" stroke="#C7413B" strokeWidth={2} d="M53 50 V44 M67 50 V44" />
      <circle cx={53} cy={42} r={3.4} fill="#fff" stroke="#C7413B" strokeWidth={1} />
      <circle cx={67} cy={42} r={3.4} fill="#fff" stroke="#C7413B" strokeWidth={1} />
      <circle cx={53.6} cy={42.4} r={1.4} fill="#3A2A28" />
      <circle cx={67.6} cy={42.4} r={1.4} fill="#3A2A28" />
      <path fill="none" stroke="#C7413B" strokeWidth={1.6} d="M54 61 q6 4 12 0" />
    </g>
  );
}
function Clam() {
  return (
    <g strokeLinejoin="round">
      <path fill="#F6B9C8" stroke="#D98BA3" strokeWidth={1.6} d="M60 66 Q33 66 29 45 Q43 33 60 33 Q77 33 91 45 Q87 66 60 66 Z" />
      <path fill="none" stroke="#D98BA3" strokeWidth={1.3} d="M60 66 V37 M50 64 L46 43 M70 64 L74 43 M40 60 L41 49 M80 60 L79 49" />
      <circle cx={60} cy={62} r={3.4} fill="#fff" stroke="#D98BA3" strokeWidth={1} />
    </g>
  );
}
function Sandcastle() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path fill="#EAD08A" stroke="#CBA85A" strokeWidth={1.2} d="M18 74 q42 -7 84 0 q-42 6 -84 0 Z" />
      <rect x={30} y={46} width={14} height={28} fill="#EAD08A" stroke="#CBA85A" strokeWidth={1.4} />
      <rect x={76} y={46} width={14} height={28} fill="#EAD08A" stroke="#CBA85A" strokeWidth={1.4} />
      <rect x={48} y={52} width={24} height={22} fill="#EAD08A" stroke="#CBA85A" strokeWidth={1.4} />
      <path fill="#EAD08A" stroke="#CBA85A" strokeWidth={1.1} d="M30 46 v-4 h4 v4 M38 46 v-4 h4 v4 M76 46 v-4 h4 v4 M84 46 v-4 h4 v4 M48 52 v-4 h4 v4 M60 52 v-4 h4 v4 M68 52 v-4 h4 v4" />
      <path fill="none" stroke="#B98C4A" strokeWidth={1.4} d="M37 42 V32 M83 42 V32" />
      <path fill="#E4534E" d="M37 32 l9 3 l-9 3 Z M83 32 l9 3 l-9 3 Z" />
      <path fill="#C79A54" d="M56 74 v-9 a4 4 0 0 1 8 0 v9 Z" />
      <rect x={34} y={54} width={4} height={6} rx={1} fill="#C79A54" />
      <rect x={82} y={54} width={4} height={6} rx={1} fill="#C79A54" />
    </g>
  );
}
function CrescentMoon() {
  return (
    <g>
      <path fill="#E4534E" stroke="#C7413B" strokeWidth={1.5} strokeLinejoin="round" d="M66 26 A24 24 0 1 0 66 74 A17 24 0 1 1 66 26 Z" />
      <circle cx={52} cy={40} r={2.2} fill="#C7413B" opacity={0.4} />
      <circle cx={48} cy={52} r={1.6} fill="#C7413B" opacity={0.35} />
      <circle cx={55} cy={60} r={1.8} fill="#C7413B" opacity={0.35} />
      <path fill="#FFC83D" stroke="#E0A020" strokeWidth={1} strokeLinejoin="round" transform="translate(88 34) scale(0.7)" d="M0 -9 L2.17 -2.99 L8.56 -2.78 L3.52 1.14 L5.29 7.28 L0 3.7 L-5.29 7.28 L-3.52 1.14 L-8.56 -2.78 L-2.17 -2.99 Z" />
    </g>
  );
}
function Gull() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path fill="none" stroke="#F0A83D" strokeWidth={2} d="M55 66 V74 M65 66 V74 M52 74 h6 M62 74 h6" />
      <ellipse cx={60} cy={54} rx={15} ry={12} fill="#fff" stroke="#B4C0CE" strokeWidth={1.5} />
      <path fill="#EAF0F6" stroke="#B4C0CE" strokeWidth={1.3} d="M60 50 Q72 47 76 58 Q66 61 59 56 Z" />
      <path fill="#EAF0F6" stroke="#B4C0CE" strokeWidth={1.2} d="M46 52 Q40 62 50 62" />
      <circle cx={52} cy={38} r={9} fill="#fff" stroke="#B4C0CE" strokeWidth={1.5} />
      <circle cx={49} cy={36} r={1.6} fill="#3A3A3A" />
      <path fill="#F0A83D" stroke="#D68A28" strokeWidth={0.8} d="M43 38 l-9 2 l9 3 Z" />
    </g>
  );
}
function Deer() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path fill="none" stroke="#8A6A45" strokeWidth={2.4} d="M52 33 L50 22 M50 27 L43 23 M52 30 L46 28 M68 33 L70 22 M70 27 L77 23 M68 30 L74 28" />
      <path fill="#CE9560" stroke="#A9764A" strokeWidth={1.4} d="M50 36 L43 33 L49 41 Z M70 36 L77 33 L71 41 Z" />
      <path fill="#D89E68" stroke="#A9764A" strokeWidth={1.6} d="M49 34 Q60 29 71 34 Q73 47 60 50 Q47 47 49 34 Z" />
      <circle cx={55} cy={40} r={1.7} fill="#3A2A20" />
      <circle cx={65} cy={40} r={1.7} fill="#3A2A20" />
      <ellipse cx={60} cy={46} rx={2.6} ry={2} fill="#5C4433" />
      <path fill="#D89E68" stroke="#A9764A" strokeWidth={1.6} d="M48 54 Q60 49 74 54 Q80 64 73 72 L69 72 L67 63 L53 63 L51 72 L47 72 Q42 62 48 54 Z" />
    </g>
  );
}
function Seal() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* 동글동글 몸통 */}
      <circle cx={60} cy={56} r={19} fill="#AEB9C6" stroke="#8B97A6" strokeWidth={1.6} />
      {/* 앞지느러미 */}
      <path fill="#9FABBA" stroke="#8B97A6" strokeWidth={1.1} d="M49 66 q-4 7 2 9 q4 -1 6 -6 Z M71 66 q4 7 -2 9 q-4 -1 -6 -6 Z" />
      {/* 얼굴 */}
      <circle cx={54} cy={51} r={2.7} fill="#2F343B" />
      <circle cx={66} cy={51} r={2.7} fill="#2F343B" />
      <circle cx={55} cy={50} r={0.9} fill="#fff" />
      <circle cx={67} cy={50} r={0.9} fill="#fff" />
      <circle cx={60} cy={58} r={6} fill="#BFC8D3" />
      <ellipse cx={60} cy={56} rx={2.3} ry={1.7} fill="#5A626C" />
      <path fill="none" stroke="#8B97A6" strokeWidth={1} d="M60 58 q-3 2.5 -6 1.5 M60 58 q3 2.5 6 1.5" />
      {/* 수염 + 점 */}
      <path fill="none" stroke="#8B97A6" strokeWidth={0.7} d="M53 57 l-7 -1 M53 59 l-7 1.5 M67 57 l7 -1 M67 59 l7 1.5" />
      <circle cx={71} cy={49} r={1.6} fill="#8B97A6" opacity={0.5} />
      <circle cx={74} cy={55} r={1.4} fill="#8B97A6" opacity={0.5} />
      <circle cx={69} cy={62} r={1.3} fill="#8B97A6" opacity={0.5} />
    </g>
  );
}
function Squid() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* 상단 삼각 지느러미 */}
      <path fill="#F3C9D3" stroke="#C98BA0" strokeWidth={1.2} d="M57 33 L45 25 Q51 34 58 37 Z M63 33 L75 25 Q69 34 62 37 Z" />
      {/* 긴 원뿔 외투막 */}
      <path fill="#E8B9C6" stroke="#C98BA0" strokeWidth={1.6} d="M60 26 Q73 36 71 52 Q70 61 60 63 Q50 61 49 52 Q47 36 60 26 Z" />
      {/* 긴 다리 10개 */}
      <g fill="none" stroke="#C98BA0" strokeWidth={2.1}>
        <path d="M51 62 q-5 9 -3 15 M55 63 q-3 10 -5 15 M59 64 q-1 11 -2 16 M61 64 q1 11 2 16 M65 63 q3 10 5 15 M69 62 q5 9 3 15" />
      </g>
      {/* 긴 촉수 2개 */}
      <g fill="none" stroke="#C98BA0" strokeWidth={2.1}>
        <path d="M56 64 q-4 13 3 19" />
        <path d="M64 64 q4 13 -3 19" />
      </g>
      {/* 눈 */}
      <circle cx={54} cy={48} r={4} fill="#fff" stroke="#C98BA0" strokeWidth={1} />
      <circle cx={66} cy={48} r={4} fill="#fff" stroke="#C98BA0" strokeWidth={1} />
      <circle cx={54} cy={48} r={1.9} fill="#33272C" />
      <circle cx={66} cy={48} r={1.9} fill="#33272C" />
    </g>
  );
}
function FlyingBird() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* 펼친 날개 */}
      <path fill="#F4A34C" stroke="#D6822F" strokeWidth={1.4} d="M56 50 Q42 36 26 40 Q40 48 52 53 Z" />
      <path fill="#F0A94C" stroke="#D6822F" strokeWidth={1.4} d="M64 50 Q80 36 96 40 Q82 48 70 53 Z" />
      <path fill="none" stroke="#D6822F" strokeWidth={1} opacity={0.6} d="M34 41 l4 5 M42 43 l3 5 M82 41 l-4 5 M74 43 l-3 5" />
      {/* 몸통 (비스듬) */}
      <ellipse cx={60} cy={55} rx={10} ry={8} fill="#F4A34C" stroke="#D6822F" strokeWidth={1.5} transform="rotate(-8 60 55)" />
      <ellipse cx={58} cy={58} rx={5} ry={4} fill="#FBD9A8" />
      {/* 머리 */}
      <circle cx={69} cy={48} r={6} fill="#F4A34C" stroke="#D6822F" strokeWidth={1.4} />
      <circle cx={71} cy={47} r={1.5} fill="#3A2A20" />
      <path fill="#F5C24B" stroke="#D69A28" strokeWidth={0.8} d="M75 48 l7 1 l-6 3 Z" />
      {/* 꼬리 */}
      <path fill="#E08B34" stroke="#D6822F" strokeWidth={1.2} d="M52 60 l-10 4 l5 -9 Z" />
    </g>
  );
}
function Bicycle() {
  return (
    <g fill="none" stroke="#2E8FBE" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={40} cy={58} r={13} />
      <circle cx={80} cy={58} r={13} />
      <path d="M40 58 L54 58 L66 40 L80 58 M54 58 L64 40 H72" />
      <path d="M66 40 L63 34 H57" />
      <circle cx={66} cy={40} r={2} fill="#2E8FBE" />
    </g>
  );
}
function BigPine() {
  return (
    <g strokeLinejoin="round">
      <rect x={56} y={64} width={8} height={12} rx={2} fill="#B9895A" />
      <path fill="#57AE79" stroke="#3E9264" strokeWidth={1.4} d="M60 22 l14 20 l-8 0 l11 15 l-9 0 l10 13 l-36 0 l10 -13 l-9 0 l11 -15 l-8 0 Z" />
      <circle cx={54} cy={44} r={1.6} fill="#fff" opacity={0.7} />
      <circle cx={66} cy={52} r={1.6} fill="#fff" opacity={0.7} />
    </g>
  );
}
function Fish() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* 꼬리 */}
      <path fill="#7FC3E6" stroke="#3B82AC" strokeWidth={1.4} d="M40 54 L26 43 L31 54 L26 65 Z" />
      {/* 몸통 */}
      <path fill="#4FA9D6" stroke="#3B82AC" strokeWidth={1.6} d="M38 54 Q52 38 72 44 Q86 49 86 54 Q86 59 72 64 Q52 70 38 54 Z" />
      {/* 등지느러미 · 배지느러미 */}
      <path fill="#7FC3E6" stroke="#3B82AC" strokeWidth={1.2} d="M58 43 L62 33 L69 44 Z" />
      <path fill="#7FC3E6" stroke="#3B82AC" strokeWidth={1.2} d="M56 63 L58 71 L65 63 Z" />
      {/* 아가미 */}
      <path fill="none" stroke="#3B82AC" strokeWidth={1} opacity={0.6} d="M66 46 Q64 54 66 62" />
      {/* 눈 · 입 */}
      <circle cx={76} cy={52} r={3} fill="#fff" stroke="#3B82AC" strokeWidth={1} />
      <circle cx={77} cy={52} r={1.4} fill="#222" />
      <path fill="none" stroke="#3B82AC" strokeWidth={1.2} d="M84 56 q-3 2 -6 1" />
      {/* 물방울 */}
      <circle cx={92} cy={45} r={2} fill="#fff" opacity={0.85} />
      <circle cx={97} cy={40} r={1.4} fill="#fff" opacity={0.7} />
    </g>
  );
}
function SmilingSun() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <g stroke="#F0A83D" strokeWidth={2.6}>
        <path d="M60 20 V13 M60 79 V86 M31 49 H24 M89 49 H96 M39 28 l-5 -5 M81 28 l5 -5 M39 70 l-5 5 M81 70 l5 5" />
      </g>
      <circle cx={60} cy={49} r={19} fill="url(#isun)" stroke="#E5A430" strokeWidth={1.5} />
      <circle cx={53} cy={46} r={2} fill="#B5771E" />
      <circle cx={67} cy={46} r={2} fill="#B5771E" />
      <path fill="none" stroke="#B5771E" strokeWidth={2} d="M52 54 q8 6 16 0" />
      <circle cx={49} cy={53} r={2.2} fill="#F6B36A" opacity={0.7} />
      <circle cx={71} cy={53} r={2.2} fill="#F6B36A" opacity={0.7} />
    </g>
  );
}
function Goat() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="translate(9 1)">
      {/* 다리 */}
      <path fill="none" stroke="#2E2E36" strokeWidth={3} d="M48 60 V72 M58 62 V72 M66 62 V72 M76 60 V72" />
      {/* 몸통 */}
      <path fill="#43434D" stroke="#2E2E36" strokeWidth={1.4} d="M42 52 Q56 46 78 50 Q85 54 80 62 Q60 66 46 62 Q37 58 42 52 Z" />
      {/* 목 */}
      <path fill="#43434D" stroke="#2E2E36" strokeWidth={1.4} d="M43 55 Q35 51 31 44 L38 40 Q43 46 45 52 Z" />
      {/* 머리 (왼쪽) */}
      <path fill="#43434D" stroke="#2E2E36" strokeWidth={1.4} d="M31 44 Q22 43 21 50 Q20 57 30 57 Q39 57 40 48 Q40 42 34 41 Q31 41 31 44 Z" />
      {/* 뿔 */}
      <path fill="none" stroke="#9A8A66" strokeWidth={2.4} d="M34 41 Q33 31 41 28 M39 42 Q40 33 47 32" />
      {/* 귀 */}
      <path fill="#43434D" stroke="#2E2E36" strokeWidth={1.1} d="M40 46 l8 -1 l-4 6 Z" />
      {/* 눈·코·수염 */}
      <circle cx={29} cy={48} r={1.7} fill="#fff" />
      <circle cx={29} cy={48} r={0.9} fill="#222" />
      <ellipse cx={21} cy={50} rx={2} ry={1.6} fill="#2E2E36" />
      <path fill="none" stroke="#2E2E36" strokeWidth={2} d="M24 56 v6" />
    </g>
  );
}
function Starfish() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round" transform="translate(60 53)">
      {/* 통통한 5개 팔 (둥근 끝) */}
      <path
        fill="#F0824A"
        stroke="#D6642E"
        strokeWidth={1.8}
        d="M0 -23 Q4 -11 9 -9 Q19 -6 22 -7 Q13 1 12 6 Q11 16 14 20 Q4 13 0 13 Q-4 13 -14 20 Q-11 16 -12 6 Q-13 1 -22 -7 Q-19 -6 -9 -9 Q-4 -11 0 -23 Z"
      />
      {/* 돌기 무늬 */}
      <g fill="#FBB88A">
        <circle cx={0} cy={-11} r={1.5} />
        <circle cx={-7} cy={2} r={1.5} />
        <circle cx={7} cy={2} r={1.5} />
        <circle cx={-4} cy={9} r={1.4} />
        <circle cx={4} cy={9} r={1.4} />
        <circle cx={0} cy={0} r={1.6} />
      </g>
      {/* 얼굴 */}
      <circle cx={-4} cy={-3} r={1.8} fill="#5A2E18" />
      <circle cx={4} cy={-3} r={1.8} fill="#5A2E18" />
      <path fill="none" stroke="#5A2E18" strokeWidth={1.5} d="M-4 2 q4 3 8 0" />
    </g>
  );
}

function ThreeIslands() {
  return (
    <g strokeLinejoin="round">
      {/* 뒤(가운데) 큰 섬 */}
      <path fill="#A9DCB2" stroke="#7BBE8C" strokeWidth={1.3} d="M46 76 Q62 42 80 76 Z" />
      {/* 좌 · 우 섬 */}
      <path fill="#7CC98E" stroke="#57AC77" strokeWidth={1.4} d="M10 78 Q26 54 44 78 Z" />
      <path fill="#7CC98E" stroke="#57AC77" strokeWidth={1.4} d="M78 78 Q96 56 112 78 Z" />
      {/* 소나무 */}
      <rect x={25} y={70} width={2} height={5} fill="#8A6440" />
      <path fill="#3E9264" d="M26 60 l6 11 h-12 Z" />
      <rect x={61} y={60} width={2} height={6} fill="#8A6440" />
      <path fill="#2F7E53" d="M62 48 l7 13 h-14 Z" />
      <rect x={93} y={70} width={2} height={5} fill="#8A6440" />
      <path fill="#3E9264" d="M94 60 l6 11 h-12 Z" />
      {/* 연도교 */}
      <path fill="none" stroke="#C29AA0" strokeWidth={1.6} d="M44 78 q4 3 8 2 M78 77 q-4 3 -8 2" />
    </g>
  );
}

/* ── 섬별 장면 ── */
export const ISLAND_SCENES: Record<string, ReactNode> = {
  // 백령도 — 점박이물범
  baek: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Seal()}</>),
  // 대청도 — 오징어
  daech: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Squid()}</>),
  // 연평도 — 꽃게
  yeonp: (<>{Cloud(24, 20, 0.8)}{Birds(94, 22)}{Sea(84)}{Crab()}</>),
  // 강화도 — 풍경 (마니산 + 고인돌)
  gangh: (
    <>
      {Cloud(26, 20, 0.85)}
      {Birds(94, 22)}
      {HillBack(30, 26, 18, 82)}
      {Mountain(64, 30, 34, 82)}
      <g fill="#9AA7B6">
        <rect x={8} y={72} width={5} height={10} rx={1} />
        <rect x={26} y={72} width={5} height={10} rx={1} />
        <rect x={4} y={68} width={31} height={5} rx={1.5} />
      </g>
      {Sea(82)}
    </>
  ),
  // 교동도 — 풍경 (평야 + 일출)
  gyo: (
    <>
      {Cloud(30, 26, 0.8)}
      {Sun(60, 58, 13)}
      {Birds(92, 30)}
      <path fill={C.hillF} d="M0 80 H120 L120 104 L0 104 Z" />
      <path fill="none" stroke={C.hillL} strokeWidth={1.6} opacity={0.7} d="M12 88 H50 M70 88 H108 M18 96 H46 M74 96 H102" />
    </>
  ),
  // 석모도 — 나는 새
  seok: (<>{Cloud(26, 20, 0.85)}{Birds(96, 26)}{Sea(84)}{FlyingBird()}</>),
  // 장봉도 — 자전거
  jang: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Bicycle()}</>),
  // 신도·시도·모도 — 세 섬
  sinsi: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(88)}{ThreeIslands()}</>),
  // 영종도 — 모래성
  yeongj: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Sandcastle()}</>),
  // 무의도 — 소나무
  muui: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{BigPine()}</>),
  // 영흥도 — 물고기
  yheung: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(86)}{Fish()}</>),
  // 자월도 — 붉은 달 + 별
  jawol: (<>{Cloud(24, 24, 0.85)}{HillBack(60, 46, 14, 84)}{CrescentMoon()}{Sea(84)}</>),
  // 승봉도 — 해 (일몰 명소)
  seungb: (<>{Cloud(26, 22, 0.8)}{Birds(28, 30)}{Sea(84)}{SmilingSun()}</>),
  // 대이작도 — 풀등 위 갈매기
  ijak: (
    <>
      {Cloud(26, 22, 0.8)}
      {Gull()}
      <path fill="#F0DCA6" stroke={C.sandL} strokeWidth={1} d="M34 82 q26 -7 52 0 q-26 5 -52 0 Z" />
      {Sea(86)}
    </>
  ),
  // 덕적도 — 흑염소
  deokj: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Goat()}</>),
  // 소야도 — 불가사리
  soya: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Starfish()}</>),
  // 문갑도 — 조개
  mungap: (<>{Cloud(26, 20, 0.85)}{Birds(94, 22)}{Sea(84)}{Clam()}</>),
  // 굴업도 — 사슴
  gureop: (
    <>
      {Sun(98, 22, 9)}
      {Cloud(26, 22, 0.85)}
      {Deer()}
      <path fill={C.hillF} d="M0 78 C30 70 70 72 120 76 L120 104 L0 104 Z" />
      <path fill={C.hillB} opacity={0.7} d="M0 82 C34 76 76 78 120 82 L120 104 L0 104 Z" />
    </>
  ),
  default: (<>{Cloud(28, 22, 0.85)}{Mountain(60, 30, 40, 82)}{Sea(82)}</>),
};

export function IslandScene({ islandId }: { islandId: string }) {
  return (
    <svg className="ivstamp__scene-svg" viewBox="0 0 120 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="isky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9F6FF" />
          <stop offset="1" stopColor="#FBF3E2" />
        </linearGradient>
        <linearGradient id="isea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#84C8E8" />
          <stop offset="1" stopColor="#4F9ECC" />
        </linearGradient>
        <radialGradient id="isun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE7A0" />
          <stop offset="1" stopColor="#FFC64A" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="120" height="100" fill="url(#isky)" />
      {ISLAND_SCENES[islandId] ?? ISLAND_SCENES.default}
    </svg>
  );
}
