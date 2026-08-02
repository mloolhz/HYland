
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AISection } from "./AISection";
import { CommunitySection } from "./CommunitySection";
import { HeroSection } from "./HeroSection";
import { MapSection } from "./MapSection";
import { MissionSection } from "./MissionSection";
import { RelatedSitesBand } from "./RelatedSitesBand";
import { SportsSection } from "./SportsSection";
import { useLandingReveal } from "./useLandingReveal";
import { IslandBtiPromoModal } from "@/components/island-bti/IslandBtiPromoModal";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { ToastProvider } from "./ToastProvider";
import { NotificationProvider } from "@/store/notifications";

function LandingPageContent() {
  const navigate = useNavigate();

  useLandingReveal();

  const goToAiRecommend = useCallback(() => {
    navigate("/ai-recommend");
  }, [navigate]);

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
      <IslandBtiPromoModal />
      <HeroSection />
      <MapSection />
      <SportsSection />
      <AISection onRequestCustomRecommendation={goToAiRecommend} />
      <MissionSection />
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
