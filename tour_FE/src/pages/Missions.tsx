import { useMemo, useState, type CSSProperties } from "react";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { MissionBadge } from "@/components/landing/MissionBadge";
import { MissionSummary } from "@/components/landing/MissionSummary";
import {
  CATEGORY_META,
  getCategoryProgress,
  MISSION_CATEGORIES,
  MISSION_QUESTS,
  missionQuestPercent,
  missionQuestState,
  type MissionCategory,
  type MissionQuest,
} from "@/mocks/missions";

const STATE_LABEL: Record<ReturnType<typeof missionQuestState>, string> = {
  earned: "획득 완료",
  doing: "진행 중",
  locked: "시작 전",
};

type MissionFilter = "전체" | "진행중" | "획득";
const FILTERS: MissionFilter[] = ["전체", "진행중", "획득"];

function matchesFilter(quest: MissionQuest, filter: MissionFilter): boolean {
  if (filter === "전체") return true;
  const state = missionQuestState(quest);
  if (filter === "획득") return state === "earned";
  return state !== "earned"; // 진행중(=미획득: doing/locked)
}

function QuestCard({ quest, index }: { quest: MissionQuest; index: number }) {
  const state = missionQuestState(quest);
  const percent = missionQuestPercent(quest);
  const { color } = CATEGORY_META[quest.category];
  const isLegend = quest.tier === "전설";
  const style = { "--cat": color } as CSSProperties;

  return (
    <li className={`ms-quest ms-quest--${state}${isLegend ? " ms-quest--gold" : ""}`} style={style}>
      <div className="ms-quest__top">
        <MissionBadge quest={quest} size={72} tooltip={false} />
        <div className="ms-quest__heading">
          <div className="ms-quest__title-row">
            <b className="ms-quest__title">{quest.title}</b>
            <span className={`ms-quest__state ms-quest__state--${state}`}>
              {state === "earned" ? "✓ " : ""}
              {STATE_LABEL[state]}
            </span>
          </div>
          <p className="ms-quest__desc">{quest.desc}</p>
        </div>
      </div>

      <div className="ms-quest__gauge">
        <div className="ms-quest__gauge-head">
          <span className="ms-quest__count">
            {quest.current} <i>/ {quest.target}</i> {quest.unit}
          </span>
          <span className="ms-quest__percent">{percent}%</span>
        </div>
        <div className="ms-gauge-track">
          <AnimatedWidthBar
            width={percent}
            delay={220 + index * 90}
            className={`ms-gauge-fill${isLegend ? " ms-gauge-fill--gold" : ""}`}
          />
        </div>
      </div>

      <div className="ms-quest__foot">
        <span className="ms-quest__reward">🎖️ {quest.reward}</span>
        {state === "earned" ? (
          <span className="ms-quest__reward-done">획득</span>
        ) : (
          <span className="ms-quest__reward-left">
            {quest.target - quest.current}
            {quest.unit} 남음
          </span>
        )}
      </div>
    </li>
  );
}

function CategoryGroup({ category, filter }: { category: MissionCategory; filter: MissionFilter }) {
  const { emoji, color } = CATEGORY_META[category];
  const { earned, total } = getCategoryProgress(category);
  const quests = MISSION_QUESTS.filter((q) => q.category === category && matchesFilter(q, filter));
  if (quests.length === 0) return null;

  const style = { "--cat": color } as CSSProperties;
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;

  return (
    <section className="ms-group" aria-label={`${category} 미션`} style={style}>
      <div className="ms-group__head">
        <h2 className="ms-group__title">
          <span className="ms-group__emoji" aria-hidden="true">
            {emoji}
          </span>
          {category}
          <small>
            배지 {earned}/{total}
          </small>
        </h2>
        <div className="ms-group__progress" aria-hidden="true">
          <span className="ms-group__progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="ms-quest-grid">
        {quests.map((quest, i) => (
          <QuestCard key={quest.id} quest={quest} index={i} />
        ))}
      </ul>
    </section>
  );
}

export function MissionsView() {
  const [filter, setFilter] = useState<MissionFilter>("전체");

  const counts = useMemo(() => {
    const earned = MISSION_QUESTS.filter((q) => missionQuestState(q) === "earned").length;
    return { 전체: MISSION_QUESTS.length, 획득: earned, 진행중: MISSION_QUESTS.length - earned };
  }, []);

  return (
    <div className="container">
      <header className="ms-head">
        <span className="ms-head__eyebrow">MISSION &amp; BADGE</span>
        <h1 className="ms-head__title">미션 &amp; 인증</h1>
        <p className="ms-head__sub">
          게이지를 가득 채워 귀여운 배지를 모아보세요! 모은 배지는 바다패스 여권에 기록됩니다.
        </p>
      </header>

      <MissionSummary />

      <div className="ms-filter" role="tablist" aria-label="미션 필터">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? "on" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
            <span className="ms-filter__count">{counts[f]}</span>
          </button>
        ))}
      </div>

      {MISSION_CATEGORIES.map((category) => (
        <CategoryGroup key={category} category={category} filter={filter} />
      ))}
    </div>
  );
}
