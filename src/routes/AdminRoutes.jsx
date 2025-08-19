import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useEffect, useState } from "react";

const AdminRoutes = () => {
  const { isAuthenticated, loading, refreshToken } = useAdmin();
  const location = useLocation();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Only attempt refresh if not authenticated and token exists
      if (!isAuthenticated && !loading && localStorage.getItem("adminRefreshToken")) {
        try {
          await refreshToken();
        } catch (err) {
          console.warn("Admin token refresh failed", err);
        }
      }
      setCheckedAuth(true);
    };
    verifyAuth();
  }, [isAuthenticated, loading, refreshToken]);

  if (loading || !checkedAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet /> // Render child admin routes
  ) : (
    <Navigate to="/admin" replace state={{ from: location }} /> // Redirect to login
  );
};

export default AdminRoutes;
