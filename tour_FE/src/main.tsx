import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { Community } from "@/pages/Community";
import { MyActivity } from "@/pages/MyActivity";
import { PostDetail } from "@/pages/PostDetail";
import { Landing } from "@/pages/Landing";
import "./index.css";
import "./styles/community.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "community", element: <Community /> },
      { path: "community/me", element: <MyActivity /> },
      { path: "community/:id", element: <PostDetail /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
