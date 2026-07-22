import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

type CountUpNumberProps = {
  value: number;
  duration?: number;
  delay?: number;
  format?: (value: number) => string;
  suffix?: string;
  className?: string;
};

export function CountUpNumber({
  value,
  duration = 1100,
  delay = 0,
  format,
  suffix,
  className,
}: CountUpNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCurrent(value);
      return;
    }

    let raf = 0;
    const startAt = performance.now() + delay;
    setCurrent(0);

    const tick = (now: number) => {
      if (now < startAt) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - startAt) / duration, 1);
      setCurrent(Math.round(easeOutCubic(progress) * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  const text = format ? format(current) : String(current);

  return (
    <span className={className ? `mp-count-up ${className}` : "mp-count-up"}>
      {text}
      {suffix ? <span className="mp-count-up__suffix">{suffix}</span> : null}
    </span>
  );
}
