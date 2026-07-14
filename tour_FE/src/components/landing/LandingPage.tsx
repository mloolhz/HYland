
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AISection } from "./AISection";
import { BookingSection } from "./BookingSection";
import { CommunitySection } from "./CommunitySection";
import { HeroSection } from "./HeroSection";
import { LeaderboardSection } from "./LeaderboardSection";
import { MapSection } from "./MapSection";
import { MissionSection } from "./MissionSection";
import { RelatedSitesBand } from "./RelatedSitesBand";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ToastProvider, useToast } from "./ToastProvider";
import { NotificationProvider } from "@/store/notifications";

function LandingPageContent() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const goToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("[data-demo]");
      if (!target) return;
      event.preventDefault();
      showToast((target as HTMLElement).dataset.demo ?? "");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [showToast]);

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
    stagger(".cats .cat", 55);

    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const hs = document.querySelector(".hero-slides") as HTMLElement | null;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (hs && y < window.innerHeight * 1.3) {
          hs.style.transform = `translateY(${y * 0.22}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <MapSection />
      <AISection />
      <BookingSection />
      <MissionSection />
      <LeaderboardSection onGoToLogin={goToLogin} />
      <CommunitySection />
      <RelatedSitesBand />
      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}

export function LandingPage() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <LandingPageContent />
      </NotificationProvider>
    </ToastProvider>
  );
}
