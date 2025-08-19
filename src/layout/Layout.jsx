"use client";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import MobileTabBar from "../components/TabBar";
import { CartProvider } from "../context/CartContext";
import { UserProvider } from "../context/UserContext";


function Layout() {
  return (
    <UserProvider>

      <CartProvider>
        
          <div className="flex flex-col gap-20 min-h-screen">
            <Navbar />
            <Outlet />
            <MobileTabBar />
          </div>
        
      </CartProvider>

    </UserProvider>
  );
}

export default Layout;
