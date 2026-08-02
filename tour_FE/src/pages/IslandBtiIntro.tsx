import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { IslandBtiContainer } from "@/components/island-bti/IslandBtiContainer";
import { ProfileCharacterVisual } from "@/components/landing/ProfileCharacterVisual";
import { ISLAND_BTI_PROFILE_CHARACTERS } from "@/data/profile-characters";

const SAMPLE_ISLAND_BTI_CHARACTER =
  ISLAND_BTI_PROFILE_CHARACTERS.find((character) => character.islandBtiCode === "BWCF") ??
  ISLAND_BTI_PROFILE_CHARACTERS[0];

export function IslandBtiIntro() {
  return (
    <main className="ibti-page">
      <IslandBtiContainer>
        <header className="ibti-head">
          <span className="ibti-head__eyebrow">ISLAND MBTI</span>
          <h1 className="ibti-head__title">섬BTI로 나의 여행 성향 찾기</h1>
          <p className="ibti-head__sub">
            20가지 질문으로 나만의 섬 여행 유형을 발견해 보세요.
          </p>
          <p className="ibti-head__sub">
            결과에 따라 추천 섬과 레저 활동을 안내해 드립니다.
          </p>
        </header>

        <section className="ibti-card ibti-intro-card" aria-labelledby="ibti-intro-title">
          <h2 id="ibti-intro-title" className="ibti-question">
            어떤 검사인가요?
          </h2>
          <p className="ibti-head__sub">
            네 가지 성향 축을 바탕으로 16가지 섬BTI 유형 중 하나를 알려드려요.
          </p>

          <ul className="ibti-intro-list">
            <li>Active / Breezy — 활동적인지, 여유로운지</li>
            <li>Water / Land — 바다와 육상 중 어디에 더 끌리는지</li>
            <li>Crew / Independent — 함께할지, 혼자 즐길지</li>
            <li>Planned / Flow — 계획형인지, 즉흥형인지</li>
          </ul>

          <span className="ibti-meta">예상 소요 시간 · 약 3분</span>

          <div className="ibti-actions ibti-actions--intro">
            <Link to="/island-bti/test" className="btn btn-navy ibti-start-btn">
              시작하기
            </Link>
          </div>
        </section>

        <section className="ibti-character-unlock" aria-labelledby="ibti-character-unlock-title">
          <div className="ibti-character-unlock__content">
            <h2 id="ibti-character-unlock-title" className="ibti-character-unlock__title">
              섬BTI로 나만의 탐험대원을 만나보세요
            </h2>
            <div className="ibti-character-unlock__texts">
              <p className="ibti-character-unlock__text">
                검사를 완료하면 나의 여행 성향에 해당하는 섬BTI 캐릭터가 해금돼요.
              </p>
              <p className="ibti-character-unlock__text">
                해금된 캐릭터는 섬여권의 대표 프로필로 선택할 수 있습니다.
              </p>
            </div>            <ul className="ibti-character-unlock__highlights">
              <li>16가지 여행 유형</li>
              <li>검사 결과에 해당하는 캐릭터 1개 해금</li>
              <li>섬여권 대표 프로필로 설정 가능</li>
            </ul>
            <p className="ibti-character-unlock__link-note">
              위의 <strong>시작하기</strong> 버튼으로 검사를 시작하면 나의 섬BTI 캐릭터를 해금할 수
              있어요.
            </p>
          </div>
          <div className="ibti-character-unlock__preview" aria-hidden="true">
            <div
              className="ibti-character-unlock__preview-card"
              style={
                {
                  "--character-theme": SAMPLE_ISLAND_BTI_CHARACTER.themeColor,
                } as CSSProperties
              }
            >
              <div className="ibti-character-unlock__preview-frame">
                <ProfileCharacterVisual
                  character={SAMPLE_ISLAND_BTI_CHARACTER}
                  compact
                  className="ibti-character-unlock__preview-visual ibti-character-unlock__preview-visual--avatar-only"
                />
              </div>
              {SAMPLE_ISLAND_BTI_CHARACTER.islandBtiCode ? (
                <span className="ibti-character-unlock__preview-code">
                  {SAMPLE_ISLAND_BTI_CHARACTER.islandBtiCode}
                </span>
              ) : null}
              <p className="ibti-character-unlock__preview-name">{SAMPLE_ISLAND_BTI_CHARACTER.name}</p>
            </div>
            <p className="ibti-character-unlock__preview-caption">섬BTI 캐릭터 예시</p>
          </div>
        </section>
      </IslandBtiContainer>
    </main>
  );
}
