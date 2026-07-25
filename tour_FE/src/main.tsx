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
import { PostDetail } from "@/pages/PostDetail";
import { Signup } from "@/pages/Signup";
import { IslandExplorer } from "@/pages/IslandExplorer";
import { Missions } from "@/pages/Missions";
import { Leaderboard } from "@/pages/Leaderboard";
import { MyPage } from "@/pages/MyPage";
import { MyPageSettings } from "@/pages/MyPageSettings";
import { MyPageProfileEdit } from "@/pages/MyPageProfileEdit";
import { Sports } from "@/pages/Sports";
import { ReservationList } from "@/pages/ReservationList";
import { ReservationDetail } from "@/pages/ReservationDetail";
import { ReservationCheckout } from "@/pages/ReservationCheckout";
import { ReservationComplete } from "@/pages/ReservationComplete";
import { WritePost } from "@/pages/WritePost";
import { IslandBtiIntro } from "@/pages/IslandBtiIntro";
import { IslandBtiTest } from "@/pages/IslandBtiTest";
import { IslandBtiResult } from "@/pages/IslandBtiResult";
import { ProfileCharacterProvider } from "@/context/ProfileCharacterContext";
import "./index.css";
import "./styles/auth.css";
import "./styles/community.css";
import "./styles/island.css";
import "./styles/mypage.css";
import "./styles/passport-book.css";
import "./styles/notification.css";
import "./styles/sports.css";
import "./styles/reservation.css";
import "./styles/missions.css";
import "./styles/leaderboard.css";
import "./styles/island-bti.css";

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
      { path: "missions", element: <Missions /> },
      { path: "leaderboard", element: <Leaderboard /> },
      { path: "sports", element: <Sports /> },
      { path: "reservation", element: <ReservationList /> },
      { path: "reservation/complete/:reservationId", element: <ReservationComplete /> },
      { path: "reservation/:productId/checkout", element: <ReservationCheckout /> },
      { path: "reservation/:productId", element: <ReservationDetail /> },
      { path: "community", element: <Community /> },
      { path: "community/write", element: <WritePost /> },
      { path: "community/my-posts", element: <MyPostsPage /> },
      { path: "community/my-comments", element: <MyCommentsPage /> },
      { path: "community/liked", element: <MyLikedPage /> },
      { path: "community/me", element: <MyActivity /> },
      { path: "community/:id", element: <PostDetail /> },
      { path: "notifications", element: <Notifications /> },
      { path: "mypage", element: <MyPage /> },
      { path: "mypage/settings", element: <MyPageSettings /> },
      { path: "mypage/settings/profile", element: <MyPageProfileEdit /> },
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
    <ProfileCharacterProvider>
      <RouterProvider router={router} />
    </ProfileCharacterProvider>
  </StrictMode>,
);
