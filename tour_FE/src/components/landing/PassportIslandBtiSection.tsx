import type { CSSProperties, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { useIslandBti } from "@/context/ProfileCharacterContext";
import { formatIslandBtiDate } from "@/lib/format-island-bti-date";

type PassportIslandBtiSectionProps = {
  variant?: "default" | "passport";
};

function formatEnglishTraits(traits: string[]): string {
  return traits
    .map((trait) => trait.charAt(0).toUpperCase() + trait.slice(1).toLowerCase())
    .join(" · ");
}

export function PassportIslandBtiSection({ variant = "default" }: PassportIslandBtiSectionProps) {
  const navigate = useNavigate();
  const { latestResult } = useIslandBti();
  const isPassport = variant === "passport";

  if (!latestResult) {
    return (
      <section
        className={[
          "passport-page__island-bti",
          "passport-page__island-bti--empty",
          isPassport ? "passport-page__island-bti--passport" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="나의 섬BTI"
      >
        <div className="passport-page__island-bti-deco" aria-hidden="true" />
        <p className="passport-page__island-bti-kicker">섬BTI</p>
        <p className="passport-page__island-bti-empty-lead">아직 검사를 완료하지 않았어요</p>
        <p className="passport-page__island-bti-empty-desc">
          나에게 맞는 섬과 여행 스타일을 찾아보세요.
        </p>
        <Link
          to="/island-bti"
          className="passport-page__island-bti-btn"
          onClick={(event) => event.stopPropagation()}
        >
          섬BTI 검사하기
        </Link>
      </section>
    );
  }

  const profile = getIslandBtiResult(latestResult.code);
  if (!profile) {
    return (
      <section
        className={[
          "passport-page__island-bti",
          "passport-page__island-bti--empty",
          isPassport ? "passport-page__island-bti--passport" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="나의 섬BTI"
      >
        <p className="passport-page__island-bti-kicker">섬BTI</p>
        <p className="passport-page__island-bti-empty-lead">아직 섬BTI 검사를 완료하지 않았어요.</p>
        <Link
          to="/island-bti"
          className="passport-page__island-bti-btn"
          onClick={(event) => event.stopPropagation()}
        >
          섬BTI 검사하기
        </Link>
      </section>
    );
  }

  const testedAtLabel = formatIslandBtiDate(latestResult.testedAt);
  const themeStyle = { "--island-bti-theme": profile.themeColor } as CSSProperties;

  const handleViewDetail = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    navigate("/island-bti/result", {
      state: {
        result: latestResult.code,
        scores: latestResult.scores,
      },
    });
  };

  if (isPassport) {
    return (
      <section
        className="passport-page__island-bti passport-page__island-bti--passport passport-page__island-bti--filled"
        style={themeStyle}
        aria-label="Island BTI"
      >
        <div className="passport-page__island-bti-deco" aria-hidden="true" />
        <div className="passport-page__island-bti-premium">
          <div className="passport-page__island-bti-premium-main">
            <p className="passport-page__island-bti-kicker">섬BTI</p>
            <div className="passport-page__island-bti-headline">
              <span className="passport-page__island-bti-code">{profile.code}</span>
              <span className="passport-page__island-bti-name-pill">{profile.name}</span>
            </div>
            <p className="passport-page__island-bti-traits">{formatEnglishTraits(profile.englishTraits)}</p>
            <p className="passport-page__island-bti-tagline">{profile.tagline}</p>
            {testedAtLabel ? (
              <p className="passport-page__island-bti-date">검사일 {testedAtLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="passport-page__island-bti-chevron"
            aria-label="나의 섬BTI 자세히 보기"
            onClick={handleViewDetail}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 7L15 12L10 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="passport-page__island-bti" style={themeStyle} aria-label="Island BTI">
      <h3 className="passport-page__island-bti-kicker">ISLAND BTI</h3>
      <div className="passport-page__island-bti-body">
        <span className="passport-page__island-bti-code">{profile.code}</span>
        <p className="passport-page__island-bti-name">{profile.name}</p>
        <p className="passport-page__island-bti-traits">{formatEnglishTraits(profile.englishTraits)}</p>
        {testedAtLabel ? <p className="passport-page__island-bti-date">검사일 {testedAtLabel}</p> : null}
        <button type="button" className="passport-page__island-bti-btn" onClick={handleViewDetail}>
          나의 섬BTI 자세히 보기
        </button>
      </div>
    </section>
  );
}
