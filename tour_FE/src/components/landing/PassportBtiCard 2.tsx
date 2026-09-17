import type { CSSProperties, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { getMyIslandBtiProfileCharacter } from "@/data/profile-characters";
import { IslandSpiritGrowthPanel } from "@/components/island-bti/IslandSpiritGrowthPanel";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { useIslandSpiritGrowth } from "@/hooks/useIslandSpiritGrowth";
import { formatIslandBtiDate } from "@/lib/format-island-bti-date";
import { ProfileCharacterVisual } from "./ProfileCharacterVisual";
import { DEMO_PASSPORT_ISLAND_BTI } from "./passport-demo-fallback";

function formatEnglishTraits(traits: string[]): string {
  return traits
    .map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1).toLowerCase())
    .join(" · ");
}

type PassportBtiCardProps = {
  /** 여권 모달에서만 데모 결과 프리뷰 허용 */
  allowDemoPreview?: boolean;
};

export function PassportBtiCard({ allowDemoPreview = false }: PassportBtiCardProps) {
  const navigate = useNavigate();
  const { latestResult, hasResult } = useIslandBti();
  const spiritGrowth = useIslandSpiritGrowth();

  const effectiveResult =
    latestResult ?? (allowDemoPreview && !hasResult ? DEMO_PASSPORT_ISLAND_BTI : null);

  if (!effectiveResult) {
    return (
      <section className="passport-bti-card passport-bti-card--empty" aria-label="나의 섬BTI">
        <p className="passport-bti-card__kicker">섬BTI</p>
        <p className="passport-bti-card__empty-lead">아직 섬BTI 검사를 완료하지 않았어요.</p>
        <p className="passport-bti-card__empty-desc">
          나에게 맞는 섬과 여행 스타일을 찾아보세요.
        </p>
        <Link
          to="/island-bti"
          className="passport-bti-card__cta"
          onClick={(event) => event.stopPropagation()}
        >
          섬BTI 검사하기
        </Link>
      </section>
    );
  }

  const profile = getIslandBtiResult(effectiveResult.code);
  if (!profile) return null;

  const btiCharacter = getMyIslandBtiProfileCharacter(effectiveResult.code);
  const testedAtLabel = formatIslandBtiDate(effectiveResult.testedAt);
  const themeStyle = { "--bti-theme": profile.themeColor } as CSSProperties;
  const isDemoOnly = !latestResult && allowDemoPreview;

  const handleOpenDetail = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (isDemoOnly) {
      navigate("/island-bti");
      return;
    }
    navigate("/island-bti/result", {
      state: {
        result: effectiveResult.code,
        scores: effectiveResult.scores,
      },
    });
  };

  return (
    <section
      className="passport-bti-card passport-bti-card--filled passport-bti-card--with-growth"
      style={themeStyle}
      aria-label="Island MBTI"
    >
      <button
        type="button"
        className="passport-bti-card__hit"
        aria-label="나의 섬BTI 자세히 보기"
        onClick={handleOpenDetail}
      >
        {btiCharacter ? (
          <div className="passport-bti-card__avatar">
            <ProfileCharacterVisual character={btiCharacter} avatarOnly spiritLevel={spiritGrowth.level} />
          </div>
        ) : null}

        <div className="passport-bti-card__body">
          <p className="passport-bti-card__kicker">섬BTI · 섬 정령</p>
          <div className="passport-bti-card__headline">
            <span className="passport-bti-card__code">{profile.code}</span>
            <span className="passport-bti-card__pill">{profile.name}</span>
          </div>
          <p className="passport-bti-card__traits">{formatEnglishTraits(profile.englishTraits)}</p>
          {testedAtLabel ? (
            <p className="passport-bti-card__date">{testedAtLabel}</p>
          ) : null}
        </div>

        <span className="passport-bti-card__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M10 7L15 12L10 17"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {!isDemoOnly ? (
        <IslandSpiritGrowthPanel growth={spiritGrowth} variant="compact" className="passport-bti-card__growth" />
      ) : null}
    </section>
  );
}

