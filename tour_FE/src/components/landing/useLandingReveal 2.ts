import { useEffect } from "react";

function isInView(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.94 && rect.bottom > 0;
}

function revealNow(el: Element) {
  el.classList.add("in");
}

function observeReveal(el: Element, io: IntersectionObserver) {
  if (el.classList.contains("in")) return;
  io.observe(el);
  if (isInView(el)) revealNow(el);
}

/** 랜딩 스크롤 등장 — 이미 보이는 요소·동적 추가 요소도 숨기지 않도록 처리 */
export function useLandingReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -4% 0px" },
    );

    const scan = (root: ParentNode = document) => {
      root.querySelectorAll(".reveal:not(.in)").forEach((el) => observeReveal(el, io));
    };

    const stagger = (selector: string, step = 90) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        (el as HTMLElement).style.transitionDelay = `${i * step}ms`;
        observeReveal(el, io);
      });
    };

    scan();

    stagger(".ai-grid .ai-card", 120);

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) observeReveal(node, io);
          node.querySelectorAll(".reveal:not(.in)").forEach((el) => observeReveal(el, io));
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => scan());
    });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
