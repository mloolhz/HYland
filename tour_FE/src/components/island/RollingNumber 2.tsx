import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

type RollingNumberProps = {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  className?: string;
};

export function RollingNumber({
  value,
  duration = 1100,
  delay = 0,
  suffix,
  className,
}: RollingNumberProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setOffset(value);
      return;
    }

    let raf = 0;
    const startAt = performance.now() + delay;
    setOffset(0);

    const tick = (now: number) => {
      if (now < startAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startAt) / duration, 1);
      setOffset(easeOutCubic(progress) * value);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  return (
    <span className={className ? `isl-stat-number ${className}` : "isl-stat-number"}>
      <span className="isl-stat-roll" style={{ transform: `translateY(calc(-1.1em * ${offset}))` }}>
        {Array.from({ length: value + 1 }, (_, i) => (
          <span key={i} className="isl-stat-roll-item">
            {i}
          </span>
        ))}
      </span>
      {suffix ? <span className="isl-stat-suffix">{suffix}</span> : null}
    </span>
  );
}
