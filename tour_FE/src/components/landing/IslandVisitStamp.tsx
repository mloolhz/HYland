import { useId } from "react";
import { PASSPORT_BADGES } from "@/components/landing/passport-book-data";
import { getIslandStampMeta } from "@/data/island-stamp-data";
import { IslandScene } from "./island-scenes";

function islandNameLines(name: string): string[] {
  if (!name.includes("·")) return [name];
  const parts = name.split("·");
  if (parts.length >= 3) return [`${parts[0]}·${parts[1]}`, parts.slice(2).join("·")];
  return parts;
}

function visitDate(islandName: string, earned: boolean, questIndex: number): string | null {
  if (!earned) return null;
  const match = PASSPORT_BADGES.find((b) => b.island === islandName && b.acquiredAt);
  if (match?.acquiredAt) return match.acquiredAt;
  const month = String((questIndex % 6) + 5).padStart(2, "0");
  const day = String(((questIndex * 3) % 28) + 1).padStart(2, "0");
  return `2025.${month}.${day}`;
}

type IslandVisitStampProps = {
  islandId: string;
  islandName: string;
  earned: boolean;
  doing?: boolean;
  questIndex?: number;
  size?: number;
};

export function IslandVisitStamp({
  islandId,
  islandName,
  earned,
  doing = false,
  questIndex = 0,
  size = 96,
}: IslandVisitStampProps) {
  const uid = useId().replace(/:/g, "");
  const stampSize = size;
  const meta = getIslandStampMeta(islandId, questIndex);
  const tone = earned || doing ? meta.color : "locked";
  const date = visitDate(islandName, earned, questIndex);
  const lines = islandNameLines(islandName);

  if (meta.image) {
    return (
      <div className="ivstamp-wrap" style={{ ["--iv-size" as string]: `${stampSize}px` }}>
        <img
          className={`ivstamp-photo ivstamp-photo--${tone}`}
          src={meta.image}
          alt={`${islandName} 방문 스탬프`}
          style={{ transform: `rotate(${meta.rotate}deg)` }}
          draggable={false}
        />
        {date && <time className="ivstamp__date">{date}</time>}
      </div>
    );
  }

  const inkId = `ivink-${uid}`;
  const arcId = `ivarc-${uid}`;

  return (
    <div className="ivstamp-wrap" style={{ ["--iv-size" as string]: `${stampSize}px` }}>
      <div
        className={`ivstamp ivstamp--${tone}${doing ? " ivstamp--doing" : ""}`}
        style={{ ["--iv-rotate" as string]: `${meta.rotate}deg` }}
      >
        {/* 프레임 (러버스탬프 잉크 텍스처) */}
        <svg className="ivstamp__frame" viewBox="0 0 120 132" aria-hidden="true">
          <defs>
            <filter id={inkId} x="-12%" y="-12%" width="124%" height="124%">
              <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="1" seed={questIndex + 3} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <path id={arcId} d="M 96 92 A 47 47 0 0 1 24 92" fill="none" />
          </defs>

          <g filter={`url(#${inkId})`}>
            <ellipse className="ivstamp__ring-o" cx="60" cy="66" rx="56" ry="62" />
            <ellipse className="ivstamp__ticks" cx="60" cy="66" rx="53" ry="59" />
            <ellipse className="ivstamp__ring-i" cx="60" cy="66" rx="50" ry="56" />

            <text className="ivstamp__star" x="10.5" y="70">
              ✦
            </text>
            <text className="ivstamp__star" x="109.5" y="70">
              ✦
            </text>

            <text className="ivstamp__arc-text">
              <textPath href={`#${arcId}`} startOffset="50%">
                REPUBLIC OF KOREA
              </textPath>
            </text>
          </g>
        </svg>

        {/* 배경 — 섬별 고유 장면 (글자 뒤까지 채움) */}
        <div className="ivstamp__inner">
          <div className="ivstamp__scene">
            <IslandScene islandId={islandId} />
          </div>
        </div>

        {/* 상단 — 섬 이름 (장면 위) */}
        <div className="ivstamp__head">
          {lines.map((line) => (
            <p key={line} className="ivstamp__name">
              {line}
            </p>
          ))}
        </div>
      </div>
      {date && <time className="ivstamp__date">{date}</time>}
    </div>
  );
}
