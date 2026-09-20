import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";


type Summary = {
  observedAt: string | null;
  waveHeight: number | null;
  windSpeed: number | null;
  waterTemp: number | null;
  activity: { level: "good" | "caution" | "bad" | "unknown"; label: string; emoji: string };
};

type LoadState = "loading" | "ready" | "error";

/** 인천 앞바다 요약 — 인천과 가장 가까운 섬(영종도) 기준. 여권 카드 위에 노출 */
export function IncheonWeatherBar() {
  const [s, setS] = useState<Summary | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    fetch(`${API_BASE}/weather/yeongj`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Summary) => {
        if (!alive) return;
        setS(d);
        setState("ready");
      })
      .catch(() => {
        if (alive) setState("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="incheon-wx incheon-wx--unknown" aria-busy="true">
        <span className="incheon-wx__emoji" aria-hidden="true">
          🌊
        </span>
        <div className="incheon-wx__text">
          <b>오늘 인천 앞바다</b>
          <span>해양 관측 불러오는 중…</span>
        </div>
      </div>
    );
  }

  if (state === "error" || !s) {
    return (
      <div className="incheon-wx incheon-wx--unknown">
        <span className="incheon-wx__emoji" aria-hidden="true">
          ⚠️
        </span>
        <div className="incheon-wx__text">
          <b>오늘 인천 앞바다</b>
          <span>날씨 정보를 불러오지 못했어요</span>
        </div>
      </div>
    );
  }

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
