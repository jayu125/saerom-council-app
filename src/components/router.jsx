// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import MobileShell from "./MobileShell";
import NotFoundPage from "../pages/NotFoundPage";
import TestPage from "../pages/test";
import ProtectedRoute from "./protectedRoute";
import LoginPage from "../pages/loginPage";

// const CalendarPage = lazy(() => import("../pages/CalendarPage"));
// const DepartmentPage = lazy(() => import("../pages/departmentPage"));
// const MeetingPage = lazy(() => import("../pages/meetingPage"));
// const MyPage = lazy(() => import("../pages/myPage"));
import CalendarPage from "../pages/CalendarPage";
import DepartmentPage from "../pages/DepartmentPage";
import MyPage from "../pages/MyPage";
import MeetingPage from "../pages/meetingPage";

export const routes = [
  {
    element: (
      <ProtectedRoute>
        <MobileShell />
      </ProtectedRoute>
    ), // 하단 탭 들어있는 공통 레이아웃
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div
                style={{
                  padding: 16,
                  width: 100,
                  height: 100,
                  backgroundColor: "white",
                }}
              >
                로딩중…
              </div>
            }
          >
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: "department",
        element: (
          <Suspense fallback={<div style={{ padding: 16 }}>로딩중…</div>}>
            <DepartmentPage />
          </Suspense>
        ),
      },
      {
        path: "meeting",
        element: (
          <Suspense fallback={<div style={{ padding: 16 }}>로딩중…</div>}>
            <MeetingPage />
          </Suspense>
        ),
      },
      {
        path: "myPage",
        element: (
          <Suspense fallback={<div style={{ padding: 16 }}>로딩중…</div>}>
            <MyPage />
          </Suspense>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "test", element: <TestPage /> },
];

export const router = createBrowserRouter(routes, {
  // 필요 시 basename: "/app"
});
