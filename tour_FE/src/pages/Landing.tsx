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
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const stagger = (selector: string, step = 90) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        el.classList.add("reveal");
        (el as HTMLElement).style.transitionDelay = `${i * step}ms`;
        io.observe(el);
      });
    };

    stagger(".ai-grid .ai-card", 120);
    stagger(".book-card .row", 70);
    stagger(".badge-grid .badge", 70);
    stagger(".stats .stat", 90);
    stagger(".cats .cat", 55);

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
