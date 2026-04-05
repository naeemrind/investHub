import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
