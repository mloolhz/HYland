import { useLayoutEffect, useRef, useState } from "react";
import { demoProps } from "@/components/landing/ToastProvider";

const DEFAULT_BOTTOM = 28;
const FOOTER_GAP = 12;

export function WritePostFab() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [bottomOffset, setBottomOffset] = useState<number | null>(null);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const footer = document.querySelector("footer#guide");
    if (!button || !footer) return;

    const updatePosition = () => {
      const viewportHeight = window.innerHeight;
      const fabHeight = button.offsetHeight;
      const footerTop = footer.getBoundingClientRect().top;
      const overlapThreshold = viewportHeight - DEFAULT_BOTTOM - fabHeight - FOOTER_GAP;

      if (footerTop < overlapThreshold) {
        setBottomOffset(viewportHeight - footerTop + FOOTER_GAP);
      } else {
        setBottomOffset(null);
      }
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(footer);
    resizeObserver.observe(button);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      className="cm-write-fab"
      aria-label="글 작성하기"
      style={
        bottomOffset !== null
          ? { bottom: `calc(${bottomOffset}px + env(safe-area-inset-bottom, 0px))` }
          : undefined
      }
      {...demoProps("글 작성은 로그인 후 이용할 수 있어요 ✍️")}
    >
      글 작성하기
    </button>
  );
}
