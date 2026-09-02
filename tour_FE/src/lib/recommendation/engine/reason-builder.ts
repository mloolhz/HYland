import {
  IS_MOCK_WEATHER_CONTEXT,
  type IslandTravelContext,
} from "@/lib/recommendation/context/travel-context.mock";
import type { CommunityMatchResult } from "@/lib/recommendation/community/community-signal";
import type { FacilityMatchResult } from "@/lib/recommendation/facility/island-facility-index";
import type { SportsMatchResult } from "@/lib/recommendation/facility/island-sports-index";
import {
  matchesAnyActivity,
  TRIP_ACTIVITY_TO_LEISURE,
} from "@/lib/recommendation/vocabulary/activity-vocabulary";
import {
  objectParticle,
  subjectParticle,
  topicParticle,
} from "@/lib/recommendation/vocabulary/korean-particle";
import type {
  IslandRecommendationItem,
  RecommendationScoreBreakdown,
  TripIntent,
  UserPreference,
} from "@/types/recommendation";

type ReasonContext = {
  useIslandBti: boolean;
  userPreference: UserPreference | null;
  trip: TripIntent;
  visitedIslandIds: Set<string>;
};

type WeatherContext = Pick<IslandTravelContext, "weatherAlert" | "waveHeightM">;

/** "기상 조건은 보통 수준" 같은 추상 점수 대신, 특보·파고 등 구체적인 근거를 문장으로 만든다. */
function buildWeatherReason(weather: WeatherContext): string {
  const waveHeightLabel = weather.waveHeightM.toFixed(1);

  if (weather.weatherAlert === "storm") {
    return "여행 예정일에 폭풍 특보가 있어요. 일정 변경이나 실내 위주 코스를 고려하세요.";
  }
  if (weather.weatherAlert === "wind") {
    return `강풍 특보로 파도가 높아질 수 있어요(파고 약 ${waveHeightLabel}m 예상). 배편 지연·결항에 대비하세요.`;
  }
  if (weather.waveHeightM > 2) {
    return `파도가 높은 편이에요(파고 약 ${waveHeightLabel}m). 뱃멀미가 걱정되면 멀미약을 챙기세요.`;
  }
  if (weather.waveHeightM > 1.5) {
    return `파도가 다소 있는 편이에요(파고 약 ${waveHeightLabel}m). 배편 이용 시 참고하세요.`;
  }
  return `예보상 파도가 잔잔해요(파고 약 ${waveHeightLabel}m). 배편 이용하기 좋은 날씨예요.`;
}

type ActivityEvidence = {
  activity: string;
  communityPosts: number;
  names: string[];
  facilityCount: number;
};

/** 선택한 활동 순서를 유지하면서 세 소스의 근거를 활동별로 모은다. */
function collectActivityEvidence(
  trip: TripIntent,
  facility?: FacilityMatchResult,
  sports?: SportsMatchResult,
  community?: CommunityMatchResult,
): ActivityEvidence[] {
  const byActivity = new Map<string, ActivityEvidence>();
  const ensure = (activity: string) => {
    const found = byActivity.get(activity);
    if (found) return found;
    const created: ActivityEvidence = { activity, communityPosts: 0, names: [], facilityCount: 0 };
    byActivity.set(activity, created);
    return created;
  };

  for (const evidence of community?.evidences ?? []) {
    ensure(evidence.tripActivity).communityPosts = evidence.postCount;
  }
  for (const matched of sports?.matched ?? []) {
    ensure(matched.tripActivity).names.push(...matched.sportNames);
  }
  for (const matched of facility?.matchedActivities ?? []) {
    const entry = ensure(matched.tripActivity);
    entry.facilityCount = matched.count;
    entry.names.push(...matched.samples.map((f) => f.activity));
  }

  // 사용자가 고른 순서대로 보여준다 (Map 삽입 순서는 소스 순서라 뒤섞인다).
  const order = trip.activities ?? [];
  return [...byActivity.values()].sort(
    (a, b) => order.indexOf(a.activity) - order.indexOf(b.activity),
  );
}

function buildActivityEvidenceLines(
  trip: TripIntent,
  facility?: FacilityMatchResult,
  sports?: SportsMatchResult,
  community?: CommunityMatchResult,
): string[] {
  const lines: string[] = [];

  for (const entry of collectActivityEvidence(trip, facility, sports, community).slice(0, 2)) {
    const names = [...new Set(entry.names)].slice(0, 2).join(" · ");
    const topic = topicParticle(entry.activity);

    if (names && entry.communityPosts > 0) {
      const posts = `후기 ${entry.communityPosts}건`;
      lines.push(
        `${topic} ${objectParticle(names)} 즐길 수 있고, 커뮤니티에 ${subjectParticle(posts)} 올라와 있어요.`,
      );
    } else if (names) {
      // "트레킹 · 백패킹 등 1곳"처럼 이름 수와 곳 수가 어긋나 보이면 안 된다.
      // 이름은 종목·시설을 합쳐 뽑고 곳 수는 시설만 세므로 둘이 안 맞을 수 있다.
      // 활동 이름이 하나일 때만 곳 수를 붙인다.
      const single = [...new Set(entry.names)].length === 1;
      if (single && entry.facilityCount > 1) {
        lines.push(`${topic} ${objectParticle(names)} ${entry.facilityCount}곳에서 즐길 수 있어요.`);
      } else {
        lines.push(`${topic} ${objectParticle(names)} 즐길 수 있어요.`);
      }
    } else if (entry.communityPosts > 0) {
      const posts = `후기 ${entry.communityPosts}건`;
      lines.push(`${topic} 커뮤니티에 ${subjectParticle(posts)} 올라온 섬이에요.`);
    }
  }

  return lines;
}

export function buildRecommendationReasons(
  islandId: string,
  islandName: string,
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  ctx: ReasonContext,
  weather: WeatherContext,
  facility?: FacilityMatchResult,
  sports?: SportsMatchResult,
  community?: CommunityMatchResult,
): string[] {
  const reasons: string[] = [];

  // 근거를 소스별로 한 줄씩 쓰면 같은 활동이 세 번 반복된다.
  //   "커뮤니티에 바다 후기 2건이 …" / "바다 활동으로 해수욕장을 …" / "선택하신 바다 시설이 1곳 …"
  // 세 문장이 사실상 같은 말이라 이유 4줄이 중복으로 다 차버렸다.
  // 활동 하나당 한 줄로 합쳐, 그 활동에 대한 근거를 모아서 말한다.
  for (const line of buildActivityEvidenceLines(ctx.trip, facility, sports, community)) {
    reasons.push(line);
  }

  // 퍼센트 수치는 접이식 점수 상세에만 둔다. 여기서 또 쓰면 점수표·설명문과 함께
  // 같은 사실이 한 카드에 세 번 반복된다.
  if (ctx.useIslandBti && ctx.userPreference && scores.islandBtiMatch >= 70) {
    reasons.push("섬BTI 성향과 잘 맞는 섬이에요.");
  } else if (ctx.useIslandBti && ctx.userPreference) {
    reasons.push("섬BTI 성향을 반영해 후보를 선별했습니다.");
  }

  if (scores.currentTripMatch >= 75) {
    reasons.push("이번 여행 스타일과 잘 맞아요.");
  }

  // 파고·특보가 아직 mock이라, 이걸 근거로 쓰면 위쪽 날씨 카드(Gemini 실검색)와
  // 서로 모순되는 문장이 한 화면에 같이 뜬다. 실제 기상 API를 붙이기 전까지는 생략한다.
  if (!IS_MOCK_WEATHER_CONTEXT) {
    reasons.push(buildWeatherReason(weather));
  }

  // 활동을 안 골랐거나 매칭된 게 없을 때도, 시설 규모는 말해줄 수 있다.
  if (facility && facility.matchedActivities.length === 0 && facility.total >= 5) {
    reasons.push(`섬 안에 레저 시설이 ${facility.total}곳 있어 즐길거리가 많아요.`);
  }

  if (scores.transport >= 75) {
    reasons.push("교통 접근성이 비교적 좋습니다.");
  }

  if (ctx.trip.duration && scores.condition >= 80) {
    reasons.push("여행 기간 조건에 적합합니다.");
  }

  if (!ctx.visitedIslandIds.has(islandId)) {
    reasons.push("아직 여권에 도장이 없는 섬이라 새로운 탐험지로 추천했어요.");
  }

  if (reasons.length === 0) {
    reasons.push(`${islandName}의 레저·환경 조건이 이번 여행과 맞습니다.`);
  }

  return reasons.slice(0, 4);
}

/**
 * 카드에 "○○에서 △△ 활동을 즐기기 좋아요"로 나가는 활동 목록.
 *
 * 예전엔 island-recommendation-features.ts에 손으로 적어둔 activities를 썼는데,
 * 그 값이 실제 데이터와 어긋난다. 석모도는 "등대·트레킹·카약"으로 적혀 있지만
 * 종목 데이터에는 해수욕장·캠핑·온천뿐이라 겹치는 게 하나도 없다(8개 섬 전부 불일치).
 * 순위는 실제 데이터로 매기면서 설명만 하드코딩으로 하면, 카드가 데이터에 없는
 * 활동을 할 수 있다고 말하게 된다.
 *
 * 그래서 실제 종목 → 실제 시설 순으로 쓰고, 둘 다 없을 때만 하드코딩으로 물러난다.
 */
export function pickRecommendedActivities(
  islandActivities: string[],
  tripActivities: string[] | undefined,
  realActivities?: { sportNames: string[]; facilityActivities: string[] },
  limit = 3,
): string[] {
  const fromData = [
    ...new Set([...(realActivities?.sportNames ?? []), ...(realActivities?.facilityActivities ?? [])]),
  ];

  const pool = fromData.length > 0 ? fromData : islandActivities;

  if (!tripActivities?.length) return pool.slice(0, limit);

  // 추천 이유는 TRIP_ACTIVITY_TO_LEISURE 매핑으로 활동을 맞추는데, 여기서만
  // 단순 부분문자열 비교를 써서 결과가 어긋났다. "바다"는 "해수욕장"과 글자가
  // 겹치지 않아 영영 매칭되지 않는다. 같은 매핑을 쓰도록 통일한다.
  const wanted = tripActivities.flatMap((a) => TRIP_ACTIVITY_TO_LEISURE[a] ?? [a]);
  const matched = pool.filter((activity) => matchesAnyActivity(activity, wanted));

  if (matched.length > 0) {
    return [...matched, ...pool.filter((a) => !matched.includes(a))].slice(0, limit);
  }
  return pool.slice(0, limit);
}

export function buildRecommendationTags(
  scores: Omit<RecommendationScoreBreakdown, "finalScore">,
  visited: boolean,
): string[] {
  const tags: string[] = [];
  if (scores.islandBtiMatch >= 80) tags.push("섬BTI 일치");
  if (scores.currentTripMatch >= 85) tags.push("여행 의도 적합");
  if (scores.weather >= 80) tags.push("날씨 양호");
  if (!visited) tags.push("미방문");
  return tags;
}

/**
 * 점수가 높은 순으로 3개를 고른다.
 *
 * 예전엔 여기서 spreadFinalScores로 편차를 1.5배 늘렸다. 추천도(%)를 카드에
 * 보여주던 시절, 1~3위가 83~90처럼 붙어 있으면 순위 차이가 안 읽혔기 때문이다.
 * 지금은 점수도 순위도 화면에 없어서 목적이 사라졌고, 35~99 클램프가 동점을
 * 만들어 정렬이 데이터 배열 순서에 좌우될 위험만 남아 제거했다.
 * (140개 조건으로 확인: 3위 자리가 상한에 닿는 경우 0건 — 결과는 동일하다)
 */
export function pickTopIslands(items: IslandRecommendationItem[]): IslandRecommendationItem[] {
  return [...items].sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);
}
