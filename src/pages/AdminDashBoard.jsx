import AdminNavbar from '../components/AdminNavbar';
import Sidebar from '../components/Sidebar';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';

const AdminDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dark">
      {/* Navbar */}
      <AdminNavbar toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <Outlet/>

      {/* Overlay for Mobile when Sidebar is Open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default AdminDashBoard;