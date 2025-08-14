import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaPhone, FaUserAlt, FaShoppingCart } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

const MobileTabBar = () => {
  const { cartItems } = useContext(CartContext);
  const { isLoggedIn } = useContext(UserContext);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg border-t border-yellow-300 md:hidden flex justify-around z-50 py-1">
      <NavLink
        to="/home"
        className="flex flex-col items-center text-gray-900 hover:text-black px-2 py-1 transition"
        style={{ minWidth: 60 }}
      >
        <FaHome size={22} />
        <span className="text-xs font-semibold">Home</span>
      </NavLink>
      <NavLink
        to="/products"
        className="flex flex-col items-center text-gray-900 hover:text-black px-2 py-1 transition"
        style={{ minWidth: 60 }}
      >
        <FaBoxOpen size={22} />
        <span className="text-xs font-semibold">Products</span>
      </NavLink>
      <NavLink
        to="/contactus"
        className="flex flex-col items-center text-gray-900 hover:text-black px-2 py-1 transition"
        style={{ minWidth: 60 }}
      >
        <FaPhone size={22} />
        <span className="text-xs font-semibold">Contact</span>
      </NavLink>
      <NavLink
        to={isLoggedIn ? "/profile" : "/login"}
        className="flex flex-col items-center text-gray-900 hover:text-black px-2 py-1 transition"
        style={{ minWidth: 60 }}
      >
        <FaUserAlt size={22} />
        <span className="text-xs font-semibold">{isLoggedIn ? "Account" : "Login"}</span>
      </NavLink>
      <NavLink
        to="/cart"
        className="flex flex-col items-center text-gray-900 hover:text-black px-2 py-1 transition relative"
        style={{ minWidth: 60 }}
      >
        <FaShoppingCart size={22} />
        <span className="text-xs font-semibold">Cart</span>
        {cartItems.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow">
            {cartItems.length}
          </span>
        )}
      </NavLink>
    </div>
  );
};

export default MobileTabBar;
