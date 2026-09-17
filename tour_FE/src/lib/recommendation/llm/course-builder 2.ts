import { ISLAND_MAP } from "@/lib/island-data";
import { getIslandFacilitySummary } from "@/lib/recommendation/facility/island-facility-index";
import { objectParticle } from "@/lib/recommendation/vocabulary/korean-particle";
import type { CourseStep } from "@/types/ai-recommend";
import type { IslandRecommendationItem, TripIntent } from "@/types/recommendation";

/**
 * 조건 패널 추천에 붙는 하루 코스.
 *
 * 예전에는 활동명 3개를 "인천항 출발"과 "일몰 감상 후 귀항" 사이에 끼운 5줄이
 * 전부였다. 시간도 장소도 없어서 접어둘 만한 내용이 아니었다.
 *
 * 일반 질문 답변의 코스(Gemini)는 시간·활동·설명을 갖춘 타임라인인데,
 * 조건 패널 턴은 일부러 Gemini를 부르지 않는다(섬 3곳 × 호출이면 느리고
 * 할당량도 감당이 안 된다). 그래서 같은 모양의 코스를 이미 가진 데이터로 만든다.
 * 배편·소요시간은 섬 정보에서, 들를 곳은 실제 레저시설 이름에서 가져온다.
 */

/** "약 1시간 30분" → 90 */
function parseTravelMinutes(travelTime: string | undefined): number {
  if (!travelTime) return 60;
  const hours = Number(travelTime.match(/(\d+)\s*시간/)?.[1] ?? 0);
  const minutes = Number(travelTime.match(/(\d+)\s*분/)?.[1] ?? 0);
  const total = hours * 60 + minutes;
  return total > 0 ? total : 60;
}

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * 1박 이상이면 며칠째인지 붙인다.
 * 안 붙이면 "18:00 숙소 체크인" 다음에 "10:30"이 나와 시간이 거꾸로 가는 것처럼 보인다.
 */
function label(day: number, minutes: number, overnight: boolean): string {
  return overnight ? `${day}일차 ${formatTime(minutes)}` : formatTime(minutes);
}

/** 30분 단위로 올림 — "10:47 출발" 같은 어색한 시각을 피한다. */
function roundUpToHalfHour(minutes: number): number {
  return Math.ceil(minutes / 30) * 30;
}

const DEPARTURE_MINUTES = 9 * 60; // 09:00

/**
 * 선택한 활동에 해당하는 시설을 우선으로, 그 섬의 대표 시설을 뽑는다.
 * 같은 활동만 연달아 나오지 않게 활동별로 하나씩 돌아가며 고른다.
 */
function pickStops(islandId: string, item: IslandRecommendationItem, limit: number) {
  const summary = getIslandFacilitySummary(islandId);
  if (!summary) return [];

  const preferred = new Set(item.facilityHighlights?.map((f) => f.activity) ?? []);
  const groups = [...summary.byActivity.entries()].sort((a, b) => {
    const aPref = preferred.has(a[0]) ? 0 : 1;
    const bPref = preferred.has(b[0]) ? 0 : 1;
    return aPref - bPref || b[1].length - a[1].length;
  });

  const stops: { name: string; activity: string }[] = [];
  let round = 0;
  while (stops.length < limit && round < 4) {
    for (const [activity, facilities] of groups) {
      const facility = facilities[round];
      if (!facility) continue;
      stops.push({ name: facility.name, activity });
      if (stops.length >= limit) break;
    }
    round += 1;
  }
  return stops;
}

export function buildRecommendationCourse(
  item: IslandRecommendationItem,
  trip: TripIntent,
): { title: string; steps: CourseStep[] } {
  const island = ISLAND_MAP[item.islandId];
  const travelMinutes = parseTravelMinutes(island?.travelTime);
  const overnight = (trip.duration ?? 1) >= 2;

  const steps: CourseStep[] = [];
  let clock = DEPARTURE_MINUTES;
  let day = 1;

  steps.push({
    time: label(day, clock, overnight),
    activity: island?.ferryRoute ? `${island.ferryRoute} 승선` : "섬으로 출발",
    desc: island?.travelTime
      ? `여객터미널에서 승선해요. 이동 ${island.travelTime} 소요.`
      : "여객터미널에서 승선해요.",
  });

  clock = roundUpToHalfHour(clock + travelMinutes);
  steps.push({
    time: label(day, clock, overnight),
    activity: `${item.islandName} 도착`,
    desc: "선착장에서 이동 수단을 확인하고 일정을 시작해요.",
  });

  // 당일치기는 점심 포함 3곳, 1박 이상이면 더 여유 있게 5곳을 돈다.
  const stops = pickStops(item.islandId, item, overnight ? 5 : 3);

  stops.forEach((stop, index) => {
    // 낮 12시를 넘기는 첫 지점 앞에 식사를 끼운다.
    if (clock < 12 * 60 && clock + 120 >= 12 * 60 && !steps.some((s) => s.activity === "점심 식사")) {
      clock = roundUpToHalfHour(clock + 90);
      steps.push({
        time: label(day, clock, overnight),
        activity: "점심 식사",
        desc: "선착장 주변 식당가나 마을 식당을 이용해요.",
      });
    }

    clock = roundUpToHalfHour(clock + (index === 0 ? 60 : 90));
    steps.push({
      time: label(day, clock, overnight),
      activity: stop.name,
      desc: `${objectParticle(stop.activity)} 즐길 수 있는 곳이에요.`,
    });

    if (overnight && index === 2) {
      clock = roundUpToHalfHour(clock + 120);
      steps.push({
        time: label(day, clock, overnight),
        activity: "숙소 체크인 · 저녁",
        desc: "섬 안 숙소에 짐을 풀고 저녁을 먹어요. 다음 날 일정을 여유 있게 잡을 수 있어요.",
      });
      day += 1;
      clock = 9 * 60; // 이튿날 아침
    }
  });

  clock = roundUpToHalfHour(clock + 90);
  steps.push({
    time: label(day, clock, overnight),
    activity: "귀항",
    desc: island?.travelTime
      ? `돌아오는 배도 ${island.travelTime} 걸려요. 출발 시각을 미리 확인하세요.`
      : "돌아오는 배 시각을 미리 확인하세요.",
  });

  return {
    title: overnight ? `${item.islandName} 1박 2일 코스` : `${item.islandName} 당일 코스`,
    steps,
  };
}
