import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RouterError } from "@/components/RouterError";
import { LandingPage } from "@/components/landing/LandingPage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CommunityLayout } from "@/layouts/CommunityLayout";
import { Community } from "@/pages/Community";
import { FindAccount } from "@/pages/FindAccount";
import { Login } from "@/pages/Login";
import { OAuthCallback } from "@/pages/OAuthCallback";
import { OAuthNickname } from "@/pages/OAuthNickname";
import { MyActivity } from "@/pages/MyActivity";
import { MyCommentsPage } from "@/pages/MyCommentsPage";
import { MyLikedPage } from "@/pages/MyLikedPage";
import { MyPostsPage } from "@/pages/MyPostsPage";
import { NotFound } from "@/pages/NotFound";
import { Notifications } from "@/pages/Notifications";
import { UserProfilePage } from "@/pages/UserProfilePage";
import { PostDetail } from "@/pages/PostDetail";
import { Signup } from "@/pages/Signup";
import { IslandExplorer } from "@/pages/IslandExplorer";
import { MissionHub } from "@/pages/MissionHub";
import { MyPage } from "@/pages/MyPage";
import { MyPageSettings } from "@/pages/MyPageSettings";
import { MyPageProfileEdit } from "@/pages/MyPageProfileEdit";
import { AiRecommend } from "@/pages/AiRecommend";
import { Sports } from "@/pages/Sports";
import { FacilityDetail } from "@/pages/FacilityDetail";
import { AdminSubmissions } from "@/pages/AdminSubmissions";
import { WritePost } from "@/pages/WritePost";
import { IslandBtiIntro } from "@/pages/IslandBtiIntro";
import { IslandBtiTest } from "@/pages/IslandBtiTest";
import { IslandBtiResult } from "@/pages/IslandBtiResult";
import { Safety } from "@/pages/Safety";
import { ProfileCharacterProvider } from "@/context/ProfileCharacterContext";
import { SessionProvider } from "@/store/session";
import { VisitedIslandsProvider } from "@/store/visited-islands";
import { MissionProgressProvider } from "@/store/mission-progress";
import { RequireAuth } from "@/components/RequireAuth";
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

const router = createBrowserRouter([
  { path: "/", element: <LandingPage />, errorElement: <RouterError /> },
  {
    element: <CommunityLayout />,
    errorElement: <RouterError />,
    children: [
      { path: "islands", element: <IslandExplorer /> },
      { path: "island-bti", element: <IslandBtiIntro /> },
      { path: "island-bti/test", element: <IslandBtiTest /> },
      { path: "island-bti/result", element: <IslandBtiResult /> },
      { path: "missions", element: <MissionHub /> },
      { path: "leaderboard", element: <MissionHub /> },
      { path: "sports", element: <Sports /> },
      { path: "sports/facility/:facilityId", element: <FacilityDetail /> },
      { path: "safety", element: <Safety /> },
      { path: "ai-recommend", element: <AiRecommend /> },
      { path: "community", element: <Community /> },
      { path: "community/write", element: <RequireAuth><WritePost /></RequireAuth> },
      { path: "community/my-posts", element: <RequireAuth><MyPostsPage /></RequireAuth> },
      { path: "community/my-comments", element: <RequireAuth><MyCommentsPage /></RequireAuth> },
      { path: "community/liked", element: <RequireAuth><MyLikedPage /></RequireAuth> },
      { path: "community/me", element: <RequireAuth><MyActivity /></RequireAuth> },
      { path: "community/users/:userId", element: <UserProfilePage /> },
      { path: "community/:id", element: <PostDetail /> },
      { path: "notifications", element: <Notifications /> },
      // 검수 권한은 서버가 확인한다 (ADMIN 아니면 403)
      { path: "admin/submissions", element: <RequireAuth><AdminSubmissions /></RequireAuth> },
      { path: "mypage", element: <RequireAuth><MyPage /></RequireAuth> },
      { path: "mypage/settings", element: <RequireAuth><MyPageSettings /></RequireAuth> },
      { path: "mypage/settings/profile", element: <RequireAuth><MyPageProfileEdit /></RequireAuth> },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouterError />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "find-account", element: <FindAccount /> },
      // 간편 로그인 — 제공사가 code 를 들고 돌아오는 자리
      { path: "oauth/callback/:provider", element: <OAuthCallback /> },
      // 간편 로그인으로 처음 가입한 사람의 닉네임 확인
      { path: "signup/nickname", element: <RequireAuth><OAuthNickname /></RequireAuth> },
    ],
  },
  { path: "*", element: <NotFound /> },
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
