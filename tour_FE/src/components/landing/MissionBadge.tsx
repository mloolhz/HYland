import type { CSSProperties } from "react";
import { ISLANDS } from "@/lib/island-data";
import { CATEGORY_META, missionQuestPercent, missionQuestState, type MissionQuest } from "@/mocks/missions";
import { IslandVisitStamp } from "./IslandVisitStamp";
import { SPORT_BADGE_ICONS } from "./sport-badge-icons";

type MissionBadgeProps = {
  quest: MissionQuest;
  /** 지름(px) — 섬 스탬프는 세로형이라 높이 기준 */
  size?: number;
  /** 호버 시 배지 정보 툴팁 표시 */
  tooltip?: boolean;
};

/** 수집 배지 — 섬은 타원형 여권 스탬프, 그 외는 원형 메달 */
export function MissionBadge({ quest, size = 96, tooltip = true }: MissionBadgeProps) {
  const state = missionQuestState(quest);
  const percent = missionQuestPercent(quest);
  const { color } = CATEGORY_META[quest.category];
  const isIslandBadge = quest.category === "섬";
  const islandName = isIslandBadge ? quest.title.replace(/ 방문$/, "") : "";
  const islandId =
    quest.islandId ?? ISLANDS.find((i) => i.name === islandName)?.id ?? "";
  const nearComplete = state === "doing" && percent >= 67;
  const tierClass = quest.tier === "전설" ? "legend" : quest.tier === "희귀" ? "rare" : "common";

  const statusText =
    state === "earned"
      ? "인증 완료"
      : state === "doing"
        ? `진행 ${percent}% · ${quest.target - quest.current}${quest.unit} 남음`
        : `${quest.target}${quest.unit} 달성 시 획득`;

  if (isIslandBadge) {
    return (
      <div
        className={[
          "mbadge",
          "mbadge--island-stamp",
          `mbadge--${state}`,
          tooltip ? "mbadge--interactive" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: size } as CSSProperties}
        role="img"
        aria-label={`${quest.title} 스탬프 · ${statusText}`}
        tabIndex={tooltip ? 0 : undefined}
      >
        <IslandVisitStamp
          islandId={islandId}
          islandName={islandName}
          earned={state === "earned"}
          doing={state === "doing"}
          questIndex={quest.id}
          size={size}
        />
        {tooltip && (
          <div className="mbadge__tip" role="tooltip">
            <b className="mbadge__tip-title">{quest.title}</b>
            <span className="mbadge__tip-tier">{quest.tier} 배지</span>
            <span className="mbadge__tip-status">{statusText}</span>
          </div>
        )}
      </div>
    );
  }

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const style = { "--cat": color, width: size, height: size, fontSize: size * 0.3 } as CSSProperties;
  const sportIcon = quest.sportId ? SPORT_BADGE_ICONS[quest.sportId] : null;

  return (
    <div
      className={[
        "mbadge",
        `mbadge--${state}`,
        `mbadge--${tierClass}`,
        nearComplete ? "mbadge--near" : "",
        tooltip ? "mbadge--interactive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="img"
      aria-label={`${quest.title} 스탬프 · ${statusText}`}
      tabIndex={tooltip ? 0 : undefined}
    >
      <svg className="mbadge__stamp" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="mbadge__disc" cx="50" cy="50" r="46.5" />
        <circle className="mbadge__ring-out" cx="50" cy="50" r="45" />
        <circle className="mbadge__dots" cx="50" cy="50" r="41.5" />
        <circle className="mbadge__ring-in" cx="50" cy="50" r="39" />

        {state === "doing" && (
          <g transform="rotate(-90 50 50)">
            <circle className="mbadge__track" cx="50" cy="50" r={radius} />
            <circle
              className="mbadge__arc"
              cx="50"
              cy="50"
              r={radius}
              style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
            />
          </g>
        )}

        <text className="mbadge__stars" x="50" y="26" textAnchor="middle">
          ★ ★ ★
        </text>
        <line className="mbadge__divider" x1="35" y1="64" x2="65" y2="64" />
        <text className="mbadge__label" x="50" y="79" textAnchor="middle">
          {quest.category}
        </text>
      </svg>

      <span
        className={`mbadge__emoji${sportIcon ? " mbadge__emoji--svg" : ""}`}
        aria-hidden="true"
      >
        {sportIcon ?? quest.icon}
      </span>

      {state === "earned" && (
        <span className="mbadge__seal" aria-hidden="true">
          ✓
        </span>
      )}
      {state === "locked" && (
        <span className="mbadge__lock" aria-hidden="true">
          🔒
        </span>
      )}

      {tooltip && (
        <div className="mbadge__tip" role="tooltip">
          <b className="mbadge__tip-title">{quest.title}</b>
          <span className="mbadge__tip-tier">{quest.tier} 배지</span>
          <span className="mbadge__tip-status">{statusText}</span>
        </div>
      )}
    </div>
  );
}
