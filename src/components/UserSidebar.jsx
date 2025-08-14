import React from "react";
import { FaBox, FaInbox, FaTrash, FaUser } from "react-icons/fa";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const UserSidebar = ({ onDeleteAccount, isOpen }) => (
  <>
    {/* Sidebar visible only md and lg, hidden below md and above lg */}
    

    {/* Mobile Bottom Tab Bar */}
    <nav
      className={`fixed max-md:bottom-[120.5px] md:bottom-[65px] left-0 right-0 bg-white border-t border-gray-200 shadow-md
        flex justify-around items-center h-16  z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      {/* Profile */}
      <Link
        to="/profile"
        className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition"
      >
        <FaUser className="text-xl" />
        <span className="text-xs">Profile</span>
      </Link>

      {/* Orders */}
      <Link
        to="/profile/orders"
        className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 transition"
      >
        <FaBox className="text-xl" />
        <span className="text-xs">Orders</span>
      </Link>

      {/* Inbox (non-link) */}
      <div
        className="flex flex-col items-center justify-center text-gray-700 hover:text-blue-600 cursor-pointer transition"
        role="button"
        tabIndex={0}
        onClick={() => alert("Inbox clicked")}
        onKeyPress={(e) => e.key === "Enter" && alert("Inbox clicked")}
      >
        <FaInbox className="text-xl" />
        <span className="text-xs">Inbox</span>
      </div>

      {/* Delete Account */}
      <button
        onClick={onDeleteAccount}
        className="flex flex-col items-center justify-center text-red-600 hover:text-red-700 transition"
        aria-label="Delete Account"
      >
        <FaTrash className="text-xl" />
        <span className="text-xs">Delete</span>
      </button>
    </nav>
  </>
);

UserSidebar.propTypes = {
  onDeleteAccount: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default UserSidebar;
