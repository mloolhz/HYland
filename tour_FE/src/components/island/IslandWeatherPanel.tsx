import { useEffect, useState } from "react";
import { ISLAND_MAP } from "@/lib/island-data";

/** 백엔드 해양 날씨 API. 추후 공통 api 클라이언트로 교체 예정. */
const API_BASE = "http://localhost:4000";

type IslandWeather = {
  islandId: string;
  station: { id: string; name: string };
  observedAt: string | null;
  waveHeight: number | null;
  windSpeed: number | null;
  waterTemp: number | null;
  airTemp: number | null;
  activity: { level: "good" | "caution" | "bad" | "unknown"; label: string; emoji: string };
};

function fmtObserved(tm: string | null): string {
  if (!tm || tm.length < 12) return "";
  return `${+tm.slice(4, 6)}/${+tm.slice(6, 8)} ${tm.slice(8, 10)}시 관측`;
}

export function IslandWeatherPanel({ islandId }: { islandId: string }) {
  const [w, setW] = useState<IslandWeather | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setW(null);
    setError(false);
    fetch(`${API_BASE}/weather/${islandId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: IslandWeather) => alive && setW(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [islandId]);

  const name = ISLAND_MAP[islandId]?.name ?? "";

  return (
    <div className={`ow-panel${w ? ` ow-panel--${w.activity.level}` : ""}`}>
      <div className="ow-panel__head">
        <span className="ow-panel__wave" aria-hidden="true">🌊</span>
        <b className="ow-panel__title">{name} 앞바다</b>
        {w?.observedAt && <span className="ow-panel__time">{fmtObserved(w.observedAt)}</span>}
      </div>

      {error ? (
        <p className="ow-panel__msg">해양 날씨를 불러오지 못했어요. (백엔드 서버 확인)</p>
      ) : !w ? (
        <p className="ow-panel__msg">해양 관측 데이터를 불러오는 중…</p>
      ) : (
        <div className="ow-panel__body">
          <div className="ow-panel__metrics">
            <span className="ow-metric">
              <i>파고</i>
              <b>{w.waveHeight != null ? `${w.waveHeight}m` : "—"}</b>
            </span>
            <span className="ow-metric">
              <i>수온</i>
              <b>{w.waterTemp != null ? `${w.waterTemp}°` : "—"}</b>
            </span>
            <span className="ow-metric">
              <i>바람</i>
              <b>{w.windSpeed != null ? `${w.windSpeed}㎧` : "—"}</b>
            </span>
          </div>
          <div className="ow-panel__verdict">
            <span className="ow-panel__emoji" aria-hidden="true">{w.activity.emoji}</span>
            <span>{w.activity.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
