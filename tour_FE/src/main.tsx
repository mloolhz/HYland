import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LandingPage } from "@/components/landing/LandingPage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { CommunityLayout } from "@/layouts/CommunityLayout";
import { Community } from "@/pages/Community";
import { FindAccount } from "@/pages/FindAccount";
import { Login } from "@/pages/Login";
import { MyActivity } from "@/pages/MyActivity";
import { Notifications } from "@/pages/Notifications";
import { PostDetail } from "@/pages/PostDetail";
import { Signup } from "@/pages/Signup";
import "./index.css";
import "./styles/auth.css";
import "./styles/community.css";
import "./styles/notification.css";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    element: <CommunityLayout />,
    children: [
      { path: "community", element: <Community /> },
      { path: "community/me", element: <MyActivity /> },
      { path: "community/:id", element: <PostDetail /> },
      { path: "notifications", element: <Notifications /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "find-account", element: <FindAccount /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
