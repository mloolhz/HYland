/**
 * 배지 정의 시드 (badge_definitions)
 *
 * 미션 51개가 각자 reward 에 배지 이름을 들고 있는데, 정작 배지 정의 테이블이
 * 비어 있어서 미션을 완료해도 UserBadge 를 만들 수 없었다. 미션에서 배지를
 * 뽑아 정의를 만든다.
 *
 * id 는 mission-<questId> 로 둔다. 미션과 1:1이라 이름이 바뀌어도 안 깨진다.
 * 아이콘·색·등급은 미션 것을 그대로 가져온다.
 *
 * 재실행 안전 (upsert). 실행: npm run db:seed:badges
 */
import { prisma } from "../src/prisma";

async function main() {
  const quests = await prisma.missionQuest.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });
  if (quests.length === 0) {
    console.error("미션이 없습니다. 먼저 npm run db:seed 를 실행하세요.");
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  for (const q of quests) {
    const id = `mission-${q.id}`;
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

    const exists = await prisma.badgeDefinition.findUnique({ where: { id } });
    await prisma.badgeDefinition.upsert({ where: { id }, update: data, create: { id, ...data } });
    if (exists) updated += 1;
    else created += 1;
  }

  const total = await prisma.badgeDefinition.count();
  const byType = await prisma.badgeDefinition.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  console.log(`배지 정의 ${total}개 (신규 ${created} / 갱신 ${updated})`);
  for (const t of byType) console.log(`  ${t.type.padEnd(10)} ${t._count._all}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
