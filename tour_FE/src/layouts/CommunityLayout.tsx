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

  return (
    <ToastProvider>
      <NotificationProvider>
        {isMobile ? (
          // 모바일은 상단바 + 하단 탭바 셸을 쓴다 (SiteHeader/SiteFooter 없음)
          <MobileShell>
            <div className="route-fade-root" data-route-fade-root>
              <Outlet />
            </div>
          </MobileShell>
        ) : (
          <>
            <SiteHeader />
            <ScrollToTop />
            <div className="route-fade-root" data-route-fade-root>
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
