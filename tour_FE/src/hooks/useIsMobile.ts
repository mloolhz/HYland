import { useEffect, useState } from "react";

/**
 * 모바일 전용 화면 전환 기준
 *
 * 768px 이하는 데스크톱 레이아웃을 줄여 쓰는 게 아니라 모바일 전용 화면
 * (`src/mobile/`)을 통째로 그린다. 태블릿 가로(769px~)부터는 기존 화면 그대로다.
 */
export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

function readMatch(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(readMatch);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    // 첫 렌더와 실제 값이 어긋났을 수 있다 (개발 중 창 크기 변경 등)
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
