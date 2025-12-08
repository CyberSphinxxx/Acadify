import { RouterProvider, createBrowserRouter } from "react-router-dom"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import Dashboard from "@/pages/Dashboard"
import Schedule from "@/pages/Schedule"
import Tasks from "@/pages/Tasks"
import Notes from "@/pages/Notes"
import LandingPage from "@/pages/LandingPage"
import ProfilePage from "@/pages/ProfilePage"
import Login from "@/pages/Login"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/schedule", element: <Schedule /> },
          { path: "/tasks", element: <Tasks /> },
          { path: "/notes", element: <Notes /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
])

function App() {
  // Initialize auth listener
  useAuth();

  return <RouterProvider router={router} />
}

export default App
