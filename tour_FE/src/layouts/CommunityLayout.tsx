import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ToastProvider } from "@/components/landing/ToastProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { NotificationProvider } from "@/store/notifications";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileShell } from "@/mobile/MobileShell";

export function CommunityLayout() {
  const isMobile = useIsMobile();

  // 데스크톱에서 길게 스크롤한 뒤 폭만 줄이면 모바일 셸 + 깊은 scrollY 가 겹친다
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [isMobile]);

  return (
    <ToastProvider>
      <NotificationProvider>
        {isMobile ? (
          // 모바일은 상단바 + 하단 탭바 셸을 쓴다 (SiteHeader/SiteFooter 없음)
          <MobileShell>
            <div key="mobile" className="route-fade-root" data-route-fade-root>
              <Outlet />
            </div>
          </MobileShell>
        ) : (
          <>
            <SiteHeader />
            <ScrollToTop />
            <div key="desktop" className="route-fade-root" data-route-fade-root>
              <Outlet />
            </div>
            <ScrollToTopButton />
            <SiteFooter />
          </>
        )}
      </NotificationProvider>
    </ToastProvider>
  );
}
