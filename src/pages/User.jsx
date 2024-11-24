// UserProfile.js
import React, { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { FaEdit, FaCheck, FaTimes, FaBox, FaInbox, FaTrash } from "react-icons/fa";

// Sidebar component


export default function UserProfile() {
  const { user, updateProfile, authRequest, logout } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState(user || {});

  const toggleEditing = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveChanges = async (field) => {
    try {
      const updatedData = await authRequest(`${import.meta.env.VITE_API_URI}/api/users/${user._id}`, {
        method: "PUT",
        data: { [field]: formData[field] },
      });
      updateProfile(updatedData);
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Error updating user data:", error);
    }
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

  if (!user) {
    return <div className="text-center text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <div className="flex-grow p-6">
        <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg mx-auto">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={user.imageUrl || "/default-avatar.png"}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
              />
              <button
                onClick={() => toggleEditing("imageUrl")}
                className="absolute bottom-2 right-2 bg-gray-800 rounded-full p-2 text-white"
              >
                <FaEdit />
              </button>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {isEditing.firstName ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border p-1 rounded w-full text-center"
                />
              ) : (
                user.firstName
              )}
              {" "}
              {isEditing.lastName ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border p-1 rounded w-full text-center"
                />
              ) : (
                user.lastName
              )}
              <button onClick={() => toggleEditing("firstName")} className="ml-2">
                <FaEdit className="text-gray-500 inline" />
              </button>
            </h2>
          </div>
          <div className="space-y-6 mt-6">
            <EditableField
              label="Username"
              name="userName"
              value={formData.userName}
              isEditing={isEditing.userName}
              toggleEditing={() => toggleEditing("userName")}
              handleChange={handleChange}
              saveChanges={() => saveChanges("userName")}
            />
            <EditableField
              label="Email"
              name="email"
              value={formData.email}
              isEditing={isEditing.email}
              toggleEditing={() => toggleEditing("email")}
              handleChange={handleChange}
              saveChanges={() => saveChanges("email")}
            />
            <EditableField
              label="Address"
              name="address"
              value={`${user.savedAddress?.street}, ${user.savedAddress?.city}`}
              isEditing={isEditing.address}
              toggleEditing={() => toggleEditing("address")}
              handleChange={handleChange}
              saveChanges={() => saveChanges("address")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// EditableField component remains the same as in the previous code example
const EditableField = ({
  label,
  name,
  value,
  isEditing,
  toggleEditing,
  handleChange,
  saveChanges,
}) => {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
      <div className="w-3/4">
        <label className="font-medium text-gray-600">{label}</label>
        {isEditing ? (
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleChange}
            className="border-b mt-1 p-1 w-full text-gray-700 focus:outline-none"
          />
        ) : (
          <p className="text-gray-800 mt-1">{value}</p>
        )}
      </div>
      {isEditing ? (
        <div className="flex space-x-2">
          <button onClick={saveChanges} className="text-green-500 p-1">
            <FaCheck />
          </button>
          <button onClick={toggleEditing} className="text-red-500 p-1">
            <FaTimes />
          </button>
        </div>
      ) : (
        <button onClick={toggleEditing} className="text-gray-500 p-1">
          <FaEdit />
        </button>
      )}
    </div>
  );
};
