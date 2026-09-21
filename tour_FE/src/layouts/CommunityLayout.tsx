import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ToastProvider } from "@/components/landing/ToastProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { NotificationProvider } from "@/store/notifications";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AuthSheetProvider } from "@/mobile/auth/AuthSheetProvider";
import { MobileFooter } from "@/mobile/MobileFooter";
import { MobileNavDrawer } from "@/mobile/MobileNavDrawer";
import { MobileTopBar } from "@/mobile/MobileTopBar";
import { useMobileAuthLinkIntercept } from "@/mobile/useMobileAuthLinkIntercept";
import { GuestBtiAiSessionReset } from "@/components/GuestBtiAiSessionReset";

function CommunityLayoutBody() {
  const isMobile = useIsMobile();
  const outlet = useOutlet();
  const { pathname } = useLocation();
  const interceptAuthLinks = useMobileAuthLinkIntercept();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("is-mobile-app", isMobile);
    return () => document.documentElement.classList.remove("is-mobile-app");
  }, [isMobile]);

  // 데스크톱에서 길게 스크롤한 뒤 폭만 줄이면 모바일 셸 + 깊은 scrollY 가 겹친다
  useEffect(() => {
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, isMobile]);

  return (
    <>
      <GuestBtiAiSessionReset />
      {!isMobile && <SiteHeader />}
      {!isMobile && <ScrollToTop />}

      {/*
        Outlet 은 항상 main > route-fade-root 한 경로만 탄다.
        조건부로 서로 다른 <Outlet /> 을 그리면 가로 리사이즈 때 라우터가 깨질 수 있다.
      */}
      <div
        className={isMobile ? "m-app" : undefined}
        style={isMobile ? undefined : { display: "contents" }}
        onClickCapture={isMobile ? interceptAuthLinks : undefined}
      >
        {isMobile && <MobileTopBar onOpenMenu={() => setMenuOpen(true)} />}
        <main className={isMobile ? "m-main" : undefined} key={isMobile ? pathname : undefined}>
          <div className="route-fade-root" data-route-fade-root>
            {outlet}
          </div>
        </main>
        {isMobile && <MobileFooter />}
      </div>

      {isMobile && <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />}
      {!isMobile && <ScrollToTopButton />}
      {!isMobile && <SiteFooter />}
    </>
  );
}

export function CommunityLayout() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <AuthSheetProvider>
          <CommunityLayoutBody />
        </AuthSheetProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}
