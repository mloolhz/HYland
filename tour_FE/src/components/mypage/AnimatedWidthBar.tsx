import { useEffect, useState } from "react";

type AnimatedWidthBarProps = {
  width: number;
  duration?: number;
  delay?: number;
  className?: string;
};

export function AnimatedWidthBar({
  width,
  duration = 1100,
  delay = 240,
  className = "mp-exp-fill",
}: AnimatedWidthBarProps) {
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCurrentWidth(width);
      return;
    }

    setCurrentWidth(0);
    const timer = window.setTimeout(() => setCurrentWidth(width), delay);
    return () => window.clearTimeout(timer);
  }, [width, delay]);

  return (
    <span
      className={className}
      style={{
        width: `${currentWidth}%`,
        transitionDuration: `${duration}ms`,
      }}
    />
  );
}
