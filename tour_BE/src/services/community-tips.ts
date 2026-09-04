import { prisma } from "../prisma";
import {
  aggregateCommunityInsights,
  type InsightPost,
} from "@/lib/recommendation/community/community-insights";
import {
  ISLAND_NAME_TO_ID,
  resolveIslandId,
} from "@/lib/recommendation/vocabulary/activity-vocabulary";

/**
 * 자유 질문(Gemini) 답변에 커뮤니티 후기 합의를 얹는다.
 *
 * 조건 패널은 FE 엔진이 이 합의를 이미 쓰지만, 자유 채팅 질문은 백엔드 Gemini가
 * 따로 답해서 그동안 커뮤니티 후기가 반영되지 않았다. Gemini가 어떤 섬을 추천했든,
 * 그 섬에 방문객 다수가 남긴 팁이 있으면 함께 보여준다.
 *
 * 합의 판단 로직은 FE와 동일한 함수(aggregateCommunityInsights)를 그대로 재사용한다.
 * 두 경로가 다른 기준으로 팁을 뽑으면 안 되기 때문이다.
 *
 * 자유 질문에는 구조화된 여행 조건(날짜·동행)이 없으므로 여기서는 주의·팁만 쓴다.
 * (시기·동행 합의는 조건 패널처럼 정확한 입력이 있어야 매칭이 가능하다)
 */

const MONTH_NAMES: Record<number, string> = {};

/** 질문·답변 본문에 등장한 섬 이름을 찾는다. "자월도 어때?"처럼 Gemini가
 *  recommendations를 안 채우고 text로만 답한 경우를 잡는다. */
export function findIslandNamesInText(text: string): string[] {
  if (!text) return [];
  return Object.keys(ISLAND_NAME_TO_ID).filter((name) => text.includes(name));
}

/** 추천/언급된 섬 이름들에 대한 방문객 팁을 모아 문장으로 돌려준다. */
export async function buildCommunityTips(islandNames: string[]): Promise<string[]> {
  const uniqueIslands = [...new Set(islandNames.map((n) => n.trim()).filter(Boolean))];
  if (uniqueIslands.length === 0) return [];

  const rows = await prisma.communityPost.findMany({
    where: { island: { in: uniqueIslands } },
    select: {
      island: true,
      type: true,
      isNotice: true,
      sentiment: true,
      cautions: true,
      companionFit: true,
      bestMonths: true,
    },
  });

  if (rows.length === 0) return [];

  const posts: InsightPost[] = rows.map((r) => ({
    island: r.island,
    type: r.type,
    isNotice: r.isNotice,
    sentiment: (r.sentiment as InsightPost["sentiment"]) ?? undefined,
    cautions: Array.isArray(r.cautions) ? (r.cautions as string[]) : [],
    companionFit: Array.isArray(r.companionFit) ? (r.companionFit as string[]) : [],
    bestMonths: Array.isArray(r.bestMonths) ? (r.bestMonths as number[]) : [],
  }));

  const tips: string[] = [];
  for (const islandName of uniqueIslands) {
    const islandId = resolveIslandId(islandName);
    if (!islandId) continue;

    // trip 없이 부르면 시기·동행 매칭은 건너뛰고 주의·팁 합의만 나온다.
    const insight = aggregateCommunityInsights(posts, islandId, {});
    for (const caution of insight.cautions) {
      tips.push(`${islandName} 방문객 팁: ${caution.text} (후기 ${caution.support}건)`);
    }
  }

  return tips.slice(0, 3);
}

void MONTH_NAMES;
