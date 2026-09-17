import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { IslandBtiCharacterVisual } from "@/components/island-bti/IslandBtiCharacterVisual";
import { IslandSpiritGrowthPanel } from "@/components/island-bti/IslandSpiritGrowthPanel";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { useIslandSpiritGrowth } from "@/hooks/useIslandSpiritGrowth";

/** 마이페이지 — 섬BTI 정령 + 성장 현황 */
export function MyPageSpiritGrowthSection() {
  const { hasResult, islandBtiResultCode } = useIslandBti();
  const spiritGrowth = useIslandSpiritGrowth();

  if (!hasResult || !islandBtiResultCode) {
    return (
      <section className="mp-spirit-growth mp-spirit-growth--empty" aria-label="섬 정령 성장">
        <p className="mp-spirit-growth__empty-title">섬BTI 검사 후 정령이 깨어나요</p>
        <p className="mp-spirit-growth__empty-desc">
          섬을 방문하고 도장을 모으면 나의 섬BTI 정령이 성장합니다.
        </p>
        <Link to="/island-bti" className="mp-spirit-growth__cta">
          섬BTI 검사하기
        </Link>
      </section>
    );
  }

  const profile = getIslandBtiResult(islandBtiResultCode);
  if (!profile) return null;

  const themeStyle = { "--island-bti-theme": profile.themeColor } as CSSProperties;

  return (
    <section
      className="mp-spirit-growth"
      style={themeStyle}
      aria-label="섬 정령 성장"
    >
      <div className="mp-spirit-growth__row">
        <IslandBtiCharacterVisual
          code={profile.code}
          themeColor={profile.themeColor}
          variant="default"
          spiritLevel={spiritGrowth.level}
          showCode
          className="mp-spirit-growth__character"
        />
        <IslandSpiritGrowthPanel
          growth={spiritGrowth}
          variant="full"
          className="mp-spirit-growth__panel"
        />
      </div>
    </section>
  );
}
