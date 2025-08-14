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

 

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Sidebar Component */}
      <UserSidebar />

     

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col">
        

        {/* Outlet Content */}
        <div className="max-sm:pb-[120px] md:pb-[60px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
