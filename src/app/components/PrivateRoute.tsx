import type { ReactNode } from "react";
import { Navigate } from "react-router";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}
