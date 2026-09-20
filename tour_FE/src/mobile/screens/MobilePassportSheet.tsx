import { useMemo } from "react";
import { MobileSheet } from "../MobileSheet";
import { MissionBadge } from "@/components/landing/MissionBadge";
import { PassportIslandEmblem } from "@/components/landing/PassportIslandEmblem";
import { useMissionProgress } from "@/store/mission-progress";
import { useVisitedIslands } from "@/store/visited-islands";
import { ISLANDS } from "@/lib/island-data";
import {
  CATEGORY_META,
  MISSION_CATEGORIES,
  missionQuestState,
  type MissionCategory,
  type MissionQuest,
} from "@/mocks/missions";
import type { UserProfile } from "@/lib/user-profile";

type MobilePassportSheetProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
};

/**
 * 모바일 섬 여권
 *
 * 데스크톱 여권은 4:3 펼침책이라 폰(세로)에서는 한 쪽이 175px 밖에 안 나온다.
 * 64px 배지 12개가 그 안에 들어갈 수 없어 제목이 서로 겹쳐 찍혔다.
 * 모바일에서는 책 대신 위에서 아래로 읽는 시트로 바꿔, 표지 → 방문한 섬 →
 * 카테고리별 배지 순으로 편다.
 */
export function MobilePassportSheet({ open, onClose, profile }: MobilePassportSheetProps) {
  const { quests } = useMissionProgress();
  const { isVisited } = useVisitedIslands();

  const visitedIslands = useMemo(() => ISLANDS.filter((i) => isVisited(i.id)), [isVisited]);

  const byCategory = useMemo(() => {
    const map = new Map<MissionCategory, MissionQuest[]>();
    MISSION_CATEGORIES.forEach((c) => map.set(c, []));
    quests.forEach((q) => map.get(q.category)?.push(q));
    return MISSION_CATEGORIES.map((c) => ({ category: c, list: map.get(c) ?? [] })).filter(
      (g) => g.list.length > 0,
    );
  }, [quests]);

  const earned = quests.filter((q) => missionQuestState(q) === "earned").length;

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      height="tall"
      title="나의 섬 여권"
      labelledBy="m-passport-sheet-title"
    >
      <div className="m-pp">
        <section className="m-pp__cover">
          <p className="m-pp__cover-title">
            ISLAND
            <br />
            PASSPORT
          </p>
          <PassportIslandEmblem className="m-pp__cover-emblem" />
          <p className="m-pp__cover-name">{profile.nickname}</p>
          <p className="m-pp__cover-meta">
            Lv.{profile.level} · {profile.levelTitle}
          </p>
          <p className="m-pp__cover-foot">INCHEON</p>
        </section>

        <div className="m-pp__stats">
          <div>
            <b>{visitedIslands.length}</b>
            <span>방문 섬</span>
          </div>
          <div>
            <b>{earned}</b>
            <span>획득 배지</span>
          </div>
          <div>
            <b>{quests.length - earned}</b>
            <span>남은 배지</span>
          </div>
        </div>

        <section className="m-pp__sec">
          <h3>방문한 섬</h3>
          {visitedIslands.length === 0 ? (
            <p className="m-pp__empty">
              아직 도장이 없어요. 섬에서 찍은 인증샷이 승인되면 여기에 기록돼요.
            </p>
          ) : (
            <ul className="m-pp__islands">
              {visitedIslands.map((island) => (
                <li key={island.id}>{island.name}</li>
              ))}
            </ul>
          )}
        </section>

        {byCategory.map(({ category, list }) => {
          const meta = CATEGORY_META[category];
          const got = list.filter((q) => missionQuestState(q) === "earned").length;
          return (
            <section className="m-pp__sec" key={category}>
              <h3>
                <span aria-hidden="true">{meta.emoji}</span> {category}
                <em>
                  {got}/{list.length}
                </em>
              </h3>
              <ul className="m-pp__badges">
                {list.map((quest) => (
                  <li key={quest.id}>
                    <MissionBadge quest={quest} size={62} tooltip={false} />
                    <b>{quest.title}</b>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </MobileSheet>
  );
}
