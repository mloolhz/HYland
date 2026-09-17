/**
 * 자동으로 채워지는 미션
 *
 * 인증샷 검수가 필요한 미션(섬 방문·레저 종목)과 달리, 활동만 하면 저절로
 * 채워져야 하는 미션들이 있다. 예전에는 이 미션들이 목록에만 있고 진행도를
 * 올려 주는 코드가 없어서 아무리 글을 써도 0/10 그대로였다.
 *
 *   그랜드슬램  카테고리의 종목 미션을 모두 완료
 *   첫 후기     글 1개
 *   이야기꾼    글 10개
 *   댓글 요정   댓글 5개
 *   섬BTI 참여  섬BTI 검사 1회
 *   인싸 탐험가 내 글이 받은 좋아요 10개
 *   골드/실버/브론즈 탐험가  카테고리 순위 1/2/3위 (한 번이라도)
 *
 * syncAutoQuests() 하나가 전부를 다시 계산한다. 여러 번 불러도 결과가 같고
 * (idempotent), 진행도는 줄어들지 않는다 — 글을 지웠다고 이미 받은 배지를
 * 빼앗지는 않는다.
 *
 * 글·댓글·좋아요·BTI·검수 승인 뒤에 부르면 된다. 실패해도 원래 동작을 막지
 * 않는다 (배지가 하나 늦게 붙는 것보다 글이 안 써지는 쪽이 훨씬 나쁘다).
 */
import { prisma } from "./prisma";
import { notify } from "./notifications";

/** mocks/missions.ts 의 제목과 같아야 한다 */
const TITLES = {
  firstReview: "첫 후기",
  storyteller: "이야기꾼",
  commentFairy: "댓글 요정",
  bti: "섬BTI 참여",
  popular: "인싸 탐험가",
  gold: "골드 탐험가",
  silver: "실버 탐험가",
  bronze: "브론즈 탐험가",
} as const;

const GRAND_SLAM_SUFFIX = "그랜드슬램";

/** 새로 딴 배지 이름 */
type Granted = string[];

/**
 * 진행도를 value 로 올린다. 목표를 채우면 배지를 준다.
 * 이미 그보다 앞서 있으면 아무것도 하지 않는다.
 */
async function setProgress(
  userId: string,
  quest: { id: number; target: number; title: string },
  value: number,
  granted: Granted,
): Promise<void> {
  const current = Math.min(value, quest.target);
  const prev = await prisma.userMissionProgress.findUnique({
    where: { userId_questId: { userId, questId: quest.id } },
  });
  if (prev && prev.current >= current) return;

  const completed = current >= quest.target;
  await prisma.userMissionProgress.upsert({
    where: { userId_questId: { userId, questId: quest.id } },
    update: { current, completedAt: completed ? (prev?.completedAt ?? new Date()) : null },
    create: { userId, questId: quest.id, current, completedAt: completed ? new Date() : null },
  });
  if (!completed) return;

  const badgeId = `mission-${quest.id}`;
  const badge = await prisma.badgeDefinition.findUnique({ where: { id: badgeId } });
  if (!badge) return;
  const has = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  });
  if (has) return;

  await prisma.userBadge.create({ data: { userId, badgeId } });
  granted.push(badge.name);
}

/**
 * 카테고리별 순위 — 완료한 미션을 카테고리로 묶어 배지 수로 매긴다.
 * (GET /leaderboard/categories 와 같은 기준)
 */
async function bestCategoryRank(userId: string): Promise<number | null> {
  const rows = await prisma.userMissionProgress.findMany({
    where: { completedAt: { not: null } },
    include: { quest: { select: { categoryId: true } } },
  });

  /** category → (userId → 완료 수) */
  const byCategory = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const cat = r.quest.categoryId;
    if (!byCategory.has(cat)) byCategory.set(cat, new Map());
    const m = byCategory.get(cat)!;
    m.set(r.userId, (m.get(r.userId) ?? 0) + 1);
  }

  let best: number | null = null;
  for (const counts of byCategory.values()) {
    const mine = counts.get(userId);
    if (!mine) continue;
    // 나보다 많이 모은 사람 수 + 1 = 내 등수
    const above = [...counts.values()].filter((n) => n > mine).length;
    const rank = above + 1;
    if (best === null || rank < best) best = rank;
  }
  return best;
}

export async function syncAutoQuests(userId: string): Promise<Granted> {
  const granted: Granted = [];
  try {
    const quests = await prisma.missionQuest.findMany({
      select: { id: true, title: true, target: true, categoryId: true, sportId: true },
    });
    const byTitle = new Map(quests.map((q) => [q.title, q]));

    const [posts, comments, btiCount, likes] = await Promise.all([
      prisma.post.count({ where: { authorId: userId, isNotice: false } }),
      prisma.comment.count({ where: { authorId: userId } }),
      prisma.userIslandBtiResult.count({ where: { userId } }),
      prisma.postLike.count({ where: { post: { authorId: userId } } }),
    ]);

    const counts: [string, number][] = [
      [TITLES.firstReview, posts],
      [TITLES.storyteller, posts],
      [TITLES.commentFairy, comments],
      [TITLES.bti, btiCount],
      [TITLES.popular, likes],
    ];
    for (const [title, value] of counts) {
      const q = byTitle.get(title);
      if (q) await setProgress(userId, q, value, granted);
    }

    // ── 그랜드슬램 — 그 카테고리의 종목 미션을 몇 개나 완료했나 ──
    const done = await prisma.userMissionProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { questId: true },
    });
    const doneIds = new Set(done.map((d) => d.questId));
    for (const slam of quests.filter((q) => q.title.endsWith(GRAND_SLAM_SUFFIX))) {
      const cleared = quests.filter(
        (q) => q.categoryId === slam.categoryId && q.sportId && doneIds.has(q.id),
      ).length;
      await setProgress(userId, slam, cleared, granted);
    }

    // ── 순위 배지 — 한 번이라도 1·2·3위면 준다 ──
    const rank = await bestCategoryRank(userId);
    if (rank !== null) {
      const byRank: Record<number, string> = {
        1: TITLES.gold,
        2: TITLES.silver,
        3: TITLES.bronze,
      };
      const title = byRank[rank];
      const q = title ? byTitle.get(title) : undefined;
      if (q) await setProgress(userId, q, q.target, granted);
    }

    for (const name of granted) {
      await notify({
        userId,
        type: "BADGE",
        message: "새로운 배지 {highlight}를 획득했어요",
        highlight: name,
        link: "/mypage",
      });
    }
  } catch (err) {
    // 배지가 하나 늦게 붙는 것보다 글이 안 써지는 쪽이 훨씬 나쁘다
    console.error("자동 미션 갱신 실패:", err);
  }
  return granted;
}
