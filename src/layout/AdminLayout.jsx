import { Outlet } from "react-router-dom";
import { AdminProvider } from "../context/AdminContext";


// Pass the current admin ID to MessageRoomProvider
function AdminLayout() {
  return (
    <AdminProvider>

        <Outlet />
   
    </AdminProvider>
  );
}

export default AdminLayout;
