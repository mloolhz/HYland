import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CATEGORY_META,
  MISSION_CATEGORIES,
  missionQuestPercent,
  missionQuestState,
  type MissionCategory,
} from "@/mocks/missions";
import { CATEGORY_LEADERBOARD, avaColor, formatNumber } from "@/lib/landing-data";
import { useMissionProgress } from "@/store/mission-progress";
import { useSession } from "@/store/session";
import { MissionBadge } from "@/components/landing/MissionBadge";
import { useAuthSheet } from "../auth/AuthSheetProvider";

type HubView = "mission" | "leaderboard";

function MissionList() {
  const { quests, loading } = useMissionProgress();
  const [category, setCategory] = useState<MissionCategory | "전체">("전체");

  const list = useMemo(
    () => (category === "전체" ? quests : quests.filter((q) => q.category === category)),
    [quests, category],
  );

  const earned = list.filter((q) => missionQuestState(q) === "earned").length;

  if (loading && quests.length === 0) {
    return <p className="m-empty">미션을 불러오는 중…</p>;
  }

  return (
    <>
      <div className="m-chips" role="tablist" aria-label="미션 분류">
        <button
          type="button"
          role="tab"
          aria-selected={category === "전체"}
          className={`m-chip${category === "전체" ? " is-on" : ""}`}
          onClick={() => setCategory("전체")}
        >
          전체
        </button>
        {MISSION_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            className={`m-chip${category === c ? " is-on" : ""}`}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_META[c].emoji} {c}
          </button>
        ))}
      </div>

      <p className="m-isl__count">
        {earned} / {list.length} 획득
      </p>

      <ul className="m-quests">
        {list.map((quest) => {
          const state = missionQuestState(quest);
          const percent = missionQuestPercent(quest);
          return (
            <li key={quest.id} className={`m-card m-quest is-${state}`}>
              <span className="m-quest__badge">
                <MissionBadge quest={quest} size={56} tooltip={false} />
              </span>
              <span className="m-quest__body">
                <span className="m-quest__top">
                  <b>{quest.title}</b>
                  {state === "earned" && <em className="m-quest__done">획득</em>}
                </span>
                <span className="m-quest__desc">{quest.desc}</span>
                <span className="m-quest__bar">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <span className="m-quest__count">
                  {quest.current} / {quest.target}
                  {quest.unit}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function LeaderboardList() {
  const [category, setCategory] = useState<MissionCategory>("섬");
  const rows = CATEGORY_LEADERBOARD[category] ?? [];

  return (
    <>
      <div className="m-chips" role="tablist" aria-label="리더보드 부문">
        {MISSION_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            className={`m-chip${category === c ? " is-on" : ""}`}
            onClick={() => setCategory(c)}
          >
            {CATEGORY_META[c].emoji} {c}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="m-empty">아직 이 부문에 배지를 받은 사람이 없어요.</p>
      ) : (
        <ol className="m-card m-rank m-rank--full">
          {rows.map(([name, pts], i) => (
            <li key={name} className={i < 3 ? "is-top" : ""}>
              <span className="m-rank__no">{i + 1}</span>
              <span className="m-rank__ava" style={{ background: avaColor(name) }}>
                {name[0]}
              </span>
              <span className="m-rank__name">{name}</span>
              <span className="m-rank__pts">{formatNumber(pts)} P</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/**
 * 모바일 미션 · 리더보드
 *
 * 데스크톱과 같은 두 화면을 하나의 토글로 묶되, 배지 그리드 대신
 * 진행바가 붙은 한 줄짜리 미션 카드로 바꿔 스크롤 한 번에 상태가 보이게 했다.
 * /missions 와 /leaderboard 두 주소를 그대로 유지한다.
 */
export function MobileMissions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useSession();
  const { openAuth } = useAuthSheet();

  const view: HubView = location.pathname.startsWith("/leaderboard") ? "leaderboard" : "mission";

  return (
    <div className="m-screen m-ms">
      <div className="m-seg" role="tablist" aria-label="미션·리더보드 전환">
        <button
          type="button"
          role="tab"
          aria-selected={view === "mission"}
          className={`m-seg__btn${view === "mission" ? " is-on" : ""}`}
          onClick={() => view !== "mission" && navigate("/missions")}
        >
          섬 탐험 미션
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "leaderboard"}
          className={`m-seg__btn${view === "leaderboard" ? " is-on" : ""}`}
          onClick={() => view !== "leaderboard" && navigate("/leaderboard")}
        >
          리더보드
        </button>
      </div>

      {!isLoggedIn && (
        <section className="m-card m-isl__progress m-isl__progress--guest">
          <div className="m-isl__progress-top">
            <b>로그인하고 미션을 시작해보세요</b>
          </div>
          <p>후기와 인증샷을 올리면 미션을 깨고 배지를 모을 수 있어요.</p>
          <button type="button" className="m-btn m-btn--primary" onClick={() => openAuth("login")}>
            로그인
          </button>
        </section>
      )}

      {view === "mission" ? <MissionList /> : <LeaderboardList />}
    </div>
  );
}
