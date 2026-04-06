import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

/**
 * ProtectedRoute handles both Authentication and Authorization.
 * @param {Array} allowedRoles - An array of roles (e.g., ['owner', 'investor'])
 *                               that are permitted to access the route.
 */
function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useSelector((state) => state.auth);

  // 1. Handle the loading state to prevent flickering or premature redirection
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500 bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium animate-pulse">Securing your session...</p>
      </div>
    );
  }

  // 2. Authentication Check: If no user is logged in, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authorization Check: If allowedRoles is provided, verify the user's role
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // If the user is logged in but has the wrong role, send them to the dashboard
    // We use replace to prevent the user from getting stuck in a back-button loop
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Access Granted
  return <Outlet />;
}

export default ProtectedRoute;
