/** Measure sticky/fixed top chrome at runtime (never hardcode). */
export function getFixedHeaderHeight(): number {
  let total = 0;
  const seen = new Set<HTMLElement>();
  const candidates = document.querySelectorAll<HTMLElement>("header, nav, [data-fixed-top]");

  candidates.forEach((el) => {
    if (seen.has(el)) return;
    const pos = getComputedStyle(el).position;
    if (pos !== "fixed" && pos !== "sticky") return;

    const rect = el.getBoundingClientRect();
    // Only chrome stuck to the top of the viewport
    if (rect.top > 1) return;

    // Skip nested sticky/fixed inside an already-counted ancestor (avoid double-count)
    let parent = el.parentElement;
    while (parent) {
      if (parent instanceof HTMLElement && seen.has(parent)) return;
      parent = parent.parentElement;
    }

    seen.add(el);
    total += rect.height;
  });

  return total;
}

/** Scroll so `id` sits just below the fixed/sticky header. Header height is re-measured each call. */
export function scrollToSection(id: string, behavior: ScrollBehavior = "smooth"): void {
  const el = document.getElementById(id);
  if (!el) return;
  const headerH = getFixedHeaderHeight();
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerH);
  window.scrollTo({ top, behavior });
}

/** Keep CSS --head-h in sync for padding / scroll-padding (hash links). */
export function syncHeaderHeightCssVar(): void {
  document.documentElement.style.setProperty("--head-h", `${getFixedHeaderHeight()}px`);
}
