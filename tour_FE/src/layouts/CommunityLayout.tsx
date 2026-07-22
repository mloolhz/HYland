import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { ToastProvider } from "@/components/landing/ToastProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { NotificationProvider } from "@/store/notifications";

export function CommunityLayout() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <SiteHeader />
        <ScrollToTop />
        <Outlet />
        <ScrollToTopButton />
        <SiteFooter />
      </NotificationProvider>
    </ToastProvider>
  );
}
