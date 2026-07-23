
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AISection } from "./AISection";
import { BookingSection } from "./BookingSection";
import { CommunitySection } from "./CommunitySection";
import { HeroSection } from "./HeroSection";
import { LeaderboardSection } from "./LeaderboardSection";
import { MapSection } from "./MapSection";
import { MissionSection } from "./MissionSection";
import { RelatedSitesBand } from "./RelatedSitesBand";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ToastProvider } from "./ToastProvider";
import { NotificationProvider } from "@/store/notifications";

function LandingPageContent() {
  const navigate = useNavigate();
  const agentInputRef = useRef<HTMLTextAreaElement>(null);
  const [agentActive, setAgentActive] = useState(false);

  const goToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const activateAgentInput = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAgentActive(true);
    window.setTimeout(() => {
      agentInputRef.current?.focus({ preventScroll: true });
    }, 480);
  }, []);

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
    stagger(".pp-stamp-grid .pp-stamp", 70);
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
      <HeroSection
        agentInputRef={agentInputRef}
        agentActive={agentActive}
        onAgentActiveChange={setAgentActive}
      />
      <MapSection />
      <AISection onRequestCustomRecommendation={activateAgentInput} />
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
