/** 섬 이름 스탬프 텍스트 아트 — SVG 그라데이션·양각 처리 (이미지형 타이포) */

function islandNameLines(name: string): string[] {
  if (!name.includes("·")) return [name];
  const parts = name.split("·");
  if (parts.length >= 3) return [`${parts[0]}·${parts[1]}`, parts.slice(2).join("·")];
  return parts;
}

function islandStampTypography(name: string, lineCount: number) {
  const len = name.replace(/·/g, "").length;
  const longestLine = Math.max(...islandNameLines(name).map((line) => line.length));

  let fontSize = 22;
  if (longestLine >= 6 || len >= 7) fontSize = 13.5;
  else if (longestLine >= 5 || len >= 5) fontSize = 16.5;
  else if (longestLine >= 4) fontSize = 18.5;

  if (lineCount > 1) fontSize -= 1;

  const lineHeight = fontSize * 1.22;
  const startY = 50 - ((lineCount - 1) * lineHeight) / 2 + fontSize * 0.34;
  const ruleY1 = startY - fontSize * 0.95;
  const ruleY2 = startY + (lineCount - 1) * lineHeight + fontSize * 0.62;

  return { fontSize, lineHeight, startY, ruleY1, ruleY2 };
}

type IslandStampNameArtProps = {
  questId: number;
  islandName: string;
  foilColor: string;
  /** 장식 라인 Y 좌표 (viewBox 0 0 100 100) */
  showRules?: boolean;
};

export function islandNameTypography(name: string) {
  const lines = islandNameLines(name);
  return { lines, typo: islandStampTypography(name, lines.length) };
}

export function IslandStampNameArt({
  questId,
  islandName,
  foilColor,
  showRules = true,
}: IslandStampNameArtProps) {
  const { lines, typo } = islandNameTypography(islandName);
  const foilId = `island-name-foil-${questId}`;
  const embossId = `island-name-emboss-${questId}`;

  return (
    <>
      <defs>
        <linearGradient id={foilId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="20%" stopColor={foilColor} stopOpacity="0.72" />
          <stop offset="50%" stopColor={foilColor} />
          <stop offset="82%" stopColor={foilColor} stopOpacity="0.88" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.78" />
        </linearGradient>
        <filter id={embossId} x="-18%" y="-18%" width="136%" height="136%">
          <feDropShadow dx="0.35" dy="0.55" stdDeviation="0.25" floodColor="#1a2744" floodOpacity="0.22" />
          <feDropShadow dx="-0.25" dy="-0.35" stdDeviation="0.15" floodColor="#fff" floodOpacity="0.55" />
        </filter>
      </defs>
      {showRules && (
        <>
          <line className="mbadge__island-rule" x1="24" y1={typo.ruleY1} x2="76" y2={typo.ruleY1} />
          <line className="mbadge__island-rule" x1="24" y1={typo.ruleY2} x2="76" y2={typo.ruleY2} />
        </>
      )}
      <g filter={`url(#${embossId})`}>
        {lines.map((line, index) => {
          const y = typo.startY + index * typo.lineHeight;
          return (
            <g key={line}>
              <text
                className="mbadge__island-text mbadge__island-text--shadow"
                x="50.45"
                y={y + 0.55}
                textAnchor="middle"
                style={{ fontSize: typo.fontSize }}
              >
                {line}
              </text>
              <text
                className="mbadge__island-text mbadge__island-text--fill"
                x="50"
                y={y}
                textAnchor="middle"
                style={{ fontSize: typo.fontSize, fill: `url(#${foilId})` }}
              >
                {line}
              </text>
            </g>
          );
        })}
      </g>
    </>
  );
}
