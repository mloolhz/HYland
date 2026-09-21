import { useState } from "react";
import { FACILITY_PLACEHOLDER } from "@/lib/facility-photo";

/**
 * 모바일 카드·상세의 대표 사진.
 * 사진이 없거나 파일이 없어 로딩에 실패하면 "인천 섬 레저누리 · 사진 준비 중"
 * 자리표시 이미지로 떨어진다 (데스크톱 시설 카드와 같은 이미지).
 */
export function MobilePhoto({
  src,
  alt = "",
  lazy = true,
}: {
  src?: string | null;
  alt?: string;
  lazy?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const url = src?.trim() ?? "";
  const placeholder = !url || failedSrc === url;

  return (
    <img
      src={placeholder ? FACILITY_PLACEHOLDER : url}
      alt={placeholder ? "" : alt}
      aria-hidden={placeholder || undefined}
      loading={lazy ? "lazy" : undefined}
      /* 자리표시까지 실패하면 되돌릴 곳이 없으므로 실제 사진일 때만 감시한다 */
      onError={placeholder ? undefined : () => setFailedSrc(url)}
    />
  );
}
