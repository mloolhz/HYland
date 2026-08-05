import type { MissionQuest } from "@/mocks/missions";
import { PassportInkStamp } from "./PassportInkStamp";
import {
  isInkStampDoing,
  isInkStampEarned,
  questToInkStampDisplay,
  STAMP_GRID_SLOTS,
} from "@/lib/passport/passport-quest-ink-stamp";

type PassportMissionStampPageProps = {
  quests: MissionQuest[];
  spreadIndex: number;
  totalSpreads: number;
  side: "left" | "right";
  showCategorySummary?: boolean;
};

function PassportMissionStampCell({ quest }: { quest: MissionQuest }) {
  const display = questToInkStampDisplay(quest);
  const earned = isInkStampEarned(quest);
  const doing = isInkStampDoing(quest);

  return (
    <PassportInkStamp
      stampId={quest.id}
      place={display.place}
      activity={display.activity}
      variant={display.variant}
      theme={display.theme}
      layout={display.layout}
      acquired={earned}
      doing={doing}
      date={earned ? display.earnedAt : undefined}
    />
  );
}

function HiddenStampSlot({ index }: { index: number }) {
  return (
    <PassportInkStamp
      stampId={`hidden-${index}`}
      place="숨겨진 도장"
      activity="???"
      variant="anchor"
      theme={{ ink: "#C5CAD1" }}
      layout={{ rotate: 0, scale: 1, offsetX: 0, offsetY: 0, shape: "circle" }}
      acquired={false}
      doing={false}
      hidden
    />
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

  const slots: (MissionQuest | null)[] = [...quests];
  if (spreadIndex === 0 && side === "right") {
    while (slots.length < STAMP_GRID_SLOTS - 1) slots.push(null);
    slots.push(null);
  }

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

        <div
          className={`passport-mstamp-grid passport-mstamp-grid--ink${spreadIndex === 0 && side === "right" ? " passport-mstamp-grid--4col" : ""}`}
          role="list"
        >
          {slots.length === 0 ? (
            <p className="passport-mstamp-empty">아직 기록된 배지가 없습니다.</p>
          ) : (
            slots.map((quest, i) =>
              quest ? (
                <PassportMissionStampCell key={quest.id} quest={quest} />
              ) : spreadIndex === 0 && side === "right" && i === slots.length - 1 ? (
                <HiddenStampSlot key="hidden-stamp" index={i} />
              ) : null,
            )
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
