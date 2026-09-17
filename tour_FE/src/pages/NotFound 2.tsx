import { Link } from "react-router-dom";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { NotificationProvider } from "@/store/notifications";
import { ToastProvider } from "@/components/landing/ToastProvider";

export function NotFound() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <SiteHeader />
        <main className="not-found-page">
          <div className="container not-found-inner">
            <p className="not-found-code">404</p>
            <h1>페이지를 찾을 수 없어요</h1>
            <p className="not-found-desc">
              주소가 잘못되었거나 삭제된 페이지일 수 있어요.
            </p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-navy">
                홈으로 돌아가기
              </Link>
              <Link to="/community" className="btn btn-white">
                커뮤니티 보기
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter />
      </NotificationProvider>
    </ToastProvider>
  );
}
