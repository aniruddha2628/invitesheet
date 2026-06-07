
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import PrivateRoute from "./app/components/PrivateRoute";
import Dashboard from "./app/screens/Dashboard";
import ForgotPassword from "./app/screens/ForgotPassword";
import Landing from "./app/screens/Landing";
import Login from "./app/screens/Login";
import Onboarding from "./app/screens/Onboarding";
import Otp from "./app/screens/Otp";
import Register from "./app/screens/Register";
import ResetPassword from "./app/screens/ResetPassword";
import RsvpSheet from "./app/screens/RsvpSheet";
import Settings from "./app/screens/Settings";
import "./styles/index.css";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/otp", element: <Otp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/onboarding", element: <PrivateRoute><Onboarding /></PrivateRoute> },
  { path: "/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: "/dashboard/settings", element: <PrivateRoute><Settings /></PrivateRoute> },
  { path: "/events/:eventId/rsvp", element: <PrivateRoute><RsvpSheet /></PrivateRoute> },
]);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
