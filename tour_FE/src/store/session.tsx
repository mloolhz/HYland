/**
 * 로그인 세션 (토큰 + 사용자)
 *
 * 토큰은 localStorage 에 둔다. 새로고침·탭을 닫았다 열어도 로그인이 유지돼야
 * 하고, 서버가 발급한 JWT 유효기간(7일)이 실제 만료 기준이기 때문이다.
 * 앱이 뜰 때 GET /auth/me 로 토큰이 아직 살아 있는지 확인하고, 401 이면 지운다.
 *
 * 기존 sessionStorage 기반 데모 로그인(constants/auth.ts)은 아직 커뮤니티 mock
 * 이 쓰고 있어 남겨 두되, 실제 로그인 여부는 이 스토어가 기준이다.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMe, type AuthUser, type MeResponse } from "@/api/auth";
import { clearDemoLoggedIn, clearGuest, setDemoLoggedIn } from "@/constants/auth";
import { readToken, writeToken } from "@/lib/token";
import { fetchProfile, type ProfileResponse } from "@/api/me";

type SessionStore = {
  user: MeResponse | null;
  /** 여권·마이페이지가 쓰는 프로필 (닉네임·레벨·경험치·활동 통계) */
  profile: ProfileResponse | null;
  token: string | null;
  /** 앱 시작 직후 토큰 확인 중 */
  loading: boolean;
  isLoggedIn: boolean;
  /** 로그인·회원가입 성공 후 호출 */
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => void;
  /** 프로필 변경 등으로 사용자 정보를 다시 읽는다 */
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionStore | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<MeResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
    setProfile(null);
    clearDemoLoggedIn();
    clearGuest();
  }, []);

  const loadMe = useCallback(
    async (t: string) => {
      try {
        const me = await fetchMe(t);
        setUser(me);
        setDemoLoggedIn(); // 아직 mock 을 보는 화면들과 상태를 맞춰 준다
        // 프로필은 실패해도 로그인 자체는 유지한다 (여권 수치만 mock 으로 남음)
        try {
          setProfile(await fetchProfile());
        } catch {
          setProfile(null);
        }
      } catch {
        // 토큰이 만료됐거나 서버가 모르는 토큰 — 조용히 로그아웃
        signOut();
      }
    },
    [signOut],
  );

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    const t = readToken();
    if (!t) {
      setLoading(false);
      return;
    }
    loadMe(t).finally(() => setLoading(false));
  }, [loadMe]);

  const signIn = useCallback(
    async (nextToken: string, nextUser: AuthUser) => {
      writeToken(nextToken);
      setToken(nextToken);
      setDemoLoggedIn();
      // 로그인 응답에는 레벨·경험치가 없어 /auth/me 로 한 번 더 채운다
      try {
        setUser(await fetchMe(nextToken));
      } catch {
        setUser({
          ...nextUser,
          role: "USER",
          level: 1,
          levelTitle: "새싹 탐험가",
          expCurrent: 0,
          expMax: 1000,
        });
      }
      try {
        setProfile(await fetchProfile());
      } catch {
        setProfile(null);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    const t = readToken();
    if (!t) return;
    await loadMe(t);
  }, [loadMe]);

  const value = useMemo<SessionStore>(
    () => ({
      user,
      profile,
      token,
      loading,
      isLoggedIn: Boolean(user),
      signIn,
      signOut,
      refresh,
    }),
    [user, profile, token, loading, signIn, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionStore {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession 은 SessionProvider 안에서만 쓸 수 있어요");
  return ctx;
}
