/** Island map region colors — sourced from IslandMap.tsx pill fills */

export type IslandBti = "파도형" | "등대형" | "갯벌형" | "해류형";

export const ISLAND_BTI: Record<IslandBti, { bg: string; text: string }> = {
  파도형: { bg: "#E1F5EE", text: "#0F6E56" },
  등대형: { bg: "#FAEEDA", text: "#854F0B" },
  갯벌형: { bg: "#FBEAF0", text: "#993556" },
  해류형: { bg: "#E6F1FB", text: "#0C447C" },
};

export interface IslandColors {
  accent: string;
  bg: string;
  text: string;
}

/** Map rg1–rg8 pill colors → island chip palette */
export const ISLAND_REGION: Record<string, IslandColors> = {
  백령도: { accent: "#C9256E", bg: "#FBEAF0", text: "#993556" },
  대청도: { accent: "#C9256E", bg: "#FBEAF0", text: "#993556" },
  소청도: { accent: "#C9256E", bg: "#FBEAF0", text: "#993556" },
  연평도: { accent: "#E23B3B", bg: "#FBEAEA", text: "#9B1C1C" },
  강화도: { accent: "#1F4FB8", bg: "#E6F1FB", text: "#0C447C" },
  교동도: { accent: "#1F4FB8", bg: "#E6F1FB", text: "#0C447C" },
  석모도: { accent: "#1F4FB8", bg: "#E6F1FB", text: "#0C447C" },
  장봉도: { accent: "#E07A1F", bg: "#FAF0E6", text: "#854F0B" },
  신도: { accent: "#E07A1F", bg: "#FAF0E6", text: "#854F0B" },
  시도: { accent: "#E07A1F", bg: "#FAF0E6", text: "#854F0B" },
  모도: { accent: "#E07A1F", bg: "#FAF0E6", text: "#854F0B" },
  영종도: { accent: "#DDDA2E", bg: "#FAF8E1", text: "#4B4708" },
  무의도: { accent: "#DDDA2E", bg: "#FAF8E1", text: "#4B4708" },
  소무의도: { accent: "#DDDA2E", bg: "#FAF8E1", text: "#4B4708" },
  영흥도: { accent: "#2F8F3C", bg: "#E8F5EA", text: "#1F6B28" },
  선재도: { accent: "#2F8F3C", bg: "#E8F5EA", text: "#1F6B28" },
  자월도: { accent: "#0F4A55", bg: "#E6F1F3", text: "#0F4A55" },
  승봉도: { accent: "#0F4A55", bg: "#E6F1F3", text: "#0F4A55" },
  대이작도: { accent: "#0F4A55", bg: "#E6F1F3", text: "#0F4A55" },
  소이작도: { accent: "#0F4A55", bg: "#E6F1F3", text: "#0F4A55" },
  덕적도: { accent: "#7A3FD8", bg: "#F0EAFB", text: "#5A2FA8" },
  소야도: { accent: "#7A3FD8", bg: "#F0EAFB", text: "#5A2FA8" },
  문갑도: { accent: "#7A3FD8", bg: "#F0EAFB", text: "#5A2FA8" },
  굴업도: { accent: "#7A3FD8", bg: "#F0EAFB", text: "#5A2FA8" },
};

export interface Island {
  name: string;
  region: string;
  accent: string;
  bg: string;
  text: string;
}

const GROUPS: { region: string; names: string[] }[] = [
  { region: "백령·대청도권역", names: ["백령도", "대청도", "소청도"] },
  { region: "연평도권역", names: ["연평도"] },
  { region: "강화도권역", names: ["강화도", "교동도", "석모도"] },
  { region: "북도권역", names: ["장봉도", "신도", "시도", "모도"] },
  { region: "영종구·서해구권역", names: ["영종도", "무의도", "소무의도"] },
  { region: "영흥도권역", names: ["영흥도", "선재도"] },
  { region: "자월도권역", names: ["자월도", "승봉도", "대이작도", "소이작도"] },
  { region: "덕적도권역", names: ["덕적도", "소야도", "문갑도", "굴업도"] },
];

export const ISLAND_CATALOG: Island[] = GROUPS.flatMap(({ region, names }) =>
  names.map((name) => {
    const c = ISLAND_REGION[name] ?? { accent: "#5F6B7C", bg: "#F1F5F9", text: "#5F6B7C" };
    return { name, region, ...c };
  }),
);

export function getIslandColors(name: string): IslandColors {
  return ISLAND_REGION[name] ?? { accent: "#5F6B7C", bg: "#F1F5F9", text: "#5F6B7C" };
}

export function getIslandRegion(name: string): string {
  return ISLAND_CATALOG.find((i) => i.name === name)?.region ?? "기타";
}
