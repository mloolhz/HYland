import { useMemo } from "react";
import { mergeUserProfile, type UserProfile } from "@/lib/user-profile";
import { useSession } from "@/store/session";

/**
 * 화면에 쓰는 사용자 프로필.
 * 로그인했으면 DB 값(닉네임·레벨·경험치·방문/미션/배지 수)을, 아니면 mock 을 준다.
 */
export function useUserProfile(): UserProfile {
  const { profile } = useSession();
  return useMemo(() => mergeUserProfile(profile), [profile]);
}
