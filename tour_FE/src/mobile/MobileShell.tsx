import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AuthSheetProvider, useAuthSheet } from "./auth/AuthSheetProvider";
import { MobileFooter } from "./MobileFooter";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { MobileTopBar } from "./MobileTopBar";

function MobileShellInner({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { openAuth } = useAuthSheet();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * 화면 곳곳에 흩어진 "로그인" 링크(<Link to="/login">)를 한곳에서 가로챈다.
   *
   * 모바일에는 로그인 페이지가 없고 바텀시트가 그 자리를 대신한다. 링크마다
   * 고쳐 다니면 새로 추가되는 링크를 놓치므로, 셸에서 클릭을 잡아 시트를 연다.
   * 보던 화면을 떠나지 않으니 로그인 후 그대로 이어서 쓸 수 있다.
   *
   * 캡처 단계에서 잡아야 한다. 버블 단계면 <Link> 의 onClick 이 먼저 돌아
   * 이미 navigate() 가 끝난 뒤라 preventDefault 가 소용없다.
   */
  const interceptAuthLinks = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      const [path] = href.split("?");
      if (path !== "/login" && path !== "/signup") return;

      e.preventDefault();
      openAuth(path === "/signup" ? "signup" : "login");
    },
    [openAuth],
  );

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
