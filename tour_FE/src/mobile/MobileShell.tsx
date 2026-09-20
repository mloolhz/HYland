import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AuthSheetProvider } from "./auth/AuthSheetProvider";
import { MobileFooter } from "./MobileFooter";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { MobileTopBar } from "./MobileTopBar";
import { useMobileAuthLinkIntercept } from "./useMobileAuthLinkIntercept";

function MobileShellInner({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const interceptAuthLinks = useMobileAuthLinkIntercept();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="m-app" onClickCapture={interceptAuthLinks}>
      <MobileTopBar onOpenMenu={() => setMenuOpen(true)} />
      <main className="m-main" key={pathname}>
        {children}
      </main>
      <MobileFooter />
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

/**
 * 모바일 전용 셸 — 얇은 상단바 + 내용 + 가로로 꽉 찬 푸터.
 *
 * 데스크톱의 SiteHeader/SiteFooter 는 쓰지 않는다. 메뉴는 오른쪽 위 버튼으로
 * 여는 서랍이고, 로그인/회원가입은 페이지가 아니라 바텀시트라서
 * AuthSheetProvider 를 여기서 깐다.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  // 화면을 옮기면 항상 맨 위에서 시작한다
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // 모바일 셸이 켜져 있는 동안에만 붙는 표시 — 공용 CSS 를 덮어쓰는 기준
  useEffect(() => {
    document.documentElement.classList.add("is-mobile-app");
    return () => document.documentElement.classList.remove("is-mobile-app");
  }, []);

  return (
    <AuthSheetProvider>
      <MobileShellInner>{children}</MobileShellInner>
    </AuthSheetProvider>
  );
}
