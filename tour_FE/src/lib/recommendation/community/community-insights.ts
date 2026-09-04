import { resolveIslandId } from "@/lib/recommendation/vocabulary/activity-vocabulary";
import type { TripIntent } from "@/types/recommendation";

/**
 * 집계에 필요한 최소 형태. FE의 Post와 BE의 DB 행이 둘 다 이 모양을 만족하므로
 * (구조적 타이핑), 이 모듈은 어느 쪽에서 부르든 그대로 동작한다.
 * 그래서 자유 질문(백엔드 Gemini)과 조건 패널(FE 엔진)이 같은 합의 로직을 쓴다.
 */
export type InsightPost = {
  island: string;
  isNotice?: boolean;
  type: string;
  sentiment?: "positive" | "neutral" | "negative";
  bestMonths?: number[];
  companionFit?: string[];
  cautions?: string[];
};

/**
 * 섬별 커뮤니티 후기를 "합의(consensus)"로 집계한다.
 *
 * 글 한 건에서 뽑은 사실("9월이 좋았다")은 개인 취향일 수 있어 못 믿는다.
 * 하지만 수십·수백 명이 같은 말을 하면 그건 신호다. 이 모듈은 그 전환점을
 * 잡기 위해 설계됐다 — 글이 많이 쌓였을 때를 가정한 기능이다.
 *
 * 그래서 두 가지를 지킨다.
 *  1) 최소 지지 수(minSupport)를 넘겨야 합의로 인정한다. 글이 적으면 아무것도
 *     안 뜨고(near-neutral), 많이 쌓여야 진짜 패턴이 드러난다.
 *  2) 개별 글의 목소리 크기(좋아요)로 순위를 흔들지 않는다. "몇 명이 말했나"만 센다.
 *
 * 부정 후기는 집계에서 뺀다(추천 근거가 아니므로).
 */

function isUsable(post: InsightPost): boolean {
  if (post.isNotice) return false;
  if (post.type !== "review" && post.type !== "photo") return false;
  return post.sentiment !== "negative";
}

/**
 * 합의로 인정할 최소 지지 수.
 * 후기가 많을수록 문턱을 조금씩 올려, 소수 의견이 전체를 대표하지 않게 한다.
 * (10건이면 2명, 100건이면 5명 정도가 같은 말을 해야 합의로 본다)
 */
function minSupport(total: number): number {
  return Math.max(2, Math.round(Math.sqrt(total)));
}

export type CommunityInsight = {
  /** 여행 달과 겹치는 "좋은 시기" 합의가 있는가 */
  seasonMatch: { month: number; support: number } | null;
  /** 여행 동행과 맞는 합의가 있는가 */
  companionMatch: { companion: string; support: number } | null;
  /** 방문객이 자주 언급한 주의·팁 (빈도순) */
  cautions: { text: string; support: number }[];
  /** 집계에 쓴 후기 수 */
  reviewCount: number;
};

const EMPTY: CommunityInsight = {
  seasonMatch: null,
  companionMatch: null,
  cautions: [],
  reviewCount: 0,
};

function monthOf(trip: TripIntent): number | null {
  if (!trip.travelDate) return null;
  const m = Number(trip.travelDate.slice(5, 7));
  return m >= 1 && m <= 12 ? m : null;
}

/** 비슷한 주의사항을 한 덩어리로 묶기 위한 대표 키워드. */
const CAUTION_TOPICS: { topic: string; hints: string[] }[] = [
  { topic: "주차 공간", hints: ["주차"] },
  { topic: "배편 시간", hints: ["배 시간", "배편", "결항", "선착장"] },
  { topic: "물때 확인", hints: ["물때", "만조", "간조", "썰물", "밀물"] },
  { topic: "미리 예약", hints: ["예약", "매진"] },
  { topic: "챙길 것", hints: ["챙기", "그늘", "현금", "화장실", "편의점", "식당"] },
];

function topicOf(caution: string): string {
  const hit = CAUTION_TOPICS.find((t) => t.hints.some((h) => caution.includes(h)));
  return hit?.topic ?? caution;
}

export function aggregateCommunityInsights(
  posts: InsightPost[],
  islandId: string,
  trip: TripIntent,
): CommunityInsight {
  const reviews = posts.filter(
    (p) => resolveIslandId(p.island) === islandId && isUsable(p),
  );
  if (reviews.length === 0) return EMPTY;

  const threshold = minSupport(reviews.length);

  // ── 좋은 시기 ──────────────────────────────────────────
  const tripMonth = monthOf(trip);
  let seasonMatch: CommunityInsight["seasonMatch"] = null;
  if (tripMonth) {
    const support = reviews.filter((p) => (p.bestMonths ?? []).includes(tripMonth)).length;
    if (support >= threshold) seasonMatch = { month: tripMonth, support };
  }

  // ── 동행 적합 ──────────────────────────────────────────
  let companionMatch: CommunityInsight["companionMatch"] = null;
  if (trip.companion) {
    const support = reviews.filter((p) => (p.companionFit ?? []).includes(trip.companion!)).length;
    if (support >= threshold) companionMatch = { companion: trip.companion, support };
  }

  // ── 주의·팁 (주제로 묶어 빈도순) ───────────────────────
  const topicCount = new Map<string, number>();
  for (const post of reviews) {
    const topics = new Set((post.cautions ?? []).map(topicOf));
    for (const topic of topics) topicCount.set(topic, (topicCount.get(topic) ?? 0) + 1);
  }
  const cautions = [...topicCount.entries()]
    .filter(([, support]) => support >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([text, support]) => ({ text, support }));

  return { seasonMatch, companionMatch, cautions, reviewCount: reviews.length };
}
