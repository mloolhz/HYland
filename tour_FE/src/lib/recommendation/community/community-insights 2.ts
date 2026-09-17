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

/**
 * 주의사항을 주제로 묶고, 각 주제를 "여행에 바로 쓰는 구체적 조언"으로 바꾼다.
 * 예전엔 "주차 공간"처럼 주제 이름만 보여줬는데, 그건 팁이라기보다 라벨이었다.
 * 방문객이 그대로 행동할 수 있는 문장으로 구체화한다.
 */
const CAUTION_TOPICS: { key: string; hints: string[]; advice: string }[] = [
  {
    key: "parking",
    hints: ["주차"],
    advice: "주차 공간이 넉넉하지 않으니 아침 일찍 가거나 대중교통·배편을 이용하세요.",
  },
  {
    key: "ferry",
    hints: ["배 시간", "배편", "결항", "선착장", "막배"],
    advice: "배편 시간이 자주 바뀌니 출발 전 운항 시간과 막배 시각을 꼭 확인하세요.",
  },
  {
    key: "tide",
    hints: ["물때", "만조", "간조", "썰물", "밀물"],
    advice: "갯벌·해안 활동은 물때(간조·만조) 시간을 미리 확인하고 일정을 잡으세요.",
  },
  {
    key: "reserve",
    hints: ["예약", "매진"],
    advice: "성수기에는 미리 예약하지 않으면 자리가 없을 수 있으니 예약을 서두르세요.",
  },
  {
    key: "sun",
    hints: ["그늘", "자외선", "햇빛", "모자", "양산"],
    advice: "그늘이 적으니 모자·양산·자외선 차단제를 챙기세요.",
  },
  {
    key: "amenity",
    hints: ["현금", "화장실", "편의점", "식당", "챙기", "매점"],
    advice: "섬 안 편의시설이 한정적이니 물·먹거리·현금을 미리 준비하세요.",
  },
];

/** 주의 문장 → 주제 key (매칭 안 되면 null — 팁으로 안 쓴다) */
function topicKeyOf(caution: string): string | null {
  return CAUTION_TOPICS.find((t) => t.hints.some((h) => caution.includes(h)))?.key ?? null;
}

function adviceOf(key: string): string {
  return CAUTION_TOPICS.find((t) => t.key === key)?.advice ?? key;
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
  // 팁은 "여행에 도움되는 실용 정보"라 후기의 전체 논조와 무관하게 유용하다.
  // ("주차 힘들었어요"가 별점 낮은 글에 있어도 방문객에겐 도움이 된다)
  // 그래서 시기·동행 합의(reviews, non-negative)와 달리, 팁은 후기·사진 전체에서
  // 뽑는다. 단, 불평 문장은 이미 추출 단계(community-analysis)에서 걸러졌다.
  const cautionSource = posts.filter(
    (p) => !p.isNotice && (p.type === "review" || p.type === "photo"),
  );
  const topicCount = new Map<string, number>();
  for (const post of cautionSource) {
    const keys = new Set(
      (post.cautions ?? []).map(topicKeyOf).filter((k): k is string => k !== null),
    );
    for (const key of keys) topicCount.set(key, (topicCount.get(key) ?? 0) + 1);
  }
  const cautions = [...topicCount.entries()]
    .filter(([, support]) => support >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key, support]) => ({ text: adviceOf(key), support }));

  return { seasonMatch, companionMatch, cautions, reviewCount: reviews.length };
}
