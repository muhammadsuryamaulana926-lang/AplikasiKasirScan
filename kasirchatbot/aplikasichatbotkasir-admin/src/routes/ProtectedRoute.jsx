import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const tokenExpires = localStorage.getItem("tokenExpires");

  if (!token || !tokenExpires) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const now = Date.now();
  if (now > parseInt(tokenExpires)) {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpires");
    localStorage.removeItem("userEmail");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
