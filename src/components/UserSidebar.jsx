import React from "react";
import { FaBox, FaInbox, FaTrash } from "react-icons/fa";
import PropTypes from "prop-types";

const UserSidebar = ({ onDeleteAccount, isOpen }) => (
  <div
    className={`fixed top-18 left-0 w-48 bg-gray-100 p-4 h-full shadow-lg z-50 transition-transform transform ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } md:relative md:translate-x-0 md:min-h-screen`} // Absolute on mobile, relative on desktop
  >
    <h3 className="text-lg font-semibold mt-10 text-gray-800 mb-6">Account</h3>
    <ul className="space-y-4">
      <li className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-500">
        <FaBox className="text-lg" />
        <span>Orders</span>
      </li>
      <li className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-500">
        <FaInbox className="text-lg" />
        <span>Inbox</span>
      </li>
      <li
        onClick={onDeleteAccount}
        className="flex items-center space-x-2 text-red-600 cursor-pointer hover:text-red-700"
      >
        <FaTrash className="text-lg" />
        <span>Delete Account</span>
      </li>
    </ul>
  </div>
);

UserSidebar.propTypes = {
  onDeleteAccount: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default UserSidebar;
