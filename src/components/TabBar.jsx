import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaBoxOpen, FaPhone, FaUserAlt, FaShoppingCart } from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext";

const MobileTabBar = () => {
  const { cartItems } = useContext(CartContext);
  const { isLoggedIn } = useContext(UserContext); // Access login status

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t md:hidden flex justify-around z-50 py-2">
      <NavLink to="/home" className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaHome size={24} />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/products" className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaBoxOpen size={24} />
        <span className="text-xs">Products</span>
      </NavLink>
      <NavLink to="/contactus" className="flex flex-col items-center text-gray-600 hover:text-black">
        <FaPhone size={24} />
        <span className="text-xs">Contact Us</span>
      </NavLink>
      <NavLink
        to={isLoggedIn ? "/user/:id" : "/login"}
        className="flex flex-col items-center text-gray-600 hover:text-black"
      >
        <FaUserAlt size={24} />
        <span className="text-xs">{isLoggedIn ? "My Account" : "Login"}</span>
      </NavLink>
      <NavLink to="/cart" className="flex flex-col items-center text-gray-600 hover:text-black relative">
        <FaShoppingCart size={24} />
        <span className="text-xs">Cart</span>
        {cartItems.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-5px",
              right: "-10px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              height: "18px",
              width: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {cartItems.length}
          </div>
        )}
      </NavLink>
    </div>
  );
};

export default MobileTabBar;
