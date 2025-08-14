import { Outlet } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";

function AdminLayout() {
  return (
    <AdminProvider>
      <Outlet/>
    </AdminProvider>
  );
}

export default AdminLayout;