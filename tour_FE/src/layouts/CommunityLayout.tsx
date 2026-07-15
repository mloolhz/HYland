import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ToastProvider } from "@/components/landing/ToastProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NotificationProvider } from "@/store/notifications";

export function CommunityLayout() {
  const { pathname } = useLocation();

  return (
    <ToastProvider>
      <NotificationProvider>
        <SiteHeader />
        <ScrollToTop />
        <div key={pathname} className="animate-page-enter">
          <Outlet />
        </div>
        <SiteFooter />
      </NotificationProvider>
    </ToastProvider>
  );
}
