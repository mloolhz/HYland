/**
 * 심사용 — 스크린샷에 있는 커뮤니티 글 9건만 삭제 (재실행 시 0건이면 OK)
 *
 * EC2: docker compose exec api npx tsx prisma/scripts/purge-judge-community-posts.ts
 */
import { prisma } from "../../src/prisma";

function dayRangeKst(date: string) {
  const start = new Date(`${date}T00:00:00+09:00`);
  const end = new Date(`${date}T23:59:59.999+09:00`);
  return { start, end };
}

const SPECS = [
  { island: "백령도", titleContains: "거제야호", day: "2026-09-17", expect: 1 },
  { island: "대청도", titleContains: "고기 국수", day: "2026-09-16", expect: 7 },
  { island: "강화도", titleContains: "강화도 좋아요", day: "2026-09-15", expect: 1 },
] as const;

async function main() {
  const list: { id: string; title: string; island: string; views: number }[] = [];

  for (const spec of SPECS) {
    const { start, end } = dayRangeKst(spec.day);
    const rows = await prisma.post.findMany({
      where: {
        island: spec.island,
        title: { contains: spec.titleContains },
        createdAt: { gte: start, lte: end },
      },
      select: { id: true, title: true, island: true, views: true },
      orderBy: [{ views: "desc" }, { createdAt: "asc" }],
    });
    if (rows.length !== spec.expect) {
      console.error(
        `\n⚠️  [${spec.island}] "${spec.titleContains}" (${spec.day}): 예상 ${spec.expect}건, 실제 ${rows.length}건`,
      );
      for (const p of rows) {
        console.error(`    views=${p.views} ${p.title.slice(0, 60)} (${p.id})`);
      }
      process.exit(1);
    }
    list.push(...rows);
  }

  console.log(`매칭 ${list.length}건:`);
  for (const p of list) {
    console.log(`  - [${p.island}] views=${p.views} ${p.title.slice(0, 48)} (${p.id})`);
  }

  const deleted = await prisma.post.deleteMany({ where: { id: { in: list.map((p) => p.id) } } });
  console.log(`\n삭제 완료: ${deleted.count}건`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
