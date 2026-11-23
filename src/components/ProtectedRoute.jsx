import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./Feedback";

// Wrap routes in <ProtectedRoute roles={["admin"]}>. This only controls what the browser shows;
// the Flask API enforces the same rules again on every request.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState label="Restoring your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/access-denied" replace />;
  return <Outlet />;
}
