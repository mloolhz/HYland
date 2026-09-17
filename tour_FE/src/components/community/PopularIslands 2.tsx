import { getIslandColors } from "@/constants/island";

const ISLANDS = [
  { rank: 1, name: "무의도" as const, count: 128 },
  { rank: 2, name: "덕적도" as const, count: 96 },
  { rank: 3, name: "백령도" as const, count: 84 },
  { rank: 4, name: "자월도" as const, count: 72 },
  { rank: 5, name: "영종도" as const, count: 58 },
];

export function PopularIslands() {
  return (
    <aside className="cm-popular-card">
      <h3 className="cm-popular-title">이주의 인기 섬</h3>
      <ol className="cm-popular-list">
        {ISLANDS.map((item) => {
          const region = getIslandColors(item.name);
          return (
            <li key={item.name} className="cm-popular-row">
              <span className={`cm-popular-rank${item.rank <= 3 ? " is-top" : ""}`}>{item.rank}</span>
              <span className="cm-popular-name">{item.name}</span>
              <span className="cm-popular-tag" style={{ background: region.bg, color: region.text }}>
                {item.count}건
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
