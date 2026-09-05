import { useMemo, useState, type CSSProperties } from "react";
import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { MissionBadge } from "@/components/landing/MissionBadge";
import { MissionSummary } from "@/components/landing/MissionSummary";
import { useMissionQuests } from "@/hooks/useMissionQuests";
import { getCategoryProgressOf } from "@/lib/passport/passport-mission-stamps";
import {
  CATEGORY_META,
  MISSION_CATEGORIES,
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

function CategoryGroup({
  category,
  filter,
  allQuests,
}: {
  category: MissionCategory;
  filter: MissionFilter;
  allQuests: MissionQuest[];
}) {
  const [expanded, setExpanded] = useState(false);
  const { emoji, color } = CATEGORY_META[category];
  // 카테고리 배지 수도 실제 진행도로 센다. 예전에는 정적 정의를 세서
  // 필터의 "획득 0" 과 카테고리의 "6/18" 이 서로 안 맞았다.
  const { earned, total } = getCategoryProgressOf(category, allQuests);
  const quests = allQuests.filter((q) => q.category === category && matchesFilter(q, filter));
  if (quests.length === 0) return null;

  const style = { "--cat": color } as CSSProperties;
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const panelId = `ms-group-panel-${category}`;

  return (
    <section
      className={`ms-group${expanded ? " is-open" : ""}`}
      aria-label={`${category} 미션`}
      style={style}
    >
      <button
        type="button"
        className="ms-group__toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="ms-group__head">
          <span className="ms-group__title">
            <span className="ms-group__emoji" aria-hidden="true">
              {emoji}
            </span>
            {category}
            <small>
              배지 {earned}/{total}
            </small>
          </span>
          <span className="ms-group__progress" aria-hidden="true">
            <span className="ms-group__progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="ms-group__action">
            <span className="ms-group__chevron" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </span>
      </button>

      <div id={panelId} className={`ms-group__panel${expanded ? " is-open" : ""}`}>
        <div className="ms-group__panel-inner">
          <ul className="ms-quest-grid">
            {quests.map((quest, i) => (
              <QuestCard key={quest.id} quest={quest} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function MissionsView() {
  const [filter, setFilter] = useState<MissionFilter>("전체");
  // 진행도는 로그인한 사용자의 DB 값 (비로그인이면 mock)
  const { quests: allQuests } = useMissionQuests();

  const counts = useMemo(() => {
    const earned = allQuests.filter((q) => missionQuestState(q) === "earned").length;
    return { 전체: allQuests.length, 획득: earned, 진행중: allQuests.length - earned };
  }, [allQuests]);

  return (
    <div className="container">
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

      <div className="ms-groups">
        {MISSION_CATEGORIES.map((category) => (
          <CategoryGroup key={category} category={category} filter={filter} allQuests={allQuests} />
        ))}
      </div>
    </div>
  );
}
