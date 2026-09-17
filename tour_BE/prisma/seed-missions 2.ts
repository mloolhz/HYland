/**
 * 미션·배지 재동기화 (mission_categories, mission_quests, badge_definitions)
 *
 * `npm run db:seed` 는 미션을 통째로 지우고 다시 만들기 때문에, 이미 받은
 * 배지와 진행도까지 같이 날아간다. 레저 종목이 바뀌어 미션만 손볼 때는
 * 이 스크립트를 쓴다 — upsert 로 갱신하고, 없어진 미션만 골라 지운다.
 *
 * 없어진 미션에 누군가의 진행도·배지가 걸려 있으면 지우지 않고 경고만 남긴다.
 * 데이터를 조용히 버리는 것보다 사람이 판단하는 편이 낫다.
 *
 * 실행: npm run db:seed:missions
 */
import { CATEGORY_META, MISSION_CATEGORIES, MISSION_QUESTS } from "@/mocks/missions";
import { prisma } from "../src/prisma";

const TIER: Record<string, "COMMON" | "RARE" | "LEGEND"> = {
  일반: "COMMON",
  희귀: "RARE",
  전설: "LEGEND",
};

async function main() {
  const islands = await prisma.island.findMany({ select: { id: true, name: true } });
  const islandIds = new Set(islands.map((i) => i.id));
  const islandIdByName = new Map(islands.map((i) => [i.name, i.id]));
  const sportIds = new Set((await prisma.sport.findMany({ select: { id: true } })).map((s) => s.id));

  // ── 카테고리 ──
  for (const c of MISSION_CATEGORIES) {
    const meta = CATEGORY_META[c];
    await prisma.missionCategory.upsert({
      where: { id: c },
      update: { emoji: meta.emoji, color: meta.color, colorName: meta.colorName },
      create: { id: c, emoji: meta.emoji, color: meta.color, colorName: meta.colorName },
    });
  }

  // ── 미션 ──
  const rows = MISSION_QUESTS.map((q) => {
    const anyQ = q as any;
    return {
      id: q.id,
      categoryId: q.category,
      icon: q.icon,
      title: q.title,
      description: q.desc,
      target: q.target,
      unit: q.unit,
      reward: q.reward,
      tier: TIER[q.tier] ?? "COMMON",
      // 섬 미션은 제목("백령도 방문")에서 섬을 잇는다 — 승인 시 방문 처리에 쓴다
      islandId:
        (anyQ.islandId && islandIds.has(anyQ.islandId) ? anyQ.islandId : null) ??
        (q.category === "섬" ? (islandIdByName.get(q.title.replace(/ 방문$/, "")) ?? null) : null),
      sportId: anyQ.sportId && sportIds.has(anyQ.sportId) ? anyQ.sportId : null,
    };
  });

  const before = await prisma.missionQuest.findMany({ select: { id: true, title: true } });
  const beforeIds = new Set(before.map((q) => q.id));

  for (const row of rows) {
    const { id, ...rest } = row;
    await prisma.missionQuest.upsert({ where: { id }, update: rest, create: row });
  }

  const keep = new Set(rows.map((r) => r.id));
  const obsolete = before.filter((q) => !keep.has(q.id));

  // ── 없어진 미션 정리 (기록이 걸려 있으면 남긴다) ──
  const removed: string[] = [];
  const kept: string[] = [];
  for (const q of obsolete) {
    const [progress, badges, subs] = await Promise.all([
      prisma.userMissionProgress.count({ where: { questId: q.id } }),
      prisma.userBadge.count({ where: { badgeId: `mission-${q.id}` } }),
      prisma.missionSubmission.count({ where: { questId: q.id } }),
    ]);
    if (progress + badges + subs > 0) {
      kept.push(`${q.id}:${q.title} (진행도 ${progress}, 배지 ${badges}, 제출 ${subs})`);
      continue;
    }
    await prisma.badgeDefinition.deleteMany({ where: { id: `mission-${q.id}` } });
    await prisma.missionQuest.delete({ where: { id: q.id } });
    removed.push(`${q.id}:${q.title}`);
  }

  // ── 배지 정의 (미션과 1:1) ──
  const quests = await prisma.missionQuest.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });
  for (const q of quests) {
    const data = {
      // 섬 카테고리 미션의 보상은 섬 스탬프로 본다
      type: q.categoryId === "섬" ? ("ISLAND" as const) : ("MISSION" as const),
      name: q.reward,
      description: q.description,
      icon: q.icon,
      color: q.category.color,
      islandId: q.islandId,
      tier: q.tier,
      condition: `${q.title} — ${q.description}`,
    };
    await prisma.badgeDefinition.upsert({
      where: { id: `mission-${q.id}` },
      update: data,
      create: { id: `mission-${q.id}`, ...data },
    });
  }

  const added = rows.filter((r) => !beforeIds.has(r.id));
  console.log(`미션 ${quests.length}개 · 배지 정의 ${quests.length}개`);
  if (added.length) console.log(`\n추가 ${added.length}개:\n  ` + added.map((r) => `${r.id}:${r.title}`).join("\n  "));
  if (removed.length) console.log(`\n삭제 ${removed.length}개:\n  ` + removed.join("\n  "));
  if (kept.length) console.log(`\n⚠ 기록이 있어 남겨 둔 옛 미션 ${kept.length}개:\n  ` + kept.join("\n  "));
}

main()
  .catch((err) => {
    console.error("미션 동기화 실패:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
