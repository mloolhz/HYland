import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { Community } from "@/pages/Community";
import { Login } from "@/pages/Login";
import { MyActivity } from "@/pages/MyActivity";
import { PostDetail } from "@/pages/PostDetail";
import { FindAccount } from "@/pages/FindAccount";
import { Signup } from "@/pages/Signup";
import { Landing } from "@/pages/Landing";
import "./index.css";
import "./styles/community.css";
import "./styles/auth.css";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "community", element: <Community /> },
      { path: "community/me", element: <MyActivity /> },
      { path: "community/:id", element: <PostDetail /> },
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
