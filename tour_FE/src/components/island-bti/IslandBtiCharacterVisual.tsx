import type { CSSProperties, ReactNode } from "react";
import { getIslandBtiResult } from "@/data/island-bti/results";
import type { IslandSpiritLevel } from "@/lib/island-spirit-growth";
import type { IslandBtiResultCode } from "@/types/island-bti";
import { IslandBtiCharacterArt } from "./IslandBtiCharacterArt";

export type IslandBtiCharacterVisualProps = {
  code: IslandBtiResultCode;
  /** results.ts themeColor — prop 우선, 없으면 results에서 조회 */
  themeColor?: string;
  /** compact: 프로필·카드용 / hero: 결과 페이지 대형 */
  variant?: "compact" | "default" | "hero";
  /** 섬 정령 성장 레벨 — 비주얼 강도 조절 */
  spiritLevel?: IslandSpiritLevel;
  showCode?: boolean;
  showName?: boolean;
  className?: string;
  footer?: ReactNode;
};

/** 섬BTI 유형 캐릭터 — name/tagline은 results.ts에서만 읽음 */
export function IslandBtiCharacterVisual({
  code,
  themeColor,
  variant = "default",
  spiritLevel,
  showCode = false,
  showName = false,
  className,
  footer,
}: IslandBtiCharacterVisualProps) {
  const profile = getIslandBtiResult(code);
  const color = themeColor ?? profile?.themeColor ?? "var(--blue)";
  const name = profile?.name ?? code;

  const themeStyle = {
    "--ibti-character-accent": color,
    "--ibti-character-body": color,
    "--ibti-character-belly": "color-mix(in srgb, #fff 88%, var(--ibti-character-accent))",
    "--ibti-character-blush": "color-mix(in srgb, #FCA5A5 70%, var(--ibti-character-accent))",
    "--ibti-character-dark": "color-mix(in srgb, #1F2937 75%, var(--ibti-character-accent))",
    "--character-theme": color,
  } as CSSProperties;

  return (
    <div
      className={[
        "ibti-character-visual",
        `ibti-character-visual--${variant}`,
        spiritLevel ? `ibti-character-visual--spirit-lv${spiritLevel}` : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={themeStyle}
    >
      <div className="ibti-character-visual__frame" aria-hidden={variant !== "hero"}>
        <IslandBtiCharacterArt code={code} className="ibti-character-visual__art" />
      </div>
      {showCode ? <span className="ibti-character-visual__code">{code}</span> : null}
      {showName ? <p className="ibti-character-visual__name">{name}</p> : null}
      {footer}
    </div>
  );
}
