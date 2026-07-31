import { useCallback, useLayoutEffect, useRef, useState, type RefCallback } from "react";

type Indicator = { left: number; width: number };

/** Tracks a sliding underline under the active tab. */
export function useTabIndicator(activeKey: string) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [ind, setInd] = useState<Indicator>({ left: 0, width: 0 });
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;

  const measure = useCallback(() => {
    const el = tabRefs.current[activeKeyRef.current];
    if (!el) return;
    const next = { left: el.offsetLeft, width: el.offsetWidth };
    setInd((prev) => (prev.left === next.left && prev.width === next.width ? prev : next));
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [activeKey, measure]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [measure]);

  const setTabRef = useCallback(
    (key: string): RefCallback<HTMLElement> => (el) => {
      tabRefs.current[key] = el;
      if (key === activeKeyRef.current && el) measure();
    },
    [measure],
  );

  return { listRef, setTabRef, ind };
}
