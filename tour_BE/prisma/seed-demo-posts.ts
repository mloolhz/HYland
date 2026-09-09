/**
 * 시연용 커뮤니티 데모 후기 (jichan Post 테이블).
 *
 * jichan 커뮤니티는 사용자가 직접 쓰는 구조라 시드가 비어 있다. AI 추천의
 * 커뮤니티 근거·합의·팁을 회의에서 보여주려면 예시 후기가 필요해 넣는다.
 * 작성 즉시 본문 분석(sentiment·cautions·companionFit·bestMonths)을 함께 저장한다.
 *
 * 실행: npm run db:seed:demo-posts
 */
import { prisma } from "../src/prisma";
import { analyzeWithLexicon } from "../src/services/community-analysis";
import type { ReviewTagId } from "../../tour_FE/src/constants/review-tags";

const TYPE_TO_DB = { review: "REVIEW", photo: "PHOTO", question: "QUESTION" } as const;

type Demo = {
  author: "ipado" | "deungdae";
  island: string;
  activity: string;
  type: keyof typeof TYPE_TO_DB;
  title: string;
  content: string;
  tags?: ReviewTagId[];
};

const DEMO: Demo[] = [
  // ── 자월도 트레킹: 시기(9월)·동행(가족)·팁(주차) 합의 시연 ──
  { author: "ipado", island: "자월도", activity: "트레킹", type: "review",
    title: "자월도 가족 트레킹 다녀왔어요",
    tags: ["family_friendly", "good_for_trekking", "good_for_walking"],
    content: "가족과 9월에 자월도 장골해변 트레킹 다녀왔어요. 아이들도 힘들지 않게 걸을 수 있는 코스라 좋았습니다. 주차장이 좁으니 아침 일찍 가세요." },
  { author: "deungdae", island: "자월도", activity: "트레킹", type: "review",
    title: "9월 자월도 트레킹 최고",
    tags: ["family_friendly", "good_for_trekking", "beautiful_sea"],
    content: "9월 초 가족 나들이로 자월도 트레킹했는데 바다 보면서 걸어서 정말 좋았어요. 주차 공간이 부족하니 서두르세요." },
  { author: "ipado", island: "자월도", activity: "트레킹", type: "review",
    title: "아이랑 자월도 트레킹",
    tags: ["family_friendly", "good_for_trekking", "photogenic"],
    content: "아이랑 9월에 자월도 트레킹 코스 걸었습니다. 경치가 정말 좋았어요. 주차하기 힘드니 배편 시간도 미리 확인하세요." },
  { author: "deungdae", island: "자월도", activity: "트레킹", type: "review",
    title: "부모님과 자월도 트레킹",
    tags: ["family_friendly", "good_for_walking"],
    content: "가족여행으로 9월에 다녀왔어요. 트레킹 길이 잘 정비돼 있어 부모님도 편하게 걸으셨습니다. 주차장 자리가 없어서 조금 헤맸어요." },
  { author: "ipado", island: "자월도", activity: "트레킹", type: "review",
    title: "9월 가족 트레킹 추천",
    tags: ["family_friendly", "good_for_trekking"],
    content: "9월 가족 트레킹으로 추천합니다. 아이들이 즐거워했어요. 주차가 어려우니 서둘러 가세요." },
  // 부정 후기지만 "주차"는 여행에 도움 → 팁으로 포함되어야
  { author: "deungdae", island: "자월도", activity: "트레킹", type: "review",
    title: "자월도 트레킹 후기",
    content: "코스는 그냥 그랬어요. 근데 주차하기가 진짜 힘드니 대중교통을 이용하는 게 나아요." },
  // 순수 불평 → 팁에서 제외되어야
  { author: "ipado", island: "자월도", activity: "트레킹", type: "review",
    title: "자월도 아쉬웠던 점",
    content: "길가에 쓰레기가 많아서 실망했어요. 정비가 좀 필요해 보입니다." },
  // ── 다른 섬 (근거·후기 다양성) ──
  { author: "ipado", island: "무의도", activity: "카약", type: "review",
    title: "무의도 카약 물이 맑아요",
    tags: ["beautiful_sea", "varied_activities"],
    content: "하나개 해수욕장 카약, 물이 너무 맑았어요. 강사님이 친절해서 초보도 금방 배웠습니다." },
  { author: "deungdae", island: "장봉도", activity: "갯벌체험", type: "photo",
    title: "장봉도 가족 갯벌체험",
    content: "온 가족이 갯벌체험 다녀왔는데 조개·게 잡기 프로그램이 알차요. 아이들이 정말 좋아했어요." },
];

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, username: true } });
  const idOf = (u: string) => users.find((x) => x.username === u)?.id;

  await prisma.post.deleteMany({ where: { title: { in: DEMO.map((d) => d.title) } } });

  let n = 0;
  for (const d of DEMO) {
    const authorId = idOf(d.author);
    if (!authorId) {
      console.warn(`계정 없음: ${d.author} — 먼저 db:seed:accounts 실행 필요`);
      continue;
    }
    const a = analyzeWithLexicon(d.title, d.content);
    await prisma.post.create({
      data: {
        authorId,
        type: TYPE_TO_DB[d.type],
        title: d.title,
        content: d.content,
        island: d.island,
        activity: d.activity,
        tags: d.tags ?? [],
        sentiment: a.sentiment,
        sentimentScore: a.sentimentScore,
        highlight: a.highlight,
        mentionedActivities: a.mentionedActivities,
        bestMonths: a.bestMonths,
        companionFit: a.companionFit,
        cautions: a.cautions,
        analyzedBy: a.analyzedBy,
        analyzedAt: new Date(),
      },
    });
    n += 1;
  }
  console.log(`✅ 데모 후기 ${n}건 시드 완료`);
}

main()
  .catch((e) => { console.error("❌ 데모 후기 시드 실패:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
