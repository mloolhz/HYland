import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MobileSheet } from "../MobileSheet";
import { LoginSheetBody } from "./LoginSheetBody";
import { SignupSheetBody } from "./SignupSheetBody";

export type AuthMode = "login" | "signup";

type AuthSheetStore = {
  isOpen: boolean;
  mode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const AuthSheetContext = createContext<AuthSheetStore | null>(null);

type AuthNavState = {
  authSheet?: AuthMode;
  authRedirectTo?: string;
};

/**
 * 모바일 로그인/회원가입 — 페이지 이동 대신 바텀시트로 띄운다.
 * 보던 화면을 잃지 않고 로그인하고 바로 이어서 쓸 수 있다.
 */
export function AuthSheetProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [signupStep, setSignupStep] = useState(0);
  /** 로그인에 성공하면 이어서 보낼 곳 (RequireAuth 가 막았던 화면) */
  const redirectRef = useRef<string | null>(null);

  const openAuth = useCallback((next: AuthMode = "login") => {
    setMode(next);
    setSignupStep(0);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsOpen(false), []);

  // /login · /signup 으로 들어온 사람을 홈으로 돌려보낼 때 넘겨준 표시
  useEffect(() => {
    const state = location.state as AuthNavState | null;
    if (!state?.authSheet) return;

    redirectRef.current = state.authRedirectTo ?? null;
    openAuth(state.authSheet);
    // 뒤로가기로 다시 열리지 않게 표시를 지운다
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate, openAuth]);

  const handleAuthed = useCallback(() => {
    setIsOpen(false);
    const target = redirectRef.current;
    redirectRef.current = null;
    if (target && target !== "/") navigate(target, { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({ isOpen, mode, openAuth, closeAuth }),
    [isOpen, mode, openAuth, closeAuth],
  );

  const goSignup = useCallback(() => {
    setMode("signup");
    setSignupStep(0);
  }, []);

  const goLogin = useCallback(() => {
    setMode("login");
    setSignupStep(0);
  }, []);

  return (
    <AuthSheetContext.Provider value={value}>
      {children}
      <MobileSheet
        open={isOpen}
        onClose={closeAuth}
        height={mode === "signup" ? "tall" : "auto"}
        title={mode === "login" ? "로그인" : "회원가입"}
        labelledBy="m-auth-sheet-title"
        onBack={mode === "signup" && signupStep > 0 ? () => setSignupStep((s) => s - 1) : undefined}
      >
        {mode === "login" ? (
          <LoginSheetBody onSwitchToSignup={goSignup} onDone={handleAuthed} />
        ) : (
          <SignupSheetBody
            step={signupStep}
            onStepChange={setSignupStep}
            onSwitchToLogin={goLogin}
            onDone={handleAuthed}
          />
        )}
      </MobileSheet>
    </AuthSheetContext.Provider>
  );
}

export function useAuthSheet(): AuthSheetStore {
  const ctx = useContext(AuthSheetContext);
  if (!ctx) {
    throw new Error("useAuthSheet 는 AuthSheetProvider 안에서만 쓸 수 있어요");
  }
  return ctx;
}
