import type { CSSProperties } from "react";
import type { IslandSpiritGrowth } from "@/lib/island-spirit-growth";

export type IslandSpiritGrowthPanelProps = {
  growth: IslandSpiritGrowth;
  /** full: 결과 페이지 / compact: 여권 카드 / inline: 한 줄 요약 */
  variant?: "full" | "compact" | "inline";
  className?: string;
};

function progressLabel(growth: IslandSpiritGrowth): string {
  if (growth.isMaxLevel) {
    return `방문 섬 ${growth.visitedIslandCount}개 · 최고 레벨 달성`;
  }
  return `방문 섬 ${growth.visitedIslandCount}개 · 다음 레벨까지 ${growth.nextLevelTarget! - growth.visitedIslandCount}개`;
}

export function IslandSpiritGrowthPanel({
  growth,
  variant = "full",
  className,
}: IslandSpiritGrowthPanelProps) {
  const trackStyle = { "--spirit-progress": `${growth.progress}%` } as CSSProperties;

  if (variant === "inline") {
    return (
      <p className={["ibti-spirit-growth ibti-spirit-growth--inline", className].filter(Boolean).join(" ")}>
        <span className="ibti-spirit-growth__badge">Lv.{growth.level}</span>
        <span className="ibti-spirit-growth__title">{growth.title}</span>
        <span className="ibti-spirit-growth__count">{growth.visitedIslandCount}섬</span>
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={["ibti-spirit-growth ibti-spirit-growth--compact", className].filter(Boolean).join(" ")}
        style={trackStyle}
        aria-label={`섬 정령 Lv.${growth.level} ${growth.title}, ${progressLabel(growth)}`}
      >
        <div className="ibti-spirit-growth__head">
          <span className="ibti-spirit-growth__badge">Lv.{growth.level}</span>
          <span className="ibti-spirit-growth__title">{growth.title}</span>
          <span className="ibti-spirit-growth__count">{growth.visitedIslandCount}섬</span>
        </div>
        <div
          className="ibti-spirit-growth__track"
          role="progressbar"
          aria-valuenow={growth.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="다음 레벨까지 진행률"
        >
          <span className="ibti-spirit-growth__fill" />
        </div>
      </div>
    );
  }

  return (
    <section
      className={["ibti-spirit-growth ibti-spirit-growth--full", className].filter(Boolean).join(" ")}
      style={trackStyle}
      aria-labelledby="ibti-spirit-growth-title"
    >
      <div className="ibti-spirit-growth__intro">
        <p className="ibti-spirit-growth__kicker">섬 정령 성장</p>
        <h3 id="ibti-spirit-growth-title" className="ibti-spirit-growth__heading">
          <span className="ibti-spirit-growth__badge">Lv.{growth.level}</span>
          {growth.title}
        </h3>
        <p className="ibti-spirit-growth__desc">
          인천 섬을 방문하고 미션을 완료해 여권 도장을 모을수록 나의 섬BTI 정령이 성장해요.
        </p>
      </div>

      <div
        className="ibti-spirit-growth__track ibti-spirit-growth__track--full"
        role="progressbar"
        aria-valuenow={growth.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="다음 레벨까지 진행률"
      >
        <span className="ibti-spirit-growth__fill" />
      </div>

      <p className="ibti-spirit-growth__meta">{progressLabel(growth)}</p>

      {!growth.isMaxLevel ? (
        <p className="ibti-spirit-growth__hint">
          Lv.{growth.level + 1}까지 {growth.nextLevelTarget}개 섬 도장이 필요해요.
        </p>
      ) : (
        <p className="ibti-spirit-growth__hint ibti-spirit-growth__hint--max">
          모든 섬을 정복한 섬 정령 마스터예요!
        </p>
      )}
    </section>
  );
}
