import { useEffect, useState } from "react";

/** 백엔드 해양 날씨 API. 추후 공통 api 클라이언트로 교체 예정. */
const API_BASE = "http://localhost:4000";

type Summary = {
  observedAt: string | null;
  waveHeight: number | null;
  windSpeed: number | null;
  waterTemp: number | null;
  activity: { level: "good" | "caution" | "bad" | "unknown"; label: string; emoji: string };
};

/** 인천 앞바다 요약 — 인천과 가장 가까운 섬(영종도) 기준. 여권 카드 위에 노출 */
export function IncheonWeatherBar() {
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/weather/yeongj`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Summary) => alive && setS(d))
      .catch(() => {
        /* 조용히 숨김 */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!s) return null; // 데이터 없으면 표시 안 함

  return (
    <div className={`incheon-wx incheon-wx--${s.activity.level}`}>
      <span className="incheon-wx__emoji" aria-hidden="true">{s.activity.emoji}</span>
      <div className="incheon-wx__text">
        <b>오늘 인천 앞바다</b>
        <span>{s.activity.label}</span>
      </div>
      <div className="incheon-wx__metrics">
        <span>
          <i>파고</i> {s.waveHeight != null ? `${s.waveHeight}m` : "—"}
        </span>
        <span>
          <i>수온</i> {s.waterTemp != null ? `${s.waterTemp}°` : "—"}
        </span>
        <span>
          <i>바람</i> {s.windSpeed != null ? `${s.windSpeed}㎧` : "—"}
        </span>
      </div>
    </div>
  );
}
