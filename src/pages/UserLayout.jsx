// UserLayout.js
import React, { useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import { FaBars } from "react-icons/fa";
import { UserContext } from "../context/UserContext";

const UserLayout = () => {
  const { authRequest, logout, user } = useContext(UserContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const deleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      try {
        await authRequest(`${import.meta.env.VITE_API_URI}/api/users/${user._id}`, { method: "DELETE" });
        logout();
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  return (
    <div className=" min-h-screen flex bg-gray-100">
      {/* Sidebar Component */}
      <UserSidebar isOpen={isSidebarOpen} onDeleteAccount={deleteAccount} />

      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 md:hidden z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        {/* Mobile Toggle Button */}
        <button
          className="md:hidden fixed top-18 left-0 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg"
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>

        {/* Outlet Content */}
        <div className="flex-grow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
