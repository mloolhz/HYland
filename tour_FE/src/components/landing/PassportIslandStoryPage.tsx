import type { CSSProperties } from "react";
import { IslandBtiCharacterVisual } from "@/components/island-bti/IslandBtiCharacterVisual";
import {
  DEFAULT_PROFILE_CHARACTER_ID,
  getProfileCharacterById,
} from "@/data/profile-characters";
import { getIslandBtiResult } from "@/data/island-bti/results";
import { useIslandBti, useProfileCharacter } from "@/context/ProfileCharacterContext";
import { useIslandSpiritGrowth } from "@/hooks/useIslandSpiritGrowth";
import { calculatePassportIslandStorySummary } from "@/lib/passport/passport-island-story";
import { ProfileCharacterVisual } from "./ProfileCharacterVisual";

const EMPTY_LABEL = "아직 기록이 없어요";

type StoryRowProps = {
  label: string;
  value: string;
};

function StoryRow({ label, value }: StoryRowProps) {
  return (
    <div className="passport-island-story__row">
      <dt className="passport-island-story__label">{label}</dt>
      <dd className="passport-island-story__value">{value}</dd>
    </div>
  );
}

/** 여권 마지막 페이지 — 나의 섬 이야기 */
export function PassportIslandStoryPage() {
  const summary = calculatePassportIslandStorySummary();
  const { latestResult, islandBtiResultCode } = useIslandBti();
  const { selectedCharacterId } = useProfileCharacter();
  const spiritGrowth = useIslandSpiritGrowth();

  const btiProfile = islandBtiResultCode ? getIslandBtiResult(islandBtiResultCode) : null;
  const selectedCharacter =
    getProfileCharacterById(selectedCharacterId) ??
    getProfileCharacterById(DEFAULT_PROFILE_CHARACTER_ID)!;

  const btiLabel = btiProfile
    ? `${btiProfile.code} · ${btiProfile.name}`
    : latestResult
      ? latestResult.code
      : "검사 전";

  const themeStyle = btiProfile
    ? ({ "--island-story-theme": btiProfile.themeColor } as CSSProperties)
    : undefined;

  return (
    <div
      className="passport-page passport-page--right passport-page--island-story"
      style={themeStyle}
    >
      <div className="passport-page__paper-texture" aria-hidden="true" />
      <div className="passport-page__paper-edge passport-page__paper-edge--right" aria-hidden="true" />

      <div className="passport-island-story">
        <header className="passport-island-story__head">
          <p className="passport-page__kicker">MY ISLAND JOURNAL</p>
          <h3 className="passport-island-story__title">나의 섬 이야기</h3>
          <p className="passport-island-story__lead">
            섬을 걸으며 남긴 발자국과 도장, 그리고 나만의 여행 이야기.
          </p>
        </header>

        <dl className="passport-island-story__list">
          <StoryRow
            label="첫 방문한 섬"
            value={summary.firstVisitedIsland ?? EMPTY_LABEL}
          />
          <StoryRow
            label="최근 방문한 섬"
            value={summary.recentVisitedIsland ?? EMPTY_LABEL}
          />
          <StoryRow label="방문한 섬 개수" value={`${summary.visitedIslandCount}개`} />
          <StoryRow label="획득한 도장 개수" value={`${summary.earnedStampCount}개`} />
          <StoryRow label="완료한 미션 개수" value={`${summary.completedMissionCount}개`} />
          <StoryRow label="현재 섬BTI" value={btiLabel} />
          <StoryRow label="대표 캐릭터" value={selectedCharacter.name} />
          <StoryRow
            label="탐험 시작일"
            value={summary.explorationStartedAt ?? EMPTY_LABEL}
          />
        </dl>

        <div className="passport-island-story__rate">
          <div className="passport-island-story__rate-head">
            <span className="passport-island-story__label">인천 섬 탐험률</span>
            <strong className="passport-island-story__rate-value">
              {summary.explorationRate.percent}%
            </strong>
          </div>
          <div
            className="passport-island-story__rate-track"
            role="progressbar"
            aria-valuenow={summary.explorationRate.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="인천 섬 탐험률"
          >
            <span
              className="passport-island-story__rate-fill"
              style={{ width: `${summary.explorationRate.percent}%` }}
            />
          </div>
          <p className="passport-island-story__rate-meta">
            {summary.explorationRate.visited} / {summary.explorationRate.total}개 섬
          </p>
        </div>

        <div className="passport-island-story__character" aria-hidden="true">
          {btiProfile && selectedCharacter.category === "islandBti" ? (
            <ProfileCharacterVisual character={selectedCharacter} avatarOnly spiritLevel={spiritGrowth.level} />
          ) : btiProfile ? (
            <IslandBtiCharacterVisual
              code={btiProfile.code}
              themeColor={btiProfile.themeColor}
              variant="compact"
              spiritLevel={spiritGrowth.level}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
