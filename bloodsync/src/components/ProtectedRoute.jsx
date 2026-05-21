import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, roles }) {
  const user = useAuthStore((s) => s.user);
  const isSessionValid = useAuthStore((s) => s.isSessionValid);
  const location = useLocation();

  if (!user || !isSessionValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
