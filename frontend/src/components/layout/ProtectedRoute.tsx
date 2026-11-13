import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

interface ProtectedRouteProps {
  adminOnly?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
  requireVerified = false,
}: ProtectedRouteProps) {
  const { user, token } = useAppSelector((s) => s.auth);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (requireVerified) {
    const hasEmail = user.email && !user.isEmailVerified;
    const hasPhone = user.phone && !user.isPhoneVerified;
    if (hasEmail) {
      return <Navigate to="/verify-email" replace />;
    } else if (hasPhone) {
      return <Navigate to="/verify-phone" replace />;
    }
  }

  return <Outlet />;
}