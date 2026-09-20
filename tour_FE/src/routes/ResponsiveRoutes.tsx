import { useIsMobile } from "@/hooks/useIsMobile";
import { LandingPage } from "@/components/landing/LandingPage";
import { MobileAppShell, MobileAuthRedirect } from "@/mobile/MobileAppShell";
import { MobileHome } from "@/mobile/home/MobileHome";
import { MobileIslands } from "@/mobile/screens/MobileIslands";
import { MobileSports } from "@/mobile/screens/MobileSports";
import { MobileCommunity } from "@/mobile/screens/MobileCommunity";
import { MobileMyPage } from "@/mobile/screens/MobileMyPage";
import { MobileMissions } from "@/mobile/screens/MobileMissions";
import { MobileNotFound } from "@/mobile/screens/MobileNotFound";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { NotFound } from "@/pages/NotFound";
import { IslandExplorer } from "@/pages/IslandExplorer";
import { Sports } from "@/pages/Sports";
import { Community } from "@/pages/Community";
import { MyPage } from "@/pages/MyPage";
import { MissionHub } from "@/pages/MissionHub";

/**
 * 화면 폭에 따라 데스크톱 페이지와 모바일 전용 화면을 갈라 준다.
 * 768px 이하는 반응형으로 줄인 게 아니라 다른 화면을 그린다.
 *
 * 모바일 셸(상단바·탭바·로그인 시트)은 CommunityLayout 이 이미 씌우므로,
 * 그 안에 들어가는 화면들은 여기서 컴포넌트만 바꿔 끼운다.
 */
export function HomeRoute() {
  const isMobile = useIsMobile();

  if (!isMobile) return <LandingPage />;

  return (
    <MobileAppShell>
      <MobileHome />
    </MobileAppShell>
  );
}

export function LoginRoute() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileAuthRedirect mode="login" /> : <Login />;
}

export function SignupRoute() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileAuthRedirect mode="signup" /> : <Signup />;
}

export function IslandsRoute() {
  return useIsMobile() ? <MobileIslands /> : <IslandExplorer />;
}

export function SportsRoute() {
  return useIsMobile() ? <MobileSports /> : <Sports />;
}

export function CommunityRoute() {
  return useIsMobile() ? <MobileCommunity /> : <Community />;
}

export function MyPageRoute() {
  return useIsMobile() ? <MobileMyPage /> : <MyPage />;
}

export function MissionHubRoute() {
  return useIsMobile() ? <MobileMissions /> : <MissionHub />;
}

/** 404 는 어느 레이아웃에도 안 들어가 있어, 모바일에선 셸을 씌워 돌아갈 길을 준다 */
export function NotFoundRoute() {
  const isMobile = useIsMobile();

  if (!isMobile) return <NotFound />;

  return (
    <MobileAppShell>
      <MobileNotFound />
    </MobileAppShell>
  );
}
