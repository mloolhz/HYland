import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RouterError } from "@/components/RouterError";
import {
  CommunityRoute,
  HomeRoute,
  IslandsRoute,
  LoginRoute,
  MissionHubRoute,
  MyPageRoute,
  NotFoundRoute,
  SafetyRoute,
  SignupRoute,
  SportsRoute,
} from "@/routes/ResponsiveRoutes";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CommunityLayout } from "@/layouts/CommunityLayout";
import { ProfileCharacterProvider } from "@/context/ProfileCharacterContext";
import { SessionProvider } from "@/store/session";
import { VisitedIslandsProvider } from "@/store/visited-islands";
import { MissionProgressProvider } from "@/store/mission-progress";
import { RequireAuth } from "@/components/RequireAuth";
import { lazyPage } from "@/routes/lazy-page";
import { resetGuestEphemeralPersistence } from "@/lib/guest-ephemeral-state";
import "./index.css";
import "./styles/auth.css";
import "./styles/community.css";
import "./styles/island.css";
import "./styles/mypage.css";
import "./styles/passport-book.css";
import "./styles/notification.css";
import "./styles/sports.css";
import "./styles/facility-grid.css";
import "./styles/facility-detail.css";
import "./styles/missions.css";
import "./styles/ocean-weather.css";
import "./styles/island-stamp.css";
import "./styles/leaderboard.css";
import "./styles/ai-recommend.css";
import "./styles/island-bti.css";
import "./styles/island-bti-promo.css";
import "./styles/admin.css";
import "./styles/route-fade.css";
import "./styles/safety.css";
import "./styles/legal.css";
// 모바일 전용 화면 (768px 이하)
import "./styles/mobile.css";
import "./styles/mobile-screens.css";
import "./styles/mobile-pages.css";

resetGuestEphemeralPersistence();

const router = createBrowserRouter([
  { path: "/", element: <HomeRoute />, errorElement: <RouterError /> },
  {
    element: <CommunityLayout />,
    errorElement: <RouterError />,
    children: [
      { path: "islands", element: <IslandsRoute /> },
      { path: "island-bti", lazy: lazyPage(() => import("@/pages/IslandBtiIntro"), "IslandBtiIntro") },
      { path: "island-bti/test", lazy: lazyPage(() => import("@/pages/IslandBtiTest"), "IslandBtiTest") },
      { path: "island-bti/result", lazy: lazyPage(() => import("@/pages/IslandBtiResult"), "IslandBtiResult") },
      { path: "missions", element: <MissionHubRoute /> },
      { path: "leaderboard", element: <MissionHubRoute /> },
      { path: "sports", element: <SportsRoute /> },
      { path: "sports/facility/:facilityId", lazy: lazyPage(() => import("@/pages/FacilityDetail"), "FacilityDetail") },
      { path: "safety", element: <SafetyRoute /> },
      { path: "legal/:doc", lazy: lazyPage(() => import("@/pages/LegalDocumentPage"), "LegalDocumentPage") },
      { path: "ai-recommend", lazy: lazyPage(() => import("@/pages/AiRecommend"), "AiRecommend") },
      { path: "community", element: <CommunityRoute /> },
      { path: "community/write", lazy: lazyPage(() => import("@/pages/WritePost"), "WritePost", { auth: true }) },
      { path: "community/my-posts", lazy: lazyPage(() => import("@/pages/MyPostsPage"), "MyPostsPage", { auth: true }) },
      { path: "community/my-comments", lazy: lazyPage(() => import("@/pages/MyCommentsPage"), "MyCommentsPage", { auth: true }) },
      { path: "community/liked", lazy: lazyPage(() => import("@/pages/MyLikedPage"), "MyLikedPage", { auth: true }) },
      { path: "community/me", lazy: lazyPage(() => import("@/pages/MyActivity"), "MyActivity", { auth: true }) },
      { path: "community/users/:userId", lazy: lazyPage(() => import("@/pages/UserProfilePage"), "UserProfilePage") },
      { path: "community/:id", lazy: lazyPage(() => import("@/pages/PostDetail"), "PostDetail") },
      { path: "notifications", lazy: lazyPage(() => import("@/pages/Notifications"), "Notifications") },
      // 검수 권한은 서버가 확인한다 (ADMIN 아니면 403)
      { path: "admin/submissions", lazy: lazyPage(() => import("@/pages/AdminSubmissions"), "AdminSubmissions", { auth: true }) },
      { path: "admin/reports", lazy: lazyPage(() => import("@/pages/AdminReports"), "AdminReports", { auth: true }) },
      { path: "mypage", element: <RequireAuth><MyPageRoute /></RequireAuth> },
      { path: "mypage/settings", lazy: lazyPage(() => import("@/pages/MyPageSettings"), "MyPageSettings", { auth: true }) },
      { path: "mypage/settings/profile", lazy: lazyPage(() => import("@/pages/MyPageProfileEdit"), "MyPageProfileEdit", { auth: true }) },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouterError />,
    children: [
      { path: "login", element: <LoginRoute /> },
      { path: "signup", element: <SignupRoute /> },
      { path: "find-account", lazy: lazyPage(() => import("@/pages/FindAccount"), "FindAccount") },
      // 간편 로그인 — 제공사가 code 를 들고 돌아오는 자리
      { path: "oauth/callback/:provider", lazy: lazyPage(() => import("@/pages/OAuthCallback"), "OAuthCallback") },
      // 간편 로그인으로 처음 가입한 사람의 닉네임 확인
      { path: "signup/nickname", lazy: lazyPage(() => import("@/pages/OAuthNickname"), "OAuthNickname", { auth: true }) },
    ],
  },
  { path: "*", element: <NotFoundRoute /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <VisitedIslandsProvider>
        <MissionProgressProvider>
        <ProfileCharacterProvider>
          <RouterProvider router={router} />
        </ProfileCharacterProvider>
        </MissionProgressProvider>
      </VisitedIslandsProvider>
    </SessionProvider>
  </StrictMode>,
);
