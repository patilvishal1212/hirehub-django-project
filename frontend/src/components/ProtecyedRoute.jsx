/**
 * src/components/ProtectedRoute.jsx
 * ───────────────────────────────────
 * Route guard component. Wraps pages that require authentication or a specific role.
 *
 * USAGE:
 *
 *   // Any logged-in user
 *   <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 *
 *   // Employer only
 *   <Route path="/employer/dashboard" element={
 *     <ProtectedRoute requiredRole="EMPLOYER">
 *       <EmployerDashboard />
 *     </ProtectedRoute>
 *   } />
 *
 *   // Seeker only
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute requiredRole="SEEKER">
 *       <SeekerDashboard />
 *     </ProtectedRoute>
 *   } />
 */

import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({
  children,
  requiredRole = null,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show nothing while session is being restored (prevents flash of redirect)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login, preserving the intended URL
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Logged in but wrong role → redirect to appropriate dashboard
  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath =
      user?.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;