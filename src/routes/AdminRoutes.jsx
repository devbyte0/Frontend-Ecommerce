import { Outlet, useLocation } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const AdminRoutes = () => {
  const { isAuthenticated, loading, refreshToken } = useAdmin();
  const location = useLocation();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    // Additional check for cases where initAuth might not have completed
    if (!isAuthenticated && !loading && localStorage.getItem('adminRefreshToken')) {
      refreshToken().finally(() => {
        setCheckedAuth(true);
      });
    } else {
      setCheckedAuth(true);
    }
  }, [isAuthenticated, loading, refreshToken]);

  if (loading || !checkedAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin" replace state={{ from: location }} />
  );
};

export default AdminRoutes;