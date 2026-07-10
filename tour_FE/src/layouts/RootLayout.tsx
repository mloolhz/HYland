import { useCallback, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ToastProvider, useToast } from "@/components/landing/ToastProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Navbar } from "@/components/layout/Navbar";

function RootLayoutContent() {
  const loginInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const location = useLocation();

  const scrollToLogin = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      if (location.pathname !== "/") {
        window.location.href = "/#home";
        return;
      }
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => loginInputRef.current?.focus({ preventScroll: true }), 650);
    },
    [location.pathname],
  );

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
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <>
      <Navbar onScrollToLogin={scrollToLogin} />
      <ScrollToTop />
      <Outlet context={{ loginInputRef, scrollToLogin }} />
      <SiteFooter />
    </>
  );
}

export function RootLayout() {
  return (
    <ToastProvider>
      <RootLayoutContent />
    </ToastProvider>
  );
}

export type LandingOutletContext = {
  loginInputRef: React.RefObject<HTMLInputElement | null>;
  scrollToLogin: (e?: React.MouseEvent) => void;
};
