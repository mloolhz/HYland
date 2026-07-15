
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
import { ScrollToTopButton } from "./ScrollToTopButton";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ToastProvider, useToast } from "./ToastProvider";
import { NotificationProvider } from "@/store/notifications";

function LandingPageContent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
          // Re-run on re-enter: never unobserve; toggle class only.
          entry.target.classList.toggle("in", entry.isIntersecting);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
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
