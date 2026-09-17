/** 도장 외곽 틀 — 목업처럼 도장마다 다른 형태 */
export type StampShape =
  | "circle"
  | "double-ring"
  | "hexagon"
  | "octagon"
  | "shield"
  | "scallop"
  | "ticket"
  | "oval-h"
  | "oval-v";

export const STAMP_SHAPES: StampShape[] = [
  "circle",
  "hexagon",
  "octagon",
  "shield",
  "scallop",
  "double-ring",
  "ticket",
  "oval-h",
  "oval-v",
];

export function getStampShape(questId: number): StampShape {
  return STAMP_SHAPES[questId % STAMP_SHAPES.length];
}

type ShapePath = { outer: string; inner?: string; innerDash?: string; textArc?: string };

export function getShapePaths(shape: StampShape): ShapePath {
  switch (shape) {
    case "circle":
      return {
        outer: "M50 6 A44 44 0 1 1 49.9 6",
        inner: "M50 12 A38 38 0 1 1 49.9 12",
        innerDash: "4 3",
        textArc: "M18 46 A32 32 0 0 1 82 46",
      };
    case "double-ring":
      return {
        outer: "M50 6 A44 44 0 1 1 49.9 6",
        inner: "M50 10 A40 40 0 1 1 49.9 10",
        innerDash: "2 2",
        textArc: "M16 44 A34 34 0 0 1 84 44",
      };
    case "hexagon":
      return {
        outer: "M50 8 L84 26 L84 74 L50 92 L16 74 L16 26 Z",
        inner: "M50 14 L78 28 L78 72 L50 86 L22 72 L22 28 Z",
        innerDash: "3 2.5",
        textArc: "M22 38 L50 22 L78 38",
      };
    case "octagon":
      return {
        outer: "M50 6 L78 18 L94 50 L78 82 L50 94 L22 82 L6 50 L22 18 Z",
        inner: "M50 12 L72 22 L84 50 L72 78 L50 88 L28 78 L16 50 L28 22 Z",
        innerDash: "3 2",
        textArc: "M20 36 L50 18 L80 36",
      };
    case "shield":
      return {
        outer: "M50 6 C72 6, 90 18, 90 42 C90 66, 72 86, 50 94 C28 86, 10 66, 10 42 C10 18, 28 6, 50 6 Z",
        inner: "M50 12 C68 12, 82 22, 82 42 C82 62, 68 78, 50 86 C32 78, 18 62, 18 42 C18 22, 32 12, 50 12 Z",
        innerDash: "3 2.5",
        textArc: "M18 40 Q50 20 82 40",
      };
    case "scallop":
      return {
        outer:
          "M50 8 C54 8, 58 6, 62 8 C66 10, 70 8, 74 10 C78 12, 82 10, 86 14 C90 18, 90 22, 92 26 C94 30, 92 34, 94 38 C96 42, 94 46, 94 50 C94 54, 96 58, 94 62 C92 66, 94 70, 90 74 C86 78, 82 76, 78 78 C74 80, 70 78, 66 80 C62 82, 58 80, 54 82 C50 84, 46 82, 42 80 C38 78, 34 80, 30 78 C26 76, 22 78, 18 74 C14 70, 16 66, 14 62 C12 58, 14 54, 14 50 C14 46, 12 42, 14 38 C16 34, 14 30, 18 26 C22 22, 26 24, 30 22 C34 20, 38 22, 42 20 C46 18, 50 20, 50 8 Z",
        textArc: "M20 42 Q50 18 80 42",
      };
    case "ticket":
      return {
        outer: "M24 14 L76 14 L76 28 L84 28 L84 72 L76 72 L76 86 L24 86 L24 72 L16 72 L16 28 L24 28 Z",
        inner: "M28 20 L72 20 L72 30 L78 30 L78 70 L72 70 L72 80 L28 80 L28 70 L22 70 L22 30 L28 30 Z",
        innerDash: "3 2",
        textArc: "M26 36 L74 36",
      };
    case "oval-h":
      return {
        outer: "M50 18 C78 18, 94 34, 94 50 C94 66, 78 82, 50 82 C22 82, 6 66, 6 50 C6 34, 22 18, 50 18 Z",
        inner: "M50 24 C72 24, 86 36, 86 50 C86 64, 72 76, 50 76 C28 76, 14 64, 14 50 C14 36, 28 24, 50 24 Z",
        innerDash: "4 3",
        textArc: "M14 44 Q50 28 86 44",
      };
    case "oval-v":
      return {
        outer: "M50 6 C68 6, 82 22, 82 50 C82 78, 68 94, 50 94 C32 94, 18 78, 18 50 C18 22, 32 6, 50 6 Z",
        inner: "M50 12 C64 12, 74 26, 74 50 C74 74, 64 88, 50 88 C36 88, 26 74, 26 50 C26 26, 36 12, 50 12 Z",
        innerDash: "3 2.5",
        textArc: "M26 38 Q50 18 74 38",
      };
    default:
      return getShapePaths("circle");
  }
}
