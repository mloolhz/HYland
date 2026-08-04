export const ROUTE_FADE_MS = 280;

export type CommunityEnterFadeState = {
  communityEnterFade?: boolean;
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const ROUTE_FADE_ROOT_SELECTOR = "[data-route-fade-root]";

export function fadeOutRouteRoot(): void {
  document.querySelector(ROUTE_FADE_ROOT_SELECTOR)?.classList.add("is-route-fading-out");
}

export function clearRouteFadeOut(): void {
  document.querySelector(ROUTE_FADE_ROOT_SELECTOR)?.classList.remove("is-route-fading-out");
}

/** fade-out 상태의 route root를 새 페이지에서 fade-in */
export function fadeInRouteRoot(): void {
  const root = document.querySelector<HTMLElement>(ROUTE_FADE_ROOT_SELECTOR);
  if (!root?.classList.contains("is-route-fading-out")) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("is-route-fading-out");
    });
  });
}
