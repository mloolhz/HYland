import { getPostsSnapshot } from "@/lib/post-store";
import {
  matchesAnyActivity,
  resolveIslandId,
  TRIP_ACTIVITY_TO_COMMUNITY,
} from "@/lib/recommendation/vocabulary/activity-vocabulary";
import type { Post } from "@/types/community";
import type { TripIntent } from "@/types/recommendation";

/**
 * "○○섬 낚시 좋더라" 같은 커뮤니티 글을 추천 근거로 쓴다.
 *
 * 게시글에 island·activity가 구조화돼 있어 본문을 해석할 필요는 없다.
 * 다만 두 가지를 구분해야 한다.
 *
 *  1) 질문 글("어디가 좋을까요?")은 그 섬이 좋다는 근거가 아니다.
 *     추천 근거로는 후기/사진만 세고, 질문은 관심도로만 약하게 반영한다.
 *  2) 게시글 수는 곧 인기 편향이다. 글이 많은 섬이 무조건 좋은 섬은 아니므로
 *     "글이 있는가"를 주로 보고 반응(좋아요·댓글)은 상한을 두고 거들게 한다.
 *
 * 데이터 출처는 getPostsSnapshot() 하나뿐이라, 나중에 커뮤니티가 DB/API로
 * 옮겨가도 이 파일만 바꾸면 된다.
 */

/**
 * 추천 근거가 되는 글: 후기·사진 중 부정적이지 않은 것.
 *
 * 예전엔 후기이기만 하면 무조건 긍정 근거로 셌다. "낚시 꽝이었어요"도
 * 낚시 추천 근거가 되던 셈이다. 서버가 본문을 분석해 넣어준 sentiment로 거른다.
 * (분석 전 글은 sentiment가 없는데, 이때는 예전처럼 후기로 인정한다 —
 *  분석이 아직 안 돌았다고 근거를 잃을 이유는 없다)
 */
function isEndorsement(post: Post): boolean {
  if (post.isNotice) return false;
  if (post.type !== "review" && post.type !== "photo") return false;
  return post.sentiment !== "negative";
}

function engagementOf(post: Post): number {
  const replies = post.comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
  return post.likes + replies * 3;
}

export type CommunityEvidence = {
  tripActivity: string;
  postCount: number;
  /** 대표 글 (반응이 가장 많은 후기) */
  topPost: { id: string; title: string; likes: number; highlight?: string } | null;
};

export type CommunityMatchResult = {
  /** 0~100 */
  score: number;
  evidences: CommunityEvidence[];
  /** 활동과 무관하게 이 섬에 달린 후기 수 */
  totalEndorsements: number;
  /** 질문 글 수 — 근거는 아니지만 관심도 신호 */
  questionCount: number;
};

/** 반응 상한. 인기글 하나가 점수를 지배하지 않게 한다. */
const ENGAGEMENT_CAP = 120;

const NEUTRAL_SCORE = 50;

export function scoreCommunityMatch(islandId: string, trip: TripIntent): CommunityMatchResult {
  const posts = getPostsSnapshot().filter((p) => resolveIslandId(p.island) === islandId);

  const endorsements = posts.filter(isEndorsement);
  const questionCount = posts.length - endorsements.length;

  const empty: CommunityMatchResult = {
    score: NEUTRAL_SCORE,
    evidences: [],
    totalEndorsements: endorsements.length,
    questionCount,
  };

  if (posts.length === 0) {
    // 글이 없다고 나쁜 섬은 아니다. 커뮤니티가 아직 작아서일 뿐이라 감점하지 않는다.
    return empty;
  }

  const selected = (trip.activities ?? []).filter(
    (a) => (TRIP_ACTIVITY_TO_COMMUNITY[a]?.length ?? 0) > 0,
  );

  if (selected.length === 0) {
    // 활동을 안 골랐으면 이 섬에 후기가 쌓여 있는지 정도만 본다.
    const boost = Math.min(endorsements.length, 3) / 3;
    return { ...empty, score: Math.round(NEUTRAL_SCORE + boost * 40) };
  }

  const evidences: CommunityEvidence[] = [];
  let sum = 0;

  for (const activity of selected) {
    const names = TRIP_ACTIVITY_TO_COMMUNITY[activity];
    // 태그뿐 아니라 본문에서 언급된 활동도 본다. 태그를 "캠핑"으로 달았어도
    // 본문에 낚시 얘기가 있으면 낚시 근거로 잡힌다.
    const matched = endorsements.filter(
      (p) =>
        matchesAnyActivity(p.activity, names) ||
        (p.mentionedActivities ?? []).some((a) => matchesAnyActivity(a, names)),
    );

    if (matched.length > 0) {
      const top = [...matched].sort((a, b) => engagementOf(b) - engagementOf(a))[0];
      evidences.push({
        tripActivity: activity,
        postCount: matched.length,
        topPost: { id: top.id, title: top.title, likes: top.likes, highlight: top.highlight },
      });

      const engagement =
        Math.min(matched.reduce((n, p) => n + engagementOf(p), 0), ENGAGEMENT_CAP) / ENGAGEMENT_CAP;
      // 글이 있다는 사실이 주(0.7), 반응 크기는 보조(0.3).
      // 본문이 뚜렷하게 긍정인 후기가 섞여 있으면 조금 더 쳐준다.
      const hasPositive = matched.some((p) => p.sentiment === "positive");
      sum += 0.7 + engagement * 0.3 + (hasPositive ? 0.1 : 0);
    } else {
      // 그 활동 글은 없지만 섬 자체에 후기가 있으면 아주 약하게만 인정한다.
      sum += endorsements.length > 0 ? 0.15 : 0;
    }
  }

  return {
    score: Math.round(Math.min(100, NEUTRAL_SCORE + (sum / selected.length) * 50)),
    evidences,
    totalEndorsements: endorsements.length,
    questionCount,
  };
}
