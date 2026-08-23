import { useEffect, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/route-fade";

type PageFadeProps = {
  children: ReactNode;
  active: boolean;
};

export function PageFade({ children, active }: PageFadeProps) {
  const [visible, setVisible] = useState(() => !active || prefersReducedMotion());

  useEffect(() => {
    if (!active || prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <div className={`page-fade${visible ? " is-visible" : ""}`}>{children}</div>;
}
