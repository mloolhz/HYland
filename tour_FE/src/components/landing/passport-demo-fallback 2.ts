import type { CurrentIslandBtiResult } from "@/types/island-bti";

/** 여권 모달 데모 — Context에 결과 없을 때만 프리뷰용 (allowDemoPreview) */
export const DEMO_PASSPORT_ISLAND_BTI: CurrentIslandBtiResult = {
  code: "BWCF",
  scores: { A: 2, B: 6, W: 7, L: 3, C: 6, I: 4, P: 3, F: 7 },
  testedAt: "2026-07-25T00:00:00.000Z",
};
