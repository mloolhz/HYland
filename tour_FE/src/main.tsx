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
import { ProfileCharacterProvider } from "@/context/ProfileCharacterContext";
import { SessionProvider } from "@/store/session";
import { VisitedIslandsProvider } from "@/store/visited-islands";
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
    ],
  },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider>
      <VisitedIslandsProvider>
        <ProfileCharacterProvider>
          <RouterProvider router={router} />
        </ProfileCharacterProvider>
      </VisitedIslandsProvider>
    </SessionProvider>
  </StrictMode>,
);
