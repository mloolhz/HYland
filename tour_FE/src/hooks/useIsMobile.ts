import { useSyncExternalStore } from "react";

/**
 * 모바일 전용 화면 전환 기준
 *
 * 768px 이하는 데스크톱 레이아웃을 줄여 쓰는 게 아니라 모바일 전용 화면
 * (`src/mobile/`)을 통째로 그린다. 태블릿 가로(769px~)부터는 기존 화면 그대로다.
 */
export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * matchMedia 구독 — useState+effect 대신 useSyncExternalStore 로 같은 렌더에서
 * CommunityLayout 과 ResponsiveRoutes 가 항상 같은 값을 본다.
 * (창 가로를 줄일 때 셸만 모바일로 바뀌고 페이지는 데스크톱인 한 프레임이
 *  useAuthSheet 등에서 터지던 원인을 막는다.)
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
