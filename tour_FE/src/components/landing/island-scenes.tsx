import type { ReactNode } from "react";

/**
 * 섬별 고유 배경 장면 (viewBox 120×100) — 컬러 플랫 일러스트.
 * 하늘·바다 그라데이션 + 층층이 쌓인 지형 + 햇살·구름. 파스텔 톤.
 */

const C = {
  hillB: "#A9DCB2",
  hillF: "#7CC98E",
  hillL: "#57AC77",
  mtn: "#C6CFDA",
  mtnS: "#A7B4C4",
  snow: "#FFFFFF",
  pine: "#57AE79",
  pineD: "#3E9264",
  tree: "#74C58C",
  trunk: "#B9895A",
  sand: "#F0DCA6",
  sandL: "#E1C079",
  cloud: "#FFFFFF",
  cliff: "#B9C2CE",
  cliffL: "#98A5B5",
  ink: "#3C556E",
};

/* ── 요소 ── */

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
      <path
        fill={C.cloud}
        d="M-15 6 q-6 0 -6 -6 q0 -6 6 -6 q1 -7 9 -7 q7 0 8 6 q7 0 7 7 q0 6 -7 6 Z"
      />
      <path fill={C.cloud} opacity={0.85} d="M6 6 q6 0 6 -5 q0 -5 -6 -5 q-4 0 -5 4 q6 0 5 6 Z" />
    </g>
  );
}

function Sea(y: number) {
  return (
    <>
      <path fill="url(#isea)" d={`M0 ${y} q12 -4 24 0 t24 0 t24 0 t24 0 t24 0 L120 104 L0 104 Z`} />
      <path
        fill="none"
        stroke="#EAF8FF"
        strokeWidth={1.6}
        strokeLinecap="round"
        opacity={0.8}
        d={`M8 ${y + 7} h14 M40 ${y + 6} h18 M74 ${y + 8} h12 M96 ${y + 6} h14`}
      />
    </>
  );
}

function Pine(x: number, base: number, h = 24) {
  return (
    <g>
      <rect x={x - 1.6} y={base - 4} width={3.2} height={6} rx={1} fill={C.trunk} />
      <path
        fill={C.pine}
        stroke={C.pineD}
        strokeWidth={1}
        strokeLinejoin="round"
        d={`M${x} ${base - h} l7 10 l-4 0 l5 7 l-4 0 l4 6 l-18 0 l4 -6 l-4 0 l5 -7 l-4 0 Z`}
      />
    </g>
  );
}

function Tree(x: number, base: number) {
  return (
    <g>
      <rect x={x - 1.8} y={base - 8} width={3.6} height={9} rx={1.4} fill={C.trunk} />
      <circle cx={x} cy={base - 13} r={9} fill={C.tree} stroke={C.hillL} strokeWidth={1} />
    </g>
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
      <path fill={C.mtnS} d={`M${cx} ${top} L${cx + w * 0.5} ${(top + base) / 2} L${cx + w} ${base} L${cx} ${base} Z`} opacity={0.55} />
      {snow && <path fill={C.snow} d={`M${cx} ${top} l6 8 l-3 -1 l-3 2 l-3 -2 l-3 1 Z`} />}
    </g>
  );
}

function HillBack(cx: number, w: number, h: number, base: number) {
  return <path fill={C.hillB} d={`M${cx - w} ${base} Q${cx} ${base - h} ${cx + w} ${base} Z`} />;
}
function HillFront(cx: number, w: number, h: number, base: number) {
  return <path fill={C.hillF} stroke={C.hillL} strokeWidth={1} strokeLinejoin="round" d={`M${cx - w} ${base} Q${cx} ${base - h} ${cx + w} ${base} Z`} />;
}

/* ── 섬별 장면 ── */
export const ISLAND_SCENES: Record<string, ReactNode> = {
  baek: (
    <>
      {Cloud(26, 22, 0.85)}
      {Birds(82, 20)}
      <path fill={C.cliff} stroke={C.cliffL} strokeWidth={1} d="M30 82 L36 58 L42 82 Z" />
      <path fill={C.cliff} stroke={C.cliffL} strokeWidth={1} d="M50 82 L58 38 L66 60 L74 42 L82 82 Z" />
      <path fill={C.cliffL} opacity={0.5} d="M58 38 L66 60 L58 82 Z" />
      {Sea(80)}
    </>
  ),
  daech: (
    <>
      {Sun(96, 26, 8)}
      {Cloud(30, 24, 0.8)}
      {HillBack(44, 34, 24, 82)}
      {HillFront(84, 30, 18, 82)}
      {Pine(100, 70, 18)}
      {Sea(82)}
    </>
  ),
  yeonp: (
    <>
      {Cloud(90, 22, 0.85)}
      {Birds(22, 22)}
      {HillBack(50, 40, 16, 82)}
      <rect x={20} y={44} width={14} height={38} rx={2} fill="#F4F7FA" stroke={C.cliffL} strokeWidth={1} />
      <path fill="#E4534E" d="M19 44 L27 36 L35 44 Z" />
      <rect x={24.5} y={54} width={5} height={5} fill="#8FD0EA" />
      <rect x={24.5} y={64} width={5} height={5} fill="#8FD0EA" />
      <path fill="#EBCB7A" stroke={C.sandL} strokeWidth={1} d="M64 76 h26 l-6 8 h-16 z" />
      <path fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" d="M77 76 V64 L90 72" />
      {Sea(84)}
    </>
  ),
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
  gyo: (
    <>
      {Cloud(30, 26, 0.8)}
      {Sun(60, 58, 13)}
      {Birds(92, 30)}
      <path fill={C.hillF} d="M0 80 H120 L120 104 L0 104 Z" />
      <path fill="none" stroke={C.hillL} strokeWidth={1.6} opacity={0.7} d="M12 88 H50 M70 88 H108 M18 96 H46 M74 96 H102" />
    </>
  ),
  seok: (
    <>
      {Cloud(24, 20, 0.85)}
      {Birds(90, 22)}
      {HillBack(70, 30, 16, 82)}
      {Mountain(44, 30, 38, 82)}
      <path fill="#D8A24A" stroke="#B27F33" strokeWidth={1} d="M64 70 l13 -7 l13 7 z" />
      <rect x={66} y={70} width={22} height={9} fill="#EBD7A6" stroke="#C9B072" strokeWidth={1} />
      {Sea(82)}
    </>
  ),
  jang: (
    <>
      {Cloud(80, 22, 0.85)}
      {Birds(22, 24)}
      {HillBack(60, 54, 18, 78)}
      {Tree(30, 70)}
      {Tree(92, 72)}
      {Sea(82)}
    </>
  ),
  sinsi: (
    <>
      {Cloud(94, 20, 0.8)}
      {Birds(18, 22)}
      {HillFront(14, 22, 18, 78)}
      {HillFront(106, 22, 18, 78)}
      <path fill="none" stroke="#8895A6" strokeWidth={3} strokeLinecap="round" d="M32 74 Q60 50 88 74" />
      <path fill="none" stroke="#8895A6" strokeWidth={2} d="M44 68 V78 M60 58 V78 M76 68 V78" />
      {Sea(80)}
    </>
  ),
  yeongj: (
    <>
      {Cloud(96, 18, 0.8)}
      <path fill="none" stroke="#8895A6" strokeWidth={3} strokeLinecap="round" d="M28 80 V44 M92 80 V44 M0 74 H120" />
      <path fill="none" stroke="#9FAEBE" strokeWidth={1.8} d="M28 44 L6 74 M28 44 L50 74 M92 44 L70 74 M92 44 L114 74" />
      <path fill="#F0F4F8" stroke={C.cliffL} strokeWidth={1} d="M60 22 l20 6 l-20 6 l6 -6 z" />
      {Sea(78)}
    </>
  ),
  muui: (
    <>
      {Sun(96, 24, 8)}
      {Cloud(28, 22, 0.85)}
      {HillBack(40, 28, 16, 80)}
      {Mountain(74, 30, 40, 80)}
      {Pine(22, 78, 18)}
      {Sea(82)}
    </>
  ),
  yheung: (
    <>
      {Cloud(92, 20, 0.85)}
      {Birds(24, 22)}
      {HillBack(60, 60, 16, 80)}
      {Pine(18, 80, 24)}
      {Pine(34, 82, 20)}
      {Pine(48, 80, 18)}
      <path fill="#EBA24E" stroke="#C8822F" strokeWidth={1} d="M70 82 l14 -18 l14 18 z" />
      <path fill="none" stroke="#C8822F" strokeWidth={1.6} d="M84 64 V82" />
      <path fill={C.hillF} d="M0 82 H120 L120 104 L0 104 Z" />
    </>
  ),
  jawol: (
    <>
      {Sun(98, 24, 8)}
      {Cloud(26, 22, 0.9)}
      {Birds(78, 20)}
      {HillBack(26, 26, 20, 80)}
      {Mountain(66, 34, 32, 80)}
      {Pine(18, 80, 20)}
      {Pine(30, 82, 15)}
      {Sea(80)}
    </>
  ),
  seungb: (
    <>
      {Cloud(26, 22, 0.8)}
      {Sun(96, 34, 10)}
      {HillFront(52, 26, 18, 80)}
      {Pine(52, 72, 15)}
      {Sea(80)}
    </>
  ),
  ijak: (
    <>
      {Cloud(84, 20, 0.8)}
      {Birds(22, 22)}
      {Mountain(26, 20, 52, 80, false)}
      {HillFront(96, 22, 16, 80)}
      {Pine(96, 74, 13)}
      <path fill="#F0DCA6" d="M46 82 h30 l-4 6 h-22 z" opacity={0.9} />
      {Sea(84)}
    </>
  ),
  deokj: (
    <>
      {Sun(96, 24, 8)}
      {Cloud(26, 22, 0.85)}
      {HillBack(30, 24, 16, 80)}
      {Mountain(48, 28, 40, 80)}
      {Pine(92, 78, 18)}
      {Sea(82)}
    </>
  ),
  soya: (
    <>
      {Cloud(28, 22, 0.85)}
      {Birds(88, 24)}
      {HillFront(56, 40, 16, 80)}
      {Tree(56, 72)}
      {Sea(82)}
    </>
  ),
  mungap: (
    <>
      {Cloud(88, 20, 0.85)}
      {Birds(20, 22)}
      <path fill={C.cliff} stroke={C.cliffL} strokeWidth={1} d="M0 82 L14 68 L26 78 L38 66 L50 78 L58 72 L58 84 H0 Z" />
      <rect x={72} y={72} width={14} height={12} fill="#F4F7FA" stroke={C.cliffL} strokeWidth={1} />
      <path fill="#E4534E" d="M71 72 l7 -6 l7 6 z" />
      <rect x={94} y={76} width={10} height={8} fill="#F4F7FA" stroke={C.cliffL} strokeWidth={1} />
      <path fill="#E4534E" d="M93 76 l5 -4 l5 4 z" />
      {Sea(84)}
    </>
  ),
  gureop: (
    <>
      {Sun(98, 22, 9)}
      {Cloud(28, 20, 0.9)}
      {Birds(70, 20)}
      <path fill={C.hillB} d="M0 84 C26 48 62 44 120 60 L120 104 L0 104 Z" />
      <path fill={C.hillF} d="M0 92 C30 66 70 64 120 78 L120 104 L0 104 Z" />
      {Tree(98, 56)}
    </>
  ),
  default: (
    <>
      {Cloud(28, 22, 0.85)}
      {Mountain(60, 30, 40, 82)}
      {Sea(82)}
    </>
  ),
};

export function IslandScene({ islandId }: { islandId: string }) {
  return (
    <svg
      className="ivstamp__scene-svg"
      viewBox="0 0 120 100"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
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
