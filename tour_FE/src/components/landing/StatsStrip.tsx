
import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/landing-data";

const STATS = [
  { target: 168, suffix: "+", label: "인천의 섬" },
  { target: 128, suffix: "", label: "레저 코스" },
  { target: 3562, suffix: "", label: "등록 탐험가" },
  { target: 1248, suffix: "", label: "누적 후기" },
] as const;

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        const dur = 1200;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{formatNumber(value)}</span>;
}

export function StatsStrip() {
  return (
    <div className="container">
      <div className="stats reveal" aria-label="서비스 현황">
        {STATS.map((stat) => (
          <div className="stat" key={stat.label}>
            <b>
              <CountUp target={stat.target} />
              {stat.suffix && <em>{stat.suffix}</em>}
            </b>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
