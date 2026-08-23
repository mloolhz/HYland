import { missionQuestState, type MissionQuest } from "@/mocks/missions";
import { MissionBadge } from "./MissionBadge";

type PassportMissionStampPageProps = {
  quests: MissionQuest[];
  spreadIndex: number;
  totalSpreads: number;
  side: "left" | "right";
  showCategorySummary?: boolean;
};

/** 미션창과 동일한 배지 — MissionBadge + 제목/상태 (mb-item 레이아웃 재사용) */
function PassportMissionStampCell({ quest }: { quest: MissionQuest }) {
  const state = missionQuestState(quest);
  const desc =
    state === "earned"
      ? "획득 완료 ✨"
      : state === "doing"
        ? `진행 중 · ${quest.current}/${quest.target}${quest.unit}`
        : `${quest.target}${quest.unit} 달성 시 획득`;

  return (
    <div className="mb-item passport-mstamp-item" role="listitem">
      <MissionBadge quest={quest} size={64} />
      <b className="mb-item__title">{quest.title}</b>
      <span className="mb-item__desc">{desc}</span>
    </div>
  );
}

export function PassportMissionStampPage({
  quests,
  spreadIndex,
  totalSpreads,
  side,
}: PassportMissionStampPageProps) {
  const showBanner = side === "right" && spreadIndex === 0;
  const title = spreadIndex === 0 && side === "right" ? "최근 기록" : "획득한 배지";

  return (
    <div className={`passport-page passport-page--mission-stamps passport-page--${side}`}>
      <div className="passport-page__paper-texture" aria-hidden="true" />
      <div
        className={`passport-page__paper-edge passport-page__paper-edge--${side}`}
        aria-hidden="true"
      />

      <div className="passport-mstamp-layout">
        <header className="passport-mstamp-layout__head">
          <h3 className="passport-mstamp-layout__title">{title}</h3>
          {side === "right" && (
            <p className="passport-page__page-count">
              {spreadIndex + 1} / {totalSpreads}
            </p>
          )}
        </header>

        <div className="passport-mstamp-grid passport-mstamp-grid--badges" role="list">
          {quests.length === 0 ? (
            <p className="passport-mstamp-empty">아직 기록된 배지가 없습니다.</p>
          ) : (
            quests.map((quest) => <PassportMissionStampCell key={quest.id} quest={quest} />)
          )}
        </div>

        {showBanner ? (
          <footer className="passport-mstamp-banner">
            <span className="passport-mstamp-banner__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                <path d="M12 4V12L15 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <p className="passport-mstamp-banner__text">
              더 많은 섬을 탐험하고 배지를 모아보세요!
            </p>
          </footer>
        ) : (
          <div className="passport-mstamp-layout__spacer" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
