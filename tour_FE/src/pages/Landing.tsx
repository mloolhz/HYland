import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { AISection } from "@/components/landing/AISection";
import { BookingSection } from "@/components/landing/BookingSection";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LeaderboardSection } from "@/components/landing/LeaderboardSection";
import { MapSection } from "@/components/landing/MapSection";
import { MissionSection } from "@/components/landing/MissionSection";
import { PortalBand } from "@/components/landing/PortalBand";
import { StatsStrip } from "@/components/landing/StatsStrip";
import type { LandingOutletContext } from "@/layouts/RootLayout";

export function Landing() {
  const { loginInputRef, scrollToLogin } = useOutletContext<LandingOutletContext>();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            // Enter slightly after the top rises into view (avoids 1px flash at the fold).
            if (entry.boundingClientRect.top < window.innerHeight - 100) {
              el.classList.add("in");
            }
            return;
          }
          // Leave only when fully outside the viewport — not at the -10% rootMargin line.
          const r = entry.boundingClientRect;
          if (r.top >= window.innerHeight || r.bottom <= 0) {
            el.classList.remove("in");
          }
        });
      },
      { threshold: 0, rootMargin: "0px" },
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const hs = document.querySelector(".hero-slides") as HTMLElement | null;
    const pb = document.querySelector(".portal-band") as HTMLElement | null;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (hs && y < window.innerHeight * 1.3) {
          hs.style.transform = `translateY(${y * 0.22}px)`;
        }
        if (pb) {
          const r = pb.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
            pb.style.backgroundPosition = `center ${28 + p * 26}%`;
          }
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <HeroSection loginInputRef={loginInputRef} />
      <StatsStrip />
      <MapSection />
      <AISection />
      <BookingSection />
      <MissionSection />
      <LeaderboardSection onScrollToLogin={scrollToLogin} />
      <CommunitySection />
      <PortalBand />
    </>
  );
}
