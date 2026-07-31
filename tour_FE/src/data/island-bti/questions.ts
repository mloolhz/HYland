import type { IslandBtiQuestion } from "@/types/island-bti";

/**
 * 섬BTI 검사 문항 — 축당 5문항, 총 20문항 (2지선다)
 * AB: Active / Breezy
 * WL: Water / Land
 * CI: Crew / Independent
 * PF: Planned / Flow
 */
export const ISLAND_BTI_QUESTIONS: IslandBtiQuestion[] = [
  // ── AB: Active / Breezy (1–5) ──
  {
    id: 1,
    dimension: "AB",
    question: "인천 섬에 도착하자마자, 더 끌리는 선택은?",
    options: [
      { text: "예약해 둔 해양 레저부터 바로 시작한다", value: "A" },
      { text: "해변을 천천히 걸으며 섬 분위기부터 익힌다", value: "B" },
    ],
  },
  {
    id: 2,
    dimension: "AB",
    question: "섬에서 하루 일정을 짤 때 나에게 더 맞는 방식은?",
    options: [
      { text: "아침부터 저녁까지 활동을 알차게 채운다", value: "A" },
      { text: "중간중간 쉬는 시간을 넉넉히 넣어 여유를 둔다", value: "B" },
    ],
  },
  {
    id: 3,
    dimension: "AB",
    question: "섬 여행 중 에너지가 가장 붙는 순간은?",
    options: [
      { text: "카약·트레킹처럼 몸을 움직이는 레저를 할 때", value: "A" },
      { text: "바닷바람을 맞으며 풍경을 즐기며 쉴 때", value: "B" },
    ],
  },
  {
    id: 4,
    dimension: "AB",
    question: "섬에서의 하루를 마무리하는 방식으로 더 가까운 것은?",
    options: [
      { text: "해가 지기 전까지 바깥 활동을 이어간다", value: "A" },
      { text: "노을을 보며 천천히 하루를 정리하고 쉰다", value: "B" },
    ],
  },
  {
    id: 5,
    dimension: "AB",
    question: "섬 여행 중 체력과 일정, 나에게 더 맞는 태도는?",
    options: [
      { text: "조금 피곤해도 경험을 더 많이 쌓는 편이다", value: "A" },
      { text: "무리하지 않고 컨디션을 우선하는 편이다", value: "B" },
    ],
  },

  // ── WL: Water / Land (6–10) ──
  {
    id: 6,
    dimension: "WL",
    question: "인천 섬에서 더 마음이 가는 풍경은?",
    options: [
      { text: "에메랄드빛 바다와 잔잔한 파도", value: "W" },
      { text: "숲길과 언덕, 섬을 가로지르는 둘레길", value: "L" },
    ],
  },
  {
    id: 7,
    dimension: "WL",
    question: "섬 레저를 고를 때 더 끌리는 쪽은?",
    options: [
      { text: "카약·스노클·보트 등 물과 함께하는 활동", value: "W" },
      { text: "하이킹·사이클·캠핑 등 땅 위에서 하는 활동", value: "L" },
    ],
  },
  {
    id: 8,
    dimension: "WL",
    question: "섬에서 ‘제대로 즐겼다’고 느끼는 기준에 더 가까운 것은?",
    options: [
      { text: "바다를 직접 만지거나 물 위에서 시간을 보냈다", value: "W" },
      { text: "섬의 땅을 걸으며 넓게 둘러보았다", value: "L" },
    ],
  },
  {
    id: 9,
    dimension: "WL",
    question: "날씨가 좋은 날, 섬에서 더 가고 싶은 곳은?",
    options: [
      { text: "해수욕장·선착장·수상 레저 거점", value: "W" },
      { text: "트레킹 코스·전망대·마을 둘레길", value: "L" },
    ],
  },
  {
    id: 10,
    dimension: "WL",
    question: "섬 여행의 추억을 남긴다면 더 담고 싶은 장면은?",
    options: [
      { text: "물놀이·보트·바다 일몰이 담긴 장면", value: "W" },
      { text: "등산로·갯벌·섬 풍경이 담긴 장면", value: "L" },
    ],
  },

  // ── CI: Crew / Independent (11–15) ──
  {
    id: 11,
    dimension: "CI",
    question: "인천 섬 여행, 동행 스타일로 더 맞는 것은?",
    options: [
      { text: "친구·가족과 함께 웃고 떠드는 여행", value: "C" },
      { text: "혼자만의 리듬으로 움직이는 여행", value: "I" },
    ],
  },
  {
    id: 12,
    dimension: "CI",
    question: "섬 레저 프로그램을 선택할 때 더 편한 방식은?",
    options: [
      { text: "단체 체험이나 그룹 투어에 참여한다", value: "C" },
      { text: "1인 또는 소규모로 조용히 즐긴다", value: "I" },
    ],
  },
  {
    id: 13,
    dimension: "CI",
    question: "섬에서 식사·휴식 시간, 더 선호하는 분위기는?",
    options: [
      { text: "동행과 이야기하며 함께 보내는 시간", value: "C" },
      { text: "혼자만의 생각을 정리하며 쉬는 시간", value: "I" },
    ],
  },
  {
    id: 14,
    dimension: "CI",
    question: "섬 여행 중 예상치 못한 상황이 생기면?",
    options: [
      { text: "일행과 상의하며 함께 해결한다", value: "C" },
      { text: "스스로 판단하고 빠르게 처리한다", value: "I" },
    ],
  },
  {
    id: 15,
    dimension: "CI",
    question: "섬 여행에서 ‘행복하다’고 느끼는 순간에 더 가까운 것은?",
    options: [
      { text: "함께 웃으며 새로운 경험을 나눌 때", value: "C" },
      { text: "나만의 속도로 자유롭게 움직일 때", value: "I" },
    ],
  },

  // ── PF: Planned / Flow (16–20) ──
  {
    id: 16,
    dimension: "PF",
    question: "인천 섬 여행을 떠나기 전, 준비 방식으로 더 맞는 것은?",
    options: [
      { text: "교통·예약·코스를 미리 꼼꼼히 짜 둔다", value: "P" },
      { text: "큰 틀만 정하고 세부는 현장에서 정한다", value: "F" },
    ],
  },
  {
    id: 17,
    dimension: "PF",
    question: "섬 당일 일정이 예상과 다르게 바뀌면?",
    options: [
      { text: "미리 준비한 대안 일정으로 빠르게 조정한다", value: "P" },
      { text: "그때 끌리는 방향으로 유연하게 바꾼다", value: "F" },
    ],
  },
  {
    id: 18,
    dimension: "PF",
    question: "섬 레저 예약, 나에게 더 맞는 방식은?",
    options: [
      { text: "미리 예약해 두면 마음이 더 편하다", value: "P" },
      { text: "현장 상황을 보고 즉흥적으로 잡아도 괜찮다", value: "F" },
    ],
  },
  {
    id: 19,
    dimension: "PF",
    question: "섬 여행이 ‘잘 풀렸다’고 느껴지는 조건에 더 가까운 것은?",
    options: [
      { text: "세워 둔 계획을 대부분 해냈을 때", value: "P" },
      { text: "뜻밖의 좋은 발견이 있었을 때", value: "F" },
    ],
  },
  {
    id: 20,
    dimension: "PF",
    question: "섬 여행 짐과 체크리스트, 나의 태도에 더 가까운 것은?",
    options: [
      { text: "리스트를 만들어 빠짐없이 챙긴다", value: "P" },
      { text: "필요한 것만 가볍게 챙기고 나머지는 현장에서 맞춘다", value: "F" },
    ],
  },
];

export const ISLAND_BTI_QUESTION_COUNT = ISLAND_BTI_QUESTIONS.length;
