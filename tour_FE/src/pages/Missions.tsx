import { AnimatedWidthBar } from "@/components/mypage/AnimatedWidthBar";
import { MissionSummary } from "@/components/landing/MissionSummary";
import {
  MISSION_CATEGORIES,
  MISSION_QUESTS,
  missionQuestPercent,
  missionQuestState,
  type MissionQuest,
} from "@/mocks/missions";

const STATE_LABEL: Record<ReturnType<typeof missionQuestState>, string> = {
  earned: "획득 완료",
  doing: "진행 중",
  locked: "시작 전",
};

function QuestCard({ quest, index }: { quest: MissionQuest; index: number }) {
  const state = missionQuestState(quest);
  const percent = missionQuestPercent(quest);

  return (
    <li className={`ms-quest ms-quest--${state}${quest.gold ? " ms-quest--gold" : ""}`}>
      <div className="ms-quest__top">
        <span className="ms-quest__icon" aria-hidden="true">
          {quest.icon}
        </span>
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
            className={`ms-gauge-fill${quest.gold ? " ms-gauge-fill--gold" : ""}`}
          />
        </div>
      </div>

      <div className="ms-quest__foot">
        <span className="ms-quest__reward">
          🎖️ {quest.reward}
        </span>
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

export function Missions() {
  return (
    <main className="ms-page">
      <div className="container">
        <header className="ms-head">
          <span className="ms-head__eyebrow">MISSION &amp; BADGE</span>
          <h1 className="ms-head__title">미션 &amp; 인증</h1>
          <p className="ms-head__sub">
            게이지를 가득 채워 배지를 획득하세요. 모은 배지는 바다패스 여권에 기록됩니다.
          </p>
        </header>

        <MissionSummary />

        {MISSION_CATEGORIES.map((category) => {
          const quests = MISSION_QUESTS.filter((q) => q.category === category);
          if (quests.length === 0) return null;
          return (
            <section className="ms-group" key={category} aria-label={`${category} 미션`}>
              <h2 className="ms-group__title">
                <span className="ms-group__badge">{category}</span>
                <small>{quests.length}개 미션</small>
              </h2>
              <ul className="ms-quest-grid">
                {quests.map((quest, i) => (
                  <QuestCard key={quest.id} quest={quest} index={i} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
