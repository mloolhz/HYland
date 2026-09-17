/**
 * 이미지 업로드 (tour_BE `/uploads`)
 *
 * 프론트가 이미 만드는 미리보기용 data URL 을 그대로 보낸다.
 * 서버가 파일로 떨어뜨리고 접근 가능한 URL 을 돌려준다.
 */
import { API_BASE } from "@/lib/api-base";
import { ApiError } from "@/api/auth";
import { readToken } from "@/lib/token";

/** File → data URL (FileReader) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("이미지를 읽지 못했어요"));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const res = await fetch(`${API_BASE}/uploads/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(readToken() ? { Authorization: `Bearer ${readToken()}` } : {}),
    },
    body: JSON.stringify({ dataUrl }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? "이미지를 올리지 못했어요.");
  return body.url as string;
}
