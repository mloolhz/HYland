import { useCallback, type MouseEvent } from "react";
import { useAuthSheet } from "./auth/AuthSheetProvider";

/**
 * 모바일 셸에서 /login · /signup 링크 클릭을 바텀시트로 가로챈다.
 */
export function useMobileAuthLinkIntercept() {
  const { openAuth } = useAuthSheet();

  return useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
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
}
