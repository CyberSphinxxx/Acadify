import { Suspense, lazy } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { Loader2 } from "lucide-react"

import DashboardLayout from "@/components/layouts/DashboardLayout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { Toaster } from "sonner"

// Lazy load pages

const TodayPage = lazy(() => import("@/pages/TodayPage"))
const FocusPage = lazy(() => import("@/pages/FocusPage"))
const Schedule = lazy(() => import("@/pages/Schedule"))
const Tasks = lazy(() => import("@/pages/Tasks"))
const Notes = lazy(() => import("@/pages/Notes"))
const LandingPage = lazy(() => import("@/pages/LandingPage"))
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))
const Login = lazy(() => import("@/pages/Login"))

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },

  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TodayPage />
              </Suspense>
            )
          },
          {
            path: "/schedule",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Schedule />
              </Suspense>
            )
          },
          {
            path: "/tasks",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Tasks />
              </Suspense>
            )
          },
          {
            path: "/focus",
            element: (
              <Suspense fallback={<PageLoader />}>
                <FocusPage />
              </Suspense>
            )
          },
          {
            path: "/notes",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Notes />
              </Suspense>
            )
          },
          {
            path: "/profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            )
          },
        ],
      },
    ],
  },
])

function App() {
  // Initialize auth listener
  useAuth();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors />
    </>
  )
}

export default App
