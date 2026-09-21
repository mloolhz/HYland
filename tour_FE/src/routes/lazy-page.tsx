import type { ComponentType } from "react";
import { RequireAuth } from "@/components/RequireAuth";

const RELOAD_FLAG = "hyland:chunk-reload";

/**
 * 첫 화면에 필요 없는 페이지를 따로 떼어 들어갈 때 받는다 (react-router `lazy`).
 *
 * 예전에는 모든 페이지가 번들 하나(약 920KB)에 들어 있어, 랜딩만 보려 해도
 * AI 추천·섬BTI·관리자 화면까지 전부 받아야 했다.
 *
 * 새로 배포하면 옛 조각 파일이 사라진다. 배포 전에 열어 둔 탭에서 이동하면
 * 조각을 못 받아 오류가 나므로, 그때는 한 번만 새로고침해 새 번들을 받는다.
 */
export function lazyPage<M, K extends keyof M>(
  load: () => Promise<M>,
  name: K,
  options: { auth?: boolean } = {},
) {
  return async () => {
    let mod: M;
    try {
      mod = await load();
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch (err) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
        // 새로고침되는 동안 오류 화면이 번쩍이지 않게 끝나지 않는 약속을 돌려준다
        return new Promise<never>(() => {});
      }
      throw err;
    }

    const Page = mod[name] as unknown as ComponentType;
    if (options.auth) {
      return {
        element: (
          <RequireAuth>
            <Page />
          </RequireAuth>
        ),
      };
    }
    return { Component: Page };
  };
}
